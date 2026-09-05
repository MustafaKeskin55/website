/**
 * MÜMİN PUSULASI - İNTERAKTİF WEB TANITIM SCRİPTİ
 * Cloudflare Pages & keskindev.com Uyumlu
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLivePrayerDemo();
  initSpiritualTabsAndShare();
  initCompassSimulation();
  initScreenshotsCarousel();
  initFaqAccordion();
  initModals();
});

/* ==========================================================================
   1. NAVBAR & MOBİL MENÜ
   ========================================================================== */
function initNavbar() {
  const header = document.getElementById('header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mainNav = document.getElementById('main-nav');
  const closeBtn = document.getElementById('mobile-close-btn');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-action-btn');

  // Sayfa kaydırma efekti
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  function openMobileMenu() {
    mainNav?.classList.add('open');
    backdrop?.classList.add('open');
    hamburgerBtn?.classList.add('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    mainNav?.classList.remove('open');
    backdrop?.classList.remove('open');
    hamburgerBtn?.classList.remove('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  // Hamburger Toggle
  hamburgerBtn?.addEventListener('click', () => {
    if (mainNav?.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Kapatma butonu ve backdrop tıklaması
  closeBtn?.addEventListener('click', closeMobileMenu);
  backdrop?.addEventListener('click', closeMobileMenu);

  // Link tıklandığında menüyü kapat
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // ESC tuşu ile kapatma
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav?.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}

/* ==========================================================================
   2. CANLI NAMAZ VAKİTLERİ & HALKA SAYAÇ SİMÜLASYONU
   ========================================================================== */
function initLivePrayerDemo() {
  const citySelect = document.getElementById('city-select');
  const timerDigits = document.getElementById('live-timer-digits');
  const progressCircle = document.getElementById('progress-circle');
  const prayerSub = document.getElementById('current-prayer-sub');
  const heroChipTime = document.getElementById('hero-chip-time');

  // Şehir Bazlı Vakit Verileri (Hassas Astronomik Hesaplama Standartları)
  const cityData = {
    istanbul: {
      imsak: '05:14', gunes: '06:41', ogle: '13:12', ikindi: '16:48', aksam: '19:34', yatsi: '20:56',
      targetPrayer: 'İkindi', remainingSeconds: 6135, totalPrayerSeconds: 12960
    },
    ankara: {
      imsak: '05:00', gunes: '06:26', ogle: '12:57', ikindi: '16:34', aksam: '19:19', yatsi: '20:40',
      targetPrayer: 'İkindi', remainingSeconds: 5280, totalPrayerSeconds: 13020
    },
    izmir: {
      imsak: '05:24', gunes: '06:49', ogle: '13:20', ikindi: '16:56', aksam: '19:41', yatsi: '21:01',
      targetPrayer: 'İkindi', remainingSeconds: 6600, totalPrayerSeconds: 12960
    },
    bursa: {
      imsak: '05:15', gunes: '06:41', ogle: '13:12', ikindi: '16:48', aksam: '19:33', yatsi: '20:54',
      targetPrayer: 'İkindi', remainingSeconds: 6120, totalPrayerSeconds: 12960
    },
    konya: {
      imsak: '05:05', gunes: '06:29', ogle: '13:00', ikindi: '16:36', aksam: '19:20', yatsi: '20:39',
      targetPrayer: 'İkindi', remainingSeconds: 5400, totalPrayerSeconds: 12960
    },
    mekke: {
      imsak: '05:02', gunes: '06:21', ogle: '12:28', ikindi: '15:51', aksam: '18:34', yatsi: '20:04',
      targetPrayer: 'İkindi', remainingSeconds: 7800, totalPrayerSeconds: 12180
    },
    medine: {
      imsak: '05:05', gunes: '06:25', ogle: '12:30', ikindi: '15:52', aksam: '18:34', yatsi: '20:04',
      targetPrayer: 'İkindi', remainingSeconds: 7920, totalPrayerSeconds: 12120
    }
  };

  let currentCity = 'istanbul';
  let remainingSeconds = cityData[currentCity].remainingSeconds;
  const circumference = 2 * Math.PI * 85; // r = 85 => ~534.07

  function updateCityTimes(city) {
    const data = cityData[city];
    if (!data) return;

    document.getElementById('t-imsak').textContent = data.imsak;
    document.getElementById('t-gunes').textContent = data.gunes;
    document.getElementById('t-ogle').textContent = data.ogle;
    document.getElementById('t-ikindi').textContent = data.ikindi;
    document.getElementById('t-aksam').textContent = data.aksam;
    document.getElementById('t-yatsi').textContent = data.yatsi;

    prayerSub.textContent = `${data.targetPrayer} Vaktine Kalan`;
    remainingSeconds = data.remainingSeconds;
  }

  function formatTime(seconds) {
    seconds = Math.max(0, seconds);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function tickTimer() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
    } else {
      remainingSeconds = 3600; // Döngüsel demo
    }

    const formatted = formatTime(remainingSeconds);
    if (timerDigits) timerDigits.textContent = formatted;
    if (heroChipTime) heroChipTime.textContent = `${formatted} Kaldı`;

    // SVG Halka İlerlemesi
    if (progressCircle) {
      const data = cityData[currentCity];
      const progressFraction = remainingSeconds / (data ? data.totalPrayerSeconds : 12960);
      const offset = circumference * (1 - progressFraction);
      progressCircle.style.strokeDashoffset = offset;
    }
  }

  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      currentCity = e.target.value;
      updateCityTimes(currentCity);
    });
  }

  // İlk çalıştırma ve saniyelik interval
  updateCityTimes(currentCity);
  tickTimer();
  setInterval(tickTimer, 1000);
}

/* ==========================================================================
   3. GÜNÜN MANEVİYATI (AYET / HADİS / DUA) & WHATSAPP PAYLAŞIMI
   ========================================================================== */
function initSpiritualTabsAndShare() {
  const tabs = document.querySelectorAll('.spiritual-tab-btn');
  const panes = document.querySelectorAll('.spiritual-content-box .tab-pane');
  const whatsappBtn = document.getElementById('share-whatsapp-btn');
  const copyBtn = document.getElementById('copy-quote-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(`pane-${tab.dataset.tab}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  function getActiveSpiritualText() {
    const activePane = document.querySelector('.spiritual-content-box .tab-pane.active');
    if (!activePane) return '';

    const arabic = activePane.querySelector('.arabic-script')?.textContent || '';
    const meal = activePane.querySelector('.meal-text')?.textContent || '';
    const source = activePane.querySelector('.source-tag')?.textContent || '';

    return `✨ *Mümin Pusulası - Günün Maneviyatı*\n\n${arabic}\n\n${meal}\n\n📍 ${source}\n\n📲 *Mümin Pusulası Uygulamasını İndirin:* https://muminpusulasi.keskindev.com`;
  }

  // WhatsApp Paylaşım
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const text = getActiveSpiritualText();
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  }

  // Metni Panoya Kopyalama
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = getActiveSpiritualText();
      try {
        await navigator.clipboard.writeText(text);
        if (copyBtnText) {
          const original = copyBtnText.textContent;
          copyBtnText.textContent = 'Kopyalandı! ✓';
          setTimeout(() => {
            copyBtnText.textContent = original;
          }, 2000);
        }
      } catch (err) {
        console.error('Kopyalama hatası:', err);
      }
    });
  }
}

/* ==========================================================================
   4. İNTERAKTİF KIBLE PUSULASI SİMÜLASYONU
   ========================================================================== */
function initCompassSimulation() {
  const compassWrapper = document.getElementById('compass-wrapper');
  const compassDial = document.getElementById('compass-dial');
  const compassGlow = document.getElementById('compass-glow');
  const angleBadge = document.getElementById('compass-angle-text');

  if (!compassWrapper || !compassDial) return;

  const targetQibla = 162; // Hedef Kâbe Açısı (İstanbul için ~162°)

  // Mouse veya dokunma hareketiyle pusulayı test etme
  function handleRotate(clientX, clientY) {
    const rect = compassWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    let deg = Math.round(rad * (180 / Math.PI)) + 90;
    if (deg < 0) deg += 360;

    // Kadranı çevir
    compassDial.style.transform = `rotate(${-deg}deg)`;

    // Kıble açısına hizalanma kontrolü (± 6 derece tolerans)
    const diff = Math.abs(deg - targetQibla);
    if (diff <= 6 || diff >= 354) {
      if (compassGlow) compassGlow.style.opacity = '1';
      if (angleBadge) {
        angleBadge.textContent = '✓ 162° Kâbe Hizalandı (Haptik Titreşim)';
        angleBadge.style.borderColor = '#10B981';
        angleBadge.style.color = '#34D399';
      }
    } else {
      if (compassGlow) compassGlow.style.opacity = '0.3';
      if (angleBadge) {
        angleBadge.textContent = `${deg}° Pusula Açısı (Hedef: 162°)`;
        angleBadge.style.borderColor = 'rgba(212, 175, 55, 0.4)';
        angleBadge.style.color = '#D4AF37';
      }
    }
  }

  // Masaüstü fare takibi (fare pusula üzerine geldiğinde)
  compassWrapper.addEventListener('mousemove', (e) => {
    handleRotate(e.clientX, e.clientY);
  });

  // Mobil dokunma
  compassWrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      handleRotate(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Fare ayrıldığında orijinal Kıble açısına geri dön
  compassWrapper.addEventListener('mouseleave', () => {
    compassDial.style.transform = 'rotate(0deg)';
    if (angleBadge) {
      angleBadge.textContent = '162° Kâbe Hizası';
      angleBadge.style.borderColor = '#10B981';
      angleBadge.style.color = '#34D399';
    }
  });
}

/* ==========================================================================
   5. EKRAN GÖRÜNTÜLERİ CAROUSEL / SLIDER
   ========================================================================== */
function initScreenshotsCarousel() {
  const track = document.getElementById('carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const tabs = document.querySelectorAll('.screenshots-tabs .screen-tab');
  const dots = document.querySelectorAll('#carousel-dots .dot');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const maxIndex = slides.length - 1;
  let autoSlideTimer = null;

  function goToSlide(index) {
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;

    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Sekmeleri güncelle
    tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === currentIndex);
    });

    // Noktaları güncelle
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      resetAutoSlide();
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.screen, 10);
      goToSlide(idx);
      resetAutoSlide();
    });
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      goToSlide(idx);
      resetAutoSlide();
    });
  });

  // Otomatik slayt geçişi (6 saniye)
  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  startAutoSlide();
}

/* ==========================================================================
   6. SIKÇA SORULAN SORULAR (FAQ ACCORDION)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Diğerlerini kapat
      faqItems.forEach(other => other.classList.remove('active'));

      // Tıklananı aç/kapat
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   7. MODALLAR (GİZLİLİK, KULLANICI SÖZLEŞMESİ & QR KOD)
   ========================================================================== */
function initModals() {
  const privacyModal = document.getElementById('privacy-modal');
  const termsModal = document.getElementById('terms-modal');
  const qrModal = document.getElementById('qr-modal');

  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  const closePrivacyBtn = document.getElementById('close-privacy-btn');

  const openTermsBtn = document.getElementById('open-terms-btn');
  const closeTermsBtn = document.getElementById('close-terms-btn');

  const openQrBtn = document.getElementById('qr-modal-open-btn');
  const closeQrBtn = document.getElementById('close-qr-btn');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Gizlilik Modalı
  if (openPrivacyBtn && privacyModal) {
    openPrivacyBtn.addEventListener('click', () => openModal(privacyModal));
    closePrivacyBtn?.addEventListener('click', () => closeModal(privacyModal));
  }

  // Kullanım Şartları Modalı
  if (openTermsBtn && termsModal) {
    openTermsBtn.addEventListener('click', () => openModal(termsModal));
    closeTermsBtn?.addEventListener('click', () => closeModal(termsModal));
  }

  // QR Kod Modalı
  if (openQrBtn && qrModal) {
    openQrBtn.addEventListener('click', () => openModal(qrModal));
    closeQrBtn?.addEventListener('click', () => closeModal(qrModal));
  }

  // Dış alana (overlay) tıklayınca kapatma
  [privacyModal, termsModal, qrModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // ESC tuşuna basınca tüm modalları kapat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [privacyModal, termsModal, qrModal].forEach(modal => closeModal(modal));
    }
  });
}
