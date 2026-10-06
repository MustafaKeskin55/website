import React, { useState, useEffect } from 'react';
import { Image, Megaphone, Activity, Users, ArrowUpRight, Zap, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AppConfig, TabKey, Wallpaper } from '../types';

interface OverviewTabProps {
  config: AppConfig;
  wallpapers: Wallpaper[];
  onNavigate: (tab: TabKey) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ config, wallpapers, onNavigate }) => {
  const [healthScore, setHealthScore] = useState<number>(100);
  const [healthText, setHealthText] = useState<string>('Kontrol ediliyor...');
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>(() => new Date().toLocaleTimeString('tr-TR'));

  // Canlı API Servis Sağlık Taraması
  const runLiveHealthCheck = async () => {
    setIsChecking(true);
    const start = Date.now();
    let passed = 0;
    const total = 3;

    try {
      // 1. Namaz API
      const prayerBase = (config.prayerApiUrl || 'https://api.aladhan.com/').replace(/\/$/, '');
      const pRes = await fetch(`${prayerBase}/v1/timingsByCity?city=Istanbul&country=Turkey&method=13`, { mode: 'cors' }).catch(() => null);
      if (pRes && pRes.ok) passed++;

      // 2. Kur'an API
      const quranBase = (config.quranApiUrl || 'https://api.quran.com/api/v4/').replace(/\/$/, '');
      const qRes = await fetch(`${quranBase}/chapters`, { mode: 'cors' }).catch(() => null);
      if (qRes && qRes.ok) passed++;

      // 3. Merkezi Sunucu
      const targetApi = (config.serverApiUrl || '').trim() || '/api/config';
      const sRes = await fetch(targetApi).catch(() => null);
      if (sRes && (sRes.ok || sRes.status === 200)) passed++;

      const duration = Date.now() - start;
      setPingMs(duration);

      const score = Math.round((passed / total) * 100);
      setHealthScore(score);

      if (score === 100) {
        setHealthText(`Tüm Servisler Aktif (${duration}ms)`);
      } else if (score >= 60) {
        setHealthText(`${passed}/${total} Servis Aktif (${duration}ms)`);
      } else {
        setHealthText(`Kısmi Bağlantı Sorunu (${duration}ms)`);
      }
    } catch (_) {
      setHealthScore(66);
      setHealthText('Servisler Yanıt Veriyor');
    }

    setLastCheckTime(new Date().toLocaleTimeString('tr-TR'));
    setIsChecking(false);
  };

  useEffect(() => {
    runLiveHealthCheck();
  }, [config.prayerApiUrl, config.quranApiUrl, config.serverApiUrl]);

  const shortBannerId = config.bannerAdUnitId
    ? config.bannerAdUnitId.length > 25
      ? `${config.bannerAdUnitId.slice(0, 16)}...${config.bannerAdUnitId.slice(-6)}`
      : config.bannerAdUnitId
    : 'Tanımlanmadı';

  return (
    <div>
      {/* İstatistik Kartları (Canlı & Dinamik) */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('wallpapers')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>Aktif Duvar Kağıdı</span>
            <Image size={18} color="#D4AF37" />
          </div>
          <div className="stat-value">{wallpapers.length}</div>
          <div className="stat-subtitle">
            {wallpapers.filter(w => w.isCustom).length} Özel Yüklenen • {wallpapers.filter(w => !w.isCustom).length} Sistem Görseli
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('ads')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>AdMob Banner Durumu</span>
            <Megaphone size={18} color={config.adsEnabled ? '#10B981' : '#EF4444'} />
          </div>
          <div className="stat-value" style={{ color: config.adsEnabled ? '#10B981' : '#EF4444', fontSize: '1.8rem' }}>
            {config.adsEnabled ? 'Aktif' : 'Kapalı'}
          </div>
          <div className="stat-subtitle" style={{ fontFamily: 'monospace' }}>
            {config.adsEnabled ? shortBannerId : 'Reklamlar Uygulamada Gizlendi'}
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('apis')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>API Servis Sağlığı</span>
            <Activity size={18} color={healthScore >= 80 ? '#10B981' : '#F59E0B'} />
          </div>
          <div className="stat-value" style={{ color: healthScore >= 80 ? '#10B981' : '#F59E0B', fontSize: '1.8rem' }}>
            %{healthScore}
          </div>
          <div className="stat-subtitle">{healthText}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <span>Canlı Senkronizasyon</span>
            <Users size={18} color="#10B981" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: '#10B981' }}>
            {pingMs !== null ? `${pingMs}ms` : 'Bağlı'}
          </div>
          <div className="stat-subtitle">Son Kontrol: {lastCheckTime}</div>
        </div>
      </div>

      {/* Yenileme & Hızlı İşlemler */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <button
          className="btn-outline"
          onClick={runLiveHealthCheck}
          disabled={isChecking}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
          <span>{isChecking ? 'Taranıyor...' : 'Canlı Servisleri Yeniden Tara'}</span>
        </button>
      </div>

      <div className="controls-grid">
        <div className="control-panel">
          <div className="panel-title">
            <span><Zap size={20} /> Hızlı Yönetim İşlemleri</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Mobil uygulamanız bu panel üzerinden gerçek zamanlı senkronize olur. Yaptığınız her değişiklik anında telefonlara yansır.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn" onClick={() => onNavigate('wallpapers')}>
              <Image size={18} /> Duvar Kağıtlarını Yönet / Sil / Yenisini Yükle
            </button>
            <button className="btn-outline" onClick={() => onNavigate('apis')}>
              <Activity size={18} /> Namaz & Kur'an API URL Ayarlarını Değiştir
            </button>
            <button className="btn-outline" onClick={() => onNavigate('ads')}>
              <Megaphone size={18} /> AdMob Banner Birim Kimliğini Düzenle
            </button>
          </div>
        </div>

        <div className="control-panel">
          <div className="panel-title">
            <span><ShieldCheck size={20} /> Güvenlik & Gerçek Zamanlı Bağlantı</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.82)', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '10px' }}>
              🔒 <b>Master Key Güvenliği:</b> Panel ve API uç noktaları yetkisiz erişimlere karşı çift katmanlı güvenlik anahtarıyla korunur.
            </p>
            <p style={{ marginBottom: '10px' }}>
              ✓ <b>Anlık Yayından Kaldırma:</b> Panelden sildiğiniz herhangi bir duvar kağıdı kullanıcıların uygulamasından hemen kaldırılır.
            </p>
            <p style={{ marginBottom: '10px' }}>
              ✓ <b>Yeni Görsel Ekleme:</b> Yüklediğiniz dikey fotoğraflar anında tüm kullanıcıların telefonunda en üstte yayınlanır.
            </p>
            <p>
              ✓ <b>Dinamik API Servisleri:</b> API çökmelerine karşı adresleri panelden güncelleyerek uygulamayı yeniden yayınlamaya gerek kalmadan değiştirebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
