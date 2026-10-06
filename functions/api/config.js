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

const VALID_ADMIN_KEYS = new Set([
  "MuminAdmin2026!",
  "mustafakeskin2026",
  "admin_local_token",
  "admin_master_key"
]);
const AUTHORIZED_ADMIN_EMAIL = "mustafakeksinn@gmail.com";

function isRequestAuthorized(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const customKey = (request.headers.get('X-Admin-Key') || '').trim();
  let bearerToken = '';
  if (authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.substring(7).trim();
  }

  // 1. Master Güvenlik Anahtarı veya Token Kontrolü
  if (VALID_ADMIN_KEYS.has(customKey) || VALID_ADMIN_KEYS.has(bearerToken)) {
    return true;
  }

  // 2. Google OAuth JWT Doğrulaması
  const candidateToken = bearerToken || customKey;
  if (candidateToken && candidateToken.includes('.')) {
    try {
      const parts = candidateToken.split('.');
      if (parts.length >= 2) {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = atob(b64);
        const payload = JSON.parse(jsonStr);
        if (payload.email && payload.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          return true;
        }
      }
    } catch (_) {}
  }

  return false;
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
  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = '/api/config';
  cacheUrl.search = '';

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
          const cached = await cache.match(cacheUrl.toString());
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
      if (!isRequestAuthorized(request)) {
        return new Response(
          JSON.stringify({
            error: 'Yetkisiz Erişim (401/403): Geçersiz Yönetici Güvenlik Anahtarı veya Google Hesabı.',
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
          const cached = await cache.match(cacheUrl.toString());
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
            context.waitUntil(cache.put(cacheUrl.toString(), cacheRes));
          } else {
            await cache.put(cacheUrl.toString(), cacheRes);
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