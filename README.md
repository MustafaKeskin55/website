# Mümin Pusulası - Web Tanıtım Sitesi (keskindev.com & Cloudflare Pages)

Bu klasör (`c:\Mümin Pusulası\website`), **Mümin Pusulası** Android mobil uygulamasının resmi modern web tanıtım sitesidir.

---

## 🚀 Cloudflare Pages'a Yükleme & keskindev.com Bağlama

Bu web sitesi saf HTML5, modern CSS3 ve Vanilla JS ile hazırlandığı için herhangi bir karmaşık derleme işlemine (`npm run build`) ihtiyaç duymaz. Doğrudan statik olarak yayınlanır.

### Yöntem 1: Cloudflare Dashboard Üzerinden (Sürükle & Bırak - 1 Dakika)

1. [Cloudflare Dashboard](https://dash.cloudflare.com)'a giriş yapın.
2. Sol menüden **Workers & Pages** > **Overview** bölümüne gidin.
3. **Create Application** > **Pages** sekmesini seçin.
4. **Upload assets** seçeneğine tıklayın.
5. Proje adını girin (Örnek: `muminpusulasi`).
6. `c:\Mümin Pusulası\website` klasörünün içindeki tüm dosyaları (index.html, style.css, script.js, _headers, images klasörü vb.) sayfaya sürükleyip bırakın.
7. **Deploy Site** butonuna basın. Siteniz saniyeler içinde yayına girer!

---

### Yöntem 2: Özel Domain (keskindev.com) Bağlama

1. Cloudflare Pages panelinde projenizin içine girin.
2. Üst menüden **Custom Domains** sekmesine tıklayın.
3. **Set up a custom domain** butonuna basın.
4. İstediğiniz alan adını yazın:
   - Ana domain için: `keskindev.com`
   - Veya alt domain için: `muminpusulasi.keskindev.com`
5. **Continue** ve ardından **Activate domain** butonuna tıklayın.
6. Cloudflare DNS kayıtlarını ve SSL sertifikasını otomatik olarak saniyeler içinde tamamlayacaktır.

---

### Yöntem 3: Terminalden Wrangler CLI ile Dağıtım

Eğer terminalden tek komutla yüklemek isterseniz:

```powershell
cd "c:\Mümin Pusulası\website"
npx wrangler pages deploy . --project-name=muminpusulasi
```

---

## 📂 Dosya Yapısı

- `index.html` : Semantik, SEO ve Google Play uyumlu modern tanıtım sayfası.
- `style.css` : Zümrüt yeşili & altın varak detaylı lüks İslami tasarım sistemi (Glassmorphism, 3D telefon mockup, mikro animasyonlar).
- `script.js` : Canlı namaz vakti halka sayacı, şehir seçici, haptik kıble simülasyonu, WhatsApp ayet paylaşımı, galeri slaytı ve akordeon SSS.
- `_headers` : Cloudflare Pages güvenlik ve cache başlıkları.
- `app-ads.txt` : Google AdMob yayıncı doğrulama dosyası.
- `images/` : Uygulama logosu, ikonları ve mağaza ekran görüntüleri.
