// Cloudflare Worker entry point for website & Mümin Pusulası API
// Live Remote Config & Assets handler with strict security

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

// Master Admin Security Key
const ADMIN_MASTER_SECRET = "MuminAdmin2026!";
const AUTHORIZED_ADMIN_EMAIL = "mustafakeksinn@gmail.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── API: /api/config ───────────────────────────────────────────────────────
    if (url.pathname === '/api/config') {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
        'Content-Type': 'application/json; charset=utf-8'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      try {
        // 1. GET Request: Android App & Admin Panel read live configuration
        if (request.method === 'GET') {
          let config = { ...DEFAULT_CONFIG, ...(memoryConfig || {}) };

          if (env && env.CONFIG) {
            try {
              const saved = await env.CONFIG.get('app_settings');
              if (saved) {
                config = { ...config, ...JSON.parse(saved) };
              }
            } catch (_) {}
          }

          return new Response(JSON.stringify(config), { headers });
        }

        // 2. POST Request: Admin Panel updates configuration (Strict Security)
        if (request.method === 'POST') {
          const authHeader = request.headers.get('Authorization') || '';
          const customKey = request.headers.get('X-Admin-Key') || '';
          let isAuthorized = false;

          let bearerToken = '';
          if (authHeader.startsWith('Bearer ')) {
            bearerToken = authHeader.substring(7).trim();
          }

          // Güvenlik Doğrulaması: Master Anahtar veya Google OAuth
          if (customKey === ADMIN_MASTER_SECRET || bearerToken === ADMIN_MASTER_SECRET) {
            isAuthorized = true;
          } else if (bearerToken && bearerToken.length > 50) {
            // Google ID Token doğrulaması
            try {
              const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${bearerToken}`);
              if (googleRes.ok) {
                const payload = await googleRes.json();
                if (payload.email && payload.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
                  isAuthorized = true;
                }
              }
            } catch (_) {}
          }

          if (!isAuthorized) {
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

          if (env && env.CONFIG) {
            try {
              await env.CONFIG.put('app_settings', JSON.stringify(newConfig));
            } catch (_) {}
          }

          return new Response(JSON.stringify({ success: true, config: newConfig }), { headers });
        }

        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message, success: false }), { status: 500, headers });
      }
    }

    // ── Static Assets (Web Sitesi, Admin Paneli ve Görseller) ───────────────────
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Mümin Pusulası Web & API", { status: 200 });
  },
};
