// Cloudflare Pages Function: /api/config
// Dynamic App Configuration & Admin Sync with Robust Security & Edge Cache Persistence

let memoryConfig = null;

const DEFAULT_CONFIG = {
  adsEnabled: true,
  bannerAdUnitId: "ca-app-pub-1095649040834648/6353100367",
  ramazanMode: false,
  prayerApiUrl: "https://api.aladhan.com/",
  quranApiUrl: "https://api.quran.com/api/v4/",
  audioCdnUrl: "https://download.quranicaudio.com/quran/",
  deletedWallpaperIds: [],
  customWallpapers: []
};

const AUTHORIZED_ADMIN_EMAIL = "mustafakeksinn@gmail.com";
const GOOGLE_CLIENT_ID = "93580675475-1asn8uudfa8pl2oe4ffg2lnib9o70flq.apps.googleusercontent.com";

let googleKeysCache = { keys: null, expiresAt: 0 };

function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getGoogleKeys(forceRefresh = false) {
  if (!forceRefresh && googleKeysCache.keys && Date.now() < googleKeysCache.expiresAt) {
    return googleKeysCache.keys;
  }
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!res.ok) throw new Error('Google anahtarları alınamadı');
  const data = await res.json();
  googleKeysCache = { keys: data.keys || [], expiresAt: Date.now() + 60 * 60 * 1000 };
  return googleKeysCache.keys;
}

// Google ID Token: imza (RS256), issuer, audience, süre ve e-posta doğrulaması
async function verifyGoogleIdToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  if (header.alg !== 'RS256' || !header.kid) return false;

  let keys = await getGoogleKeys();
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    keys = await getGoogleKeys(true);
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk) return false;

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  if (!valid) return false;

  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  const now = Math.floor(Date.now() / 1000);
  return (
    (payload.iss === 'accounts.google.com' || payload.iss === 'https://accounts.google.com') &&
    payload.aud === GOOGLE_CLIENT_ID &&
    payload.exp > now &&
    payload.email_verified === true &&
    typeof payload.email === 'string' &&
    payload.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
  );
}

async function isRequestAuthorized(request) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7).trim();
  if (!token) return false;
  try {
    return await verifyGoogleIdToken(token);
  } catch (_) {
    return false;
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const canonicalCacheKey = new Request('https://muminpusulasi.keskindev.com/api/config', { method: 'GET' });

  try {
    // 1. GET Request: App & Admin read configuration
    if (request.method === 'GET') {
      let config = { ...DEFAULT_CONFIG, ...(memoryConfig || {}) };

      // A. Cloudflare KV Kontrolü
      if (env && env.CONFIG) {
        try {
          const saved = await env.CONFIG.get('app_settings');
          if (saved) {
            config = { ...config, ...JSON.parse(saved) };
          }
        } catch (_) {}
      } else if (cache) {
        // B. Cloudflare Edge Cache Kontrolü
        try {
          const cached = await cache.match(canonicalCacheKey);
          if (cached) {
            const cachedData = await cached.json();
            config = { ...config, ...cachedData };
          }
        } catch (_) {}
      }

      return new Response(JSON.stringify(config), { headers });
    }

    // 2. POST Request: Admin writes configuration
    if (request.method === 'POST') {
      if (!(await isRequestAuthorized(request))) {
        return new Response(
          JSON.stringify({
            error: 'Oturum geçersiz veya süresi doldu. Lütfen Google ile tekrar giriş yapın.',
            success: false
          }),
          { status: 403, headers }
        );
      }

      const body = await request.json();
      let current = { ...DEFAULT_CONFIG, ...(memoryConfig || {}) };

      if (env && env.CONFIG) {
        try {
          const saved = await env.CONFIG.get('app_settings');
          if (saved) {
            current = { ...current, ...JSON.parse(saved) };
          }
        } catch (_) {}
      } else if (cache) {
        try {
          const cached = await cache.match(canonicalCacheKey);
          if (cached) {
            const cachedData = await cached.json();
            current = { ...current, ...cachedData };
          }
        } catch (_) {}
      }

      const newConfig = {
        ...current,
        adsEnabled: body.adsEnabled !== undefined ? Boolean(body.adsEnabled) : current.adsEnabled,
        bannerAdUnitId: body.bannerAdUnitId ? String(body.bannerAdUnitId).trim() : current.bannerAdUnitId,
        ramazanMode: body.ramazanMode !== undefined ? Boolean(body.ramazanMode) : current.ramazanMode,
        prayerApiUrl: body.prayerApiUrl ? String(body.prayerApiUrl).trim() : current.prayerApiUrl,
        quranApiUrl: body.quranApiUrl ? String(body.quranApiUrl).trim() : current.quranApiUrl,
        audioCdnUrl: body.audioCdnUrl ? String(body.audioCdnUrl).trim() : current.audioCdnUrl,
        deletedWallpaperIds: Array.isArray(body.deletedWallpaperIds) ? body.deletedWallpaperIds : (current.deletedWallpaperIds || []),
        customWallpapers: Array.isArray(body.customWallpapers) ? body.customWallpapers : (current.customWallpapers || [])
      };

      memoryConfig = newConfig;

      // KV'ye kalıcı yaz
      if (env && env.CONFIG) {
        try {
          await env.CONFIG.put('app_settings', JSON.stringify(newConfig));
        } catch (_) {}
      }

      // Edge Cache'e yaz (Isolate'ler arası kalıcılık)
      if (cache) {
        try {
          const cacheRes = new Response(JSON.stringify(newConfig), {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'public, max-age=31536000, s-maxage=31536000'
            }
          });
          if (context.waitUntil) {
            context.waitUntil(cache.put(canonicalCacheKey, cacheRes));
          } else {
            await cache.put(canonicalCacheKey, cacheRes);
          }
        } catch (_) {}
      }

      return new Response(JSON.stringify({ success: true, config: newConfig }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, success: false }), { status: 500, headers });
  }
}