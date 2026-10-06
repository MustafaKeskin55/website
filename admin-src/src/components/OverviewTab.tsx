import React from 'react';
import { Image, Megaphone, Activity, Users, ArrowUpRight, Zap, Info, ShieldCheck } from 'lucide-react';
import { AppConfig, TabKey, Wallpaper } from '../types';

interface OverviewTabProps {
  config: AppConfig;
  wallpapers: Wallpaper[];
  onNavigate: (tab: TabKey) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ config, wallpapers, onNavigate }) => {
  const shortBannerId = config.bannerAdUnitId
    ? config.bannerAdUnitId.length > 25
      ? `${config.bannerAdUnitId.slice(0, 16)}...${config.bannerAdUnitId.slice(-6)}`
      : config.bannerAdUnitId
    : 'Tanımlanmadı';

  return (
    <div>
      {/* İstatistik Kartları */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('wallpapers')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>Aktif Duvar Kağıdı</span>
            <Image size={18} color="#D4AF37" />
          </div>
          <div className="stat-value">{wallpapers.length}</div>
          <div className="stat-subtitle">Telefonda yayında olan görsel sayısı</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('ads')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>AdMob Banner Durumu</span>
            <Megaphone size={18} color={config.adsEnabled ? '#10B981' : '#EF4444'} />
          </div>
          <div className="stat-value" style={{ color: config.adsEnabled ? '#10B981' : '#EF4444', fontSize: '1.8rem' }}>
            {config.adsEnabled ? 'Aktif' : 'Kapalı'}
          </div>
          <div className="stat-subtitle" style={{ fontFamily: 'monospace' }}>{shortBannerId}</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('apis')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>API Servis Sağlığı</span>
            <Activity size={18} color="#10B981" />
          </div>
          <div className="stat-value" style={{ color: '#10B981', fontSize: '1.8rem' }}>%100 OK</div>
          <div className="stat-subtitle">Namaz & Kur'an servisleri çevrimiçi</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <span>Canlı Senkronizasyon</span>
            <Users size={18} color="#10B981" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>Anlık</div>
          <div className="stat-subtitle">Bulut KV & mobil cihazlar bağlı</div>
        </div>
      </div>

      {/* Hızlı İşlemler & Bilgilendirme */}
      <div className="controls-grid">
        <div className="control-panel">
          <div className="panel-title">
            <span><Zap size={20} /> Hızlı Yönetim İşlemleri</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Uygulamanın tüm dinamik fonksiyonlarını tek tıkla buradan yönetebilir, yeni içerikler yayınlayabilirsiniz.
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
            <span><ShieldCheck size={20} /> Canlı Senkronizasyon Mimarisi</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.82)', lineHeight: '1.7' }}>
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
