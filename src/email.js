// Hoş geldin e-postası (Resend) — cihaz diline göre: tr, en, ar, az. Diğer diller İngilizceye düşer.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Mümin Pusulası <destek@muminpusulasi.com>';

export const SUPPORTED_EMAIL_LANGS = ['tr', 'en', 'ar', 'az'];

// "tr-TR", "ar_SA", "AZ" gibi değerleri desteklenen dile indirger.
export function normalizeLang(raw) {
  const base = String(raw || '').toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_EMAIL_LANGS.includes(base) ? base : 'en';
}

const COPY = {
  tr: {
    dir: 'ltr',
    subject: "Mümin Pusulası ailesine hoş geldiniz",
    greeting: (n) => `Selamün aleyküm${n ? ' ' + n : ''},`,
    intro: "Mümin Pusulası'na katıldığınız için çok mutluyuz. Hesabınız başarıyla oluşturuldu.",
    listTitle: 'Sizi neler bekliyor:',
    items: [
      'Konumunuza göre ezan vakitleri ve hatırlatmalar',
      'Kıble pusulası',
      "Kur'an-ı Kerim, zikir ve ibadet takibi",
      'Dini günler ve geceler takvimi, İslami duvar kağıtları'
    ],
    closing: 'Her türlü soru, öneri ve geri bildiriminiz için uygulamadaki "Bize Ulaşın" bölümünden bize yazabilirsiniz. Allah ibadetlerinizi kabul etsin.',
    footer: 'Bu e-postayı, Mümin Pusulası uygulamasında Google ile giriş yaptığınız için aldınız.'
  },
  en: {
    dir: 'ltr',
    subject: 'Welcome to the Mümin Pusulası family',
    greeting: (n) => `As-salamu alaykum${n ? ' ' + n : ''},`,
    intro: 'We are delighted to have you with us. Your Mümin Pusulası account has been created successfully.',
    listTitle: 'What awaits you:',
    items: [
      'Prayer times and reminders based on your location',
      'Qibla compass',
      'Holy Quran, dhikr and worship tracking',
      'Islamic calendar of special days and nights, plus wallpapers'
    ],
    closing: 'For any question, suggestion or feedback, you can write to us from the "Contact Us" section in the app. May Allah accept your worship.',
    footer: 'You received this email because you signed in with Google in the Mümin Pusulası app.'
  },
  ar: {
    dir: 'rtl',
    subject: 'مرحباً بك في Mümin Pusulası (بوصلة المؤمن)',
    greeting: (n) => `السلام عليكم${n ? ' ' + n : ''}،`,
    intro: 'يسعدنا انضمامك إلى تطبيق «بوصلة المؤمن». تم إنشاء حسابك بنجاح.',
    listTitle: 'ما ينتظرك في التطبيق:',
    items: [
      'مواقيت الأذان والتنبيهات بحسب موقعك',
      'بوصلة القبلة',
      'القرآن الكريم والأذكار ومتابعة العبادات',
      'تقويم الأيام والليالي الدينية وخلفيات إسلامية'
    ],
    closing: 'لأي سؤال أو اقتراح أو ملاحظة، يمكنك مراسلتنا من قسم «اتصل بنا» داخل التطبيق. تقبّل الله طاعاتكم.',
    footer: 'وصلتك هذه الرسالة لأنك سجّلت الدخول بحساب Google في تطبيق بوصلة المؤمن.'
  },
  az: {
    dir: 'ltr',
    subject: 'Mümin Pusulası ailəsinə xoş gəlmisiniz',
    greeting: (n) => `Salamün əleyküm${n ? ' ' + n : ''},`,
    intro: 'Mümin Pusulası-na qoşulduğunuz üçün çox şadıq. Hesabınız uğurla yaradıldı.',
    listTitle: 'Sizi nələr gözləyir:',
    items: [
      'Məkanınıza görə azan vaxtları və xatırlatmalar',
      'Qiblə kompası',
      'Qurani-Kərim, zikr və ibadət izləmə',
      'Dini günlər və gecələr təqvimi, İslami divar kağızları'
    ],
    closing: 'Hər hansı sual, təklif və ya rəyiniz üçün tətbiqdəki "Bizimlə əlaqə" bölməsindən yaza bilərsiniz. Allah ibadətlərinizi qəbul etsin.',
    footer: 'Bu e-poçtu Mümin Pusulası tətbiqində Google ilə daxil olduğunuz üçün aldınız.'
  }
};

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Ad alanı e-posta başlığına/HTML'e gireceği için kontrol karakterleri atılır, uzunluk sınırlanır.
export function cleanName(raw) {
  return String(raw || '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

export function buildWelcomeEmail(langRaw, rawName) {
  const lang = normalizeLang(langRaw);
  const c = COPY[lang];
  const name = cleanName(rawName).split(' ')[0] || '';
  const align = c.dir === 'rtl' ? 'right' : 'left';
  const bulletSide = c.dir === 'rtl' ? 'right' : 'left';

  const items = c.items
    .map(
      (i) =>
        `<li style="margin:0 0 6px;padding-${bulletSide}:2px">${esc(i)}</li>`
    )
    .join('');

  const html = `<!doctype html><html lang="${lang}" dir="${c.dir}"><body style="margin:0;padding:24px;background:#f3f6f5;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dfe8e4">
<div style="background:#0f3628;padding:26px 24px;text-align:center">
<div style="color:#f3c74c;font-size:22px;font-weight:700;letter-spacing:.3px">Mümin Pusulası</div>
<div style="color:#a6bcb5;font-size:15px;margin-top:6px;font-family:'Amiri',serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
</div>
<div style="padding:26px 26px 22px;color:#1a2b25;font-size:15px;line-height:1.65;text-align:${align}">
<p style="margin:0 0 14px;font-weight:600;font-size:17px">${esc(c.greeting(name))}</p>
<p style="margin:0 0 16px">${esc(c.intro)}</p>
<p style="margin:0 0 8px;font-weight:600;color:#0f3628">${esc(c.listTitle)}</p>
<ul style="margin:0 0 18px;padding-${bulletSide}:20px">${items}</ul>
<p style="margin:0 0 6px">${esc(c.closing)}</p>
</div>
<div style="padding:14px 26px 20px;border-top:1px solid #eef3f1;color:#6b837b;font-size:12px;text-align:${align}">${esc(c.footer)}</div>
</div></body></html>`;

  const text = [
    c.greeting(name),
    '',
    c.intro,
    '',
    c.listTitle,
    ...c.items.map((i) => `• ${i}`),
    '',
    c.closing,
    '',
    '— Mümin Pusulası',
    c.footer
  ].join('\n');

  return { subject: c.subject, html, text, lang };
}

export async function sendViaResend(env, { to, subject, html, text, idempotencyKey }) {
  if (!env || !env.RESEND_API_KEY) return false;
  try {
    const headers = {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    };
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: env.MAIL_FROM || DEFAULT_FROM,
        to: [to],
        subject,
        html,
        text
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      console.error('resend_error', res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error('resend_fetch_failed', err && err.name);
    return false;
  }
}
