import React, { useState } from 'react';
import { Megaphone, Save, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';
import { AppConfig } from '../types';

interface AdsTabProps {
  config: AppConfig;
  onUpdate: (updated: Partial<AppConfig>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AdsTab: React.FC<AdsTabProps> = ({ config, onUpdate, onSave, isSaving }) => {
  const [copied, setCopied] = useState<boolean>(false);

  // AdMob Banner ID format doğrulaması (ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)
  const isValidAdMobId = /^ca-app-pub-\d{16}\/\d{10}$/.test((config.bannerAdUnitId || '').trim());

  const handleCopyId = () => {
    if (config.bannerAdUnitId) {
      navigator.clipboard.writeText(config.bannerAdUnitId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="controls-grid">
      <div className="control-panel">
        <div className="panel-title">
          <span><Megaphone size={20} /> AdMob Banner Yapılandırması</span>
        </div>

        {/* Genel Reklam Switch */}
        <div className="setting-row">
          <div className="setting-info">
            <h4>Uygulama İçi Reklam Gösterimi</h4>
            <p>Açık olduğunda telefonlarda AdMob banner reklamı yüklenir; kapalı olduğunda hiçbir reklam gösterilmez.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.adsEnabled}
              onChange={(e) => onUpdate({ adsEnabled: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Banner ID Input */}
        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div className="setting-info" style={{ width: '100%' }}>
            <h4>Google AdMob Banner Birim Kimliği (Ad Unit ID)</h4>
            <p>Mobil uygulamanın AdMob sunucularından reklam istemek için kullandığı kimlik.</p>
          </div>
          <input
            type="text"
            value={config.bannerAdUnitId}
            onChange={(e) => onUpdate({ bannerAdUnitId: e.target.value.trim() })}
            placeholder="ca-app-pub-1095649040834648/6353100367"
            style={{
              fontFamily: 'monospace',
              width: '100%',
              marginTop: '6px',
              borderColor: isValidAdMobId ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.78rem' }}>
            {isValidAdMobId ? (
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Geçerli AdMob formatı
              </span>
            ) : (
              <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> Standart format: ca-app-pub-[16 hane]/[10 hane]
              </span>
            )}
          </div>
        </div>

        {/* Ramazan Modu Switch */}
        <div className="setting-row">
          <div className="setting-info">
            <h4>Ramazan Ayı Modu</h4>
            <p>Aktif olduğunda uygulamada Ramazan'a özel görünümler ve kısıtlamalar uygulanır.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.ramazanMode}
              onChange={(e) => onUpdate({ ramazanMode: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>

        <button
          className="btn"
          style={{ width: '100%', marginTop: '20px' }}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaving ? 'Sunucuya Kaydediliyor...' : 'Reklam Ayarlarını Sunucuya Kaydet'}</span>
        </button>
      </div>

      {/* Canlı Durum & Doğrulama Paneli */}
      <div className="control-panel">
        <div className="panel-title">
          <span><Key size={20} /> Aktif Değerler</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem' }}>
          <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Kayıtlı Banner Kimliği</div>
            <div style={{ fontFamily: 'monospace', color: '#fff', wordBreak: 'break-all', fontWeight: 600 }}>
              {config.bannerAdUnitId || 'Tanımlanmadı'}
            </div>
            <button
              onClick={handleCopyId}
              style={{
                marginTop: '8px',
                padding: '4px 10px',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '6px',
                color: 'var(--gold)',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              {copied ? 'Kopyalandı' : 'Kimliği Kopyala'}
            </button>
          </div>

          <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Reklam Durumu</div>
            <div style={{ color: config.adsEnabled ? '#10B981' : '#EF4444', fontWeight: 600 }}>
              {config.adsEnabled ? 'AKTİF (Kullanıcılara gösteriliyor)' : 'KAPALI (Tüm reklamlar gizli)'}
            </div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Ramazan Modu</div>
            <div style={{ color: config.ramazanMode ? '#D4AF37' : 'var(--text-muted)', fontWeight: 600 }}>
              {config.ramazanMode ? 'Açık' : 'Kapalı'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
