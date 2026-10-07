// Google ID Token (JWT) doğrulaması — imza (RS256), issuer, audience ve süre kontrolü.
// Hem yönetim paneli (tek yetkili e-posta) hem de mobil uygulama (üye kaydı) kullanır.
// Uygulamadaki Android Credential Manager `serverClientId` olarak bu WEB istemci kimliğini
// kullanır, bu yüzden her iki istemcinin token'ında `aud` aynıdır.

export const GOOGLE_CLIENT_ID = '93580675475-1asn8uudfa8pl2oe4ffg2lnib9o70flq.apps.googleusercontent.com';
export const ANDROID_CLIENT_ID = '93580675475-fm4h6qpiudf8sagif8usrkej0n9ra8ft.apps.googleusercontent.com';
export const NEW_CLIENT_ID = '93580675475-p9v9fl8o8fuqm82b52fvo6cc7f6dussg.apps.googleusercontent.com';
export const AUTHORIZED_ADMIN_EMAIL = 'mustafakeksinn@gmail.com';

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

/**
 * Geçerli bir Google ID token ise payload'ı, değilse null döndürür.
 */
export async function verifyGoogleIdToken(token) {
  try {
    if (typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
    if (header.alg !== 'RS256' || !header.kid) return null;

    let keys = await getGoogleKeys();
    let jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      keys = await getGoogleKeys(true);
      jwk = keys.find((k) => k.kid === header.kid);
    }
    if (!jwk) return null;

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
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    const issuerOk = payload.iss === 'accounts.google.com' || payload.iss === 'https://accounts.google.com';
    const audOk = payload.aud === GOOGLE_CLIENT_ID ||
                  payload.aud === ANDROID_CLIENT_ID ||
                  payload.aud === NEW_CLIENT_ID ||
                  (typeof payload.aud === 'string' && payload.aud.startsWith('93580675475-'));
    if (!issuerOk || !audOk || !(payload.exp > now)) return null;
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
    if (payload.email_verified !== true) return null;

    return payload;
  } catch (_) {
    return null;
  }
}

export async function isAdminRequest(request) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const payload = await verifyGoogleIdToken(authHeader.substring(7).trim());
  return !!payload && payload.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}
