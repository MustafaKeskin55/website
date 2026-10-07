// Üyelik: mobil uygulama kayıtları (Google ile giriş) ve yönetim paneli istatistikleri — Cloudflare D1.

import { verifyGoogleIdToken, isAdminRequest } from './google.js';
import { buildWelcomeEmail, normalizeLang, sendViaResend, cleanName } from './email.js';

const TR_OFFSET_SEC = 3 * 3600; // Günlük gruplama Türkiye saatine göre
const MAX_REGISTER_BODY = 8 * 1024;

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}

function clip(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .trim()
    .slice(0, max);
}

async function sendWelcome(env, member) {
  const mail = buildWelcomeEmail(member.language, member.name);
  const ok = await sendViaResend(env, {
    to: member.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    idempotencyKey: `welcome-${member.google_sub}`
  });
  await env.DB.prepare('UPDATE members SET welcome_status = ?1, welcome_sent_at = ?2 WHERE google_sub = ?3')
    .bind(ok ? 'sent' : 'failed', ok ? Math.floor(Date.now() / 1000) : null, member.google_sub)
    .run();
}

// POST /api/members/google  { idToken, language, appVersion, device }
export async function handleRegister(request, env, ctx, headers) {
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405, headers);
  if (!env.DB) return json({ error: 'Veritabanı yapılandırılmamış', success: false }, 503, headers);

  const declared = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declared) && declared > MAX_REGISTER_BODY) {
    return json({ error: 'payload_too_large', success: false }, 413, headers);
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_REGISTER_BODY) return json({ error: 'payload_too_large', success: false }, 413, headers);
    body = JSON.parse(raw);
  } catch (_) {
    return json({ error: 'invalid_request', success: false }, 400, headers);
  }

  const payload = await verifyGoogleIdToken(body && body.idToken);
  if (!payload) return json({ error: 'unauthorized', success: false }, 401, headers);

  const now = Math.floor(Date.now() / 1000);
  const sub = payload.sub;
  const email = payload.email.toLowerCase();
  const name = cleanName(payload.name || '');
  const picture = clip(payload.picture, 500);
  const language = normalizeLang(body.language);
  const appVersion = clip(body.appVersion, 20);
  const device = clip(body.device, 60);
  const country = clip((request.cf && request.cf.country) || '', 2) || null;

  const insert = await env.DB.prepare(
    `INSERT OR IGNORE INTO members
       (google_sub, email, name, picture, language, country, app_version, device, created_at, last_login_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)`
  )
    .bind(sub, email, name, picture, language, country, appVersion, device, now)
    .run();

  const isNew = !!(insert.meta && insert.meta.changes > 0);

  if (!isNew) {
    await env.DB.prepare(
      `UPDATE members SET
         email = ?2, name = ?3, picture = ?4, language = ?5,
         country = COALESCE(?6, country), app_version = ?7, device = ?8,
         last_login_at = ?9, login_count = login_count + 1
       WHERE google_sub = ?1`
    )
      .bind(sub, email, name, picture, language, country, appVersion, device, now)
      .run();
  }

  // Hoş geldin e-postası: yeni üyede, ya da önceki gönderim başarısız/bekliyorsa tekrar dene.
  let welcomeQueued = false;
  if (env.RESEND_API_KEY) {
    const row = await env.DB.prepare('SELECT welcome_status FROM members WHERE google_sub = ?1').bind(sub).first();
    if (row && row.welcome_status !== 'sent') {
      welcomeQueued = true;
      const job = sendWelcome(env, { google_sub: sub, email, name, language });
      if (ctx && ctx.waitUntil) ctx.waitUntil(job);
      else await job;
    }
  }

  return json({ success: true, isNew, welcomeQueued }, 200, headers);
}

// GET /api/admin/members/summary
async function summary(env, headers) {
  const now = Math.floor(Date.now() / 1000);
  const nowTr = now + TR_OFFSET_SEC;
  const startToday = nowTr - (nowTr % 86400) - TR_OFFSET_SEC;
  const start7 = startToday - 6 * 86400;
  const start30 = startToday - 29 * 86400;

  const [totals, daily, langs, countries] = await env.DB.batch([
    env.DB.prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN created_at >= ?1 THEN 1 ELSE 0 END) AS today,
         SUM(CASE WHEN created_at >= ?2 THEN 1 ELSE 0 END) AS last7,
         SUM(CASE WHEN created_at >= ?3 THEN 1 ELSE 0 END) AS last30,
         SUM(CASE WHEN last_login_at >= ?1 THEN 1 ELSE 0 END) AS activeToday,
         SUM(CASE WHEN welcome_status != 'sent' THEN 1 ELSE 0 END) AS welcomePending
       FROM members`
    ).bind(startToday, start7, start30),
    env.DB.prepare(
      `SELECT date(created_at + ?2, 'unixepoch') AS d, COUNT(*) AS c
       FROM members WHERE created_at >= ?1 GROUP BY d`
    ).bind(start30, TR_OFFSET_SEC),
    env.DB.prepare('SELECT language AS k, COUNT(*) AS c FROM members GROUP BY language ORDER BY c DESC LIMIT 8'),
    env.DB.prepare(
      'SELECT country AS k, COUNT(*) AS c FROM members WHERE country IS NOT NULL GROUP BY country ORDER BY c DESC LIMIT 8'
    )
  ]);

  const t = (totals.results && totals.results[0]) || {};
  const byDay = new Map((daily.results || []).map((r) => [r.d, r.c]));
  const series = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date((start30 + i * 86400 + TR_OFFSET_SEC) * 1000).toISOString().slice(0, 10);
    series.push({ date: d, count: byDay.get(d) || 0 });
  }

  return json(
    {
      total: t.total || 0,
      today: t.today || 0,
      last7: t.last7 || 0,
      last30: t.last30 || 0,
      activeToday: t.activeToday || 0,
      welcomePending: t.welcomePending || 0,
      daily: series,
      languages: langs.results || [],
      countries: countries.results || []
    },
    200,
    headers
  );
}

// GET /api/admin/members?q=&limit=&offset=
async function list(url, env, headers) {
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100);

  let where = '';
  const binds = [];
  if (q) {
    const like = '%' + q.replace(/[\\%_]/g, (m) => '\\' + m) + '%';
    where = "WHERE email LIKE ?1 ESCAPE '\\' OR name LIKE ?1 ESCAPE '\\'";
    binds.push(like);
  }

  const countStmt = env.DB.prepare(`SELECT COUNT(*) AS n FROM members ${where}`).bind(...binds);
  const listStmt = env.DB.prepare(
    `SELECT id, email, name, picture, language, country, app_version, created_at, last_login_at, login_count, welcome_status
     FROM members ${where}
     ORDER BY created_at DESC, id DESC
     LIMIT ${limit} OFFSET ${offset}`
  ).bind(...binds);

  const [count, rows] = await env.DB.batch([countStmt, listStmt]);
  return json(
    { total: (count.results[0] && count.results[0].n) || 0, items: rows.results || [], limit, offset },
    200,
    headers
  );
}

export async function handleAdminMembers(request, url, env, headers) {
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'GET') return json({ error: 'Method Not Allowed' }, 405, headers);
  if (!(await isAdminRequest(request))) {
    return json({ error: 'Oturum geçersiz veya süresi doldu. Lütfen Google ile tekrar giriş yapın.', success: false }, 403, headers);
  }
  if (!env.DB) return json({ error: 'Veritabanı yapılandırılmamış (D1 bağlantısı yok).', success: false }, 503, headers);

  if (url.pathname === '/api/admin/members/summary') return summary(env, headers);
  if (url.pathname === '/api/admin/members') return list(url, env, headers);
  return json({ error: 'Not Found' }, 404, headers);
}
