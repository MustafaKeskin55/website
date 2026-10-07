import React, { useState, useEffect } from 'react';
import { Image, Megaphone, Activity, Users, Zap, RefreshCw, Server, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AppConfig, TabKey, Wallpaper } from '../types';

interface OverviewTabProps {
  config: AppConfig;
  wallpapers: Wallpaper[];
  onNavigate: (tab: TabKey) => void;
}

interface ServiceCheck {
  name: string;
  url: string;
  status: 'checking' | 'ok' | 'error';
  statusCode?: number;
  duration?: number;
  error?: string;
  detail?: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ config, wallpapers, onNavigate }) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>(() => new Date().toLocaleTimeString('tr-TR'));
  const [services, setServices] = useState<ServiceCheck[]>([
    { name: "Namaz Vakitleri API", url: config.prayerApiUrl || 'https://api.aladhan.com/', status: 'checking' },
    { name: "Kur'an-ı Kerim API", url: config.quranApiUrl || 'https://api.quran.com/api/v4/', status: 'checking' },
    { name: "Merkezi Bulut API", url: config.serverApiUrl || '/api/config', status: 'checking' }
  ]);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const updatedServices: ServiceCheck[] = [];

    // 1. Namaz Vakitleri API Kontrolü
    const prayerBase = (config.prayerApiUrl || 'https://api.aladhan.com/').replace(/\/$/, '');
    const pStart = Date.now();
    try {
      const pRes = await fetch(`${prayerBase}/v1/timingsByCity?city=Istanbul&country=Turkey&method=13`);
      const pDur = Date.now() - pStart;
      if (pRes.ok) {
        const pData = await pRes.json();
        updatedServices.push({
          name: "Namaz Vakitleri API",
          url: prayerBase,
          status: 'ok',
          statusCode: pRes.status,
          duration: pDur,
          detail: `200 OK (${pData?.data?.date?.readable || 'Vakitler Alındı'})`
        });
      } else {
        updatedServices.push({
          name: "Namaz Vakitleri API",
          url: prayerBase,
          status: 'error',
          statusCode: pRes.status,
          duration: pDur,
          error: `HTTP ${pRes.status} ${pRes.statusText}`
        });
      }
    } catch (e: any) {
      updatedServices.push({
        name: "Namaz Vakitleri API",
        url: prayerBase,
        status: 'error',
        duration: Date.now() - pStart,
        error: e.message || 'Ağ Hatası'
      });
    }

    // 2. Kur'an-ı Kerim API Kontrolü
    const quranBase = (config.quranApiUrl || 'https://api.quran.com/api/v4/').replace(/\/$/, '');
    const qStart = Date.now();
    try {
      const qRes = await fetch(`${quranBase}/chapters`);
      const qDur = Date.now() - qStart;
      if (qRes.ok) {
        const qData = await qRes.json();
        updatedServices.push({
          name: "Kur'an-ı Kerim API",
          url: quranBase,
          status: 'ok',
          statusCode: qRes.status,
          duration: qDur,
          detail: `200 OK (${qData?.chapters?.length || 114} Sure Mevcut)`
        });
      } else {
        updatedServices.push({
          name: "Kur'an-ı Kerim API",
          url: quranBase,
          status: 'error',
          statusCode: qRes.status,
          duration: qDur,
          error: `HTTP ${qRes.status} ${qRes.statusText}`
        });
      }
    } catch (e: any) {
      updatedServices.push({
        name: "Kur'an-ı Kerim API",
        url: quranBase,
        status: 'error',
        duration: Date.now() - qStart,
        error: e.message || 'Ağ Hatası'
      });
    }

    // 3. Merkezi Sunucu / API Kontrolü
    const serverUrl = (config.serverApiUrl || '').trim() || '/api/config';
    const sStart = Date.now();
    try {
      const sRes = await fetch(serverUrl);
      const sDur = Date.now() - sStart;
      if (sRes.ok) {
        const sData = await sRes.json();
        updatedServices.push({
          name: "Merkezi Yapılandırma API",
          url: serverUrl,
          status: 'ok',
          statusCode: sRes.status,
          duration: sDur,
          detail: `200 OK (Aktif Reklam ID: ${sData.bannerAdUnitId ? 'Tanımlı' : 'Boş'})`
        });
      } else {
        updatedServices.push({
          name: "Merkezi Yapılandırma API",
          url: serverUrl,
          status: 'error',
          statusCode: sRes.status,
          duration: sDur,
          error: `HTTP ${sRes.status} ${sRes.statusText}`
        });
      }
    } catch (e: any) {
      updatedServices.push({
        name: "Merkezi Yapılandırma API",
        url: serverUrl,
        status: 'error',
        duration: Date.now() - sStart,
        error: e.message || 'Bağlantı Hatası'
      });
    }

    setServices(updatedServices);
    setLastCheckTime(new Date().toLocaleTimeString('tr-TR'));
    setIsChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [config.prayerApiUrl, config.quranApiUrl, config.serverApiUrl]);

  const okCount = services.filter((s) => s.status === 'ok').length;
  const avgPing = Math.round(
    services.reduce((acc, s) => acc + (s.duration || 0), 0) / (services.length || 1)
  );

  return (
    <div>
      {/* Canlı İstatistikler */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('wallpapers')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>Yayındaki Duvar Kağıtları</span>
            <Image size={18} color="#D4AF37" />
          </div>
          <div className="stat-value">{wallpapers.length}</div>
          <div className="stat-subtitle">
            {wallpapers.filter(w => w.isCustom).length} Özel Yükleme • {wallpapers.filter(w => !w.isCustom).length} Sistem Görseli
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
            {config.bannerAdUnitId ? `${config.bannerAdUnitId.slice(0, 16)}...` : 'Tanımsız'}
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('apis')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">
            <span>Servis Sağlık Durumu</span>
            <Activity size={18} color={okCount === services.length ? '#10B981' : '#F59E0B'} />
          </div>
          <div className="stat-value" style={{ color: okCount === services.length ? '#10B981' : '#F59E0B', fontSize: '1.8rem' }}>
            {okCount} / {services.length}
          </div>
          <div className="stat-subtitle">
            {okCount === services.length ? 'Tüm Servisler Yanıt Veriyor' : 'Bazı Servislerde Hata Var'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <span>Ortalama Ağ Gecikmesi</span>
            <Clock size={18} color="#10B981" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: '#10B981' }}>
            {avgPing > 0 ? `${avgPing} ms` : '-'}
          </div>
          <div className="stat-subtitle">Son Test: {lastCheckTime}</div>
        </div>
      </div>

      {/* Yenile Butonu */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <button
          className="btn-outline"
          onClick={runDiagnostics}
          disabled={isChecking}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
          <span>{isChecking ? 'Taranıyor...' : 'Bağlantıları Yeniden Test Et'}</span>
        </button>
      </div>

      {/* Gerçek Canlı Servis Durumu Tablosu */}
      <div className="control-panel" style={{ marginBottom: '20px' }}>
        <div className="panel-title">
          <span><Server size={20} /> Gerçek Zamanlı Servis Bağlantı Durumu</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {services.map((srv, idx) => (
            <div key={idx} className="service-row">
              <div className="service-info">
                <div className="service-name">
                  {srv.name}
                </div>
                <div className="service-url">
                  {srv.url}
                </div>
              </div>

              <div className="service-status">
                {srv.status === 'checking' && (
                  <span style={{ fontSize: '0.82rem', color: '#F59E0B' }}>Test Ediliyor...</span>
                )}
                {srv.status === 'ok' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
                    <CheckCircle2 size={16} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{srv.duration} ms</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({srv.detail})</span>
                  </div>
                )}
                {srv.status === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}>
                    <XCircle size={16} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{srv.error}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="control-panel">
        <div className="panel-title">
          <span><Zap size={20} /> Yönetim Menüsü</span>
        </div>
        <div className="quick-actions">
          <button className="btn" onClick={() => onNavigate('wallpapers')}>
            <Image size={18} /> Duvar Kağıtlarını Düzenle
          </button>
          <button className="btn-outline" onClick={() => onNavigate('apis')}>
            <Activity size={18} /> API Bağlantılarını Düzenle
          </button>
          <button className="btn-outline" onClick={() => onNavigate('ads')}>
            <Megaphone size={18} /> AdMob Reklam Birimini Değiştir
          </button>
        </div>
      </div>
    </div>
  );
};
