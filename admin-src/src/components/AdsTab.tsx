import React from 'react';
import { Megaphone, Save, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { AppConfig } from '../types';

interface AdsTabProps {
  config: AppConfig;
  onUpdate: (updated: Partial<AppConfig>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AdsTab: React.FC<AdsTabProps> = ({ config, onUpdate, onSave, isSaving }) => {
  return (
    <div className="controls-grid">
      <div className="control-panel">
        <div className="panel-title">
          <span><Megaphone size={20} /> Google AdMob Reklam Yönetimi</span>
        </div>

        {/* Genel Reklam Switch */}
        <div className="setting-row">
          <div className="setting-info">
            <h4>Genel Reklam Gösterimi</h4>
            <p>Uygulamadaki tüm banner ve geçiş reklamlarını anında aç veya kapat.</p>
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
            <h4>Google AdMob Banner Birim Kimliği</h4>
            <p>Uygulamada gösterilen aktif banner kimliği. Panelden değiştirildiğinde kullanıcılara hemen yansır.</p>
          </div>
          <input
            type="text"
            value={config.bannerAdUnitId}
            onChange={(e) => onUpdate({ bannerAdUnitId: e.target.value.trim() })}
            placeholder="ca-app-pub-1095649040834648/6353100367"
            style={{ fontFamily: 'monospace', width: '100%', marginTop: '6px' }}
          />
        </div>

        {/* Ramazan Modu Switch */}
        <div className="setting-row">
          <div className="setting-info">
            <h4>Ramazan & Dini Günler Modu</h4>
            <p>Mübarek Ramazan ayında ve dini günlerde reklamları otomatik olarak kapatır.</p>
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
          <span>{isSaving ? 'Kaydediliyor...' : 'Reklam Ayarlarını Kaydet & Yayınla'}</span>
        </button>
      </div>

      <div className="control-panel">
        <div className="panel-title">
          <span><ShieldCheck size={20} /> Reklam & Güvenlik Politikası</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '12px' }}>
            🛡️ <b>Aile & Çocuk Filtresi (G-Rated):</b> Kod tabanında <code>RequestConfiguration.MAX_AD_CONTENT_RATING_G</code> filtresi aktiftir. Uygunsuz ve sakıncalı içerikler kesinlikle engellenir.
          </p>
          <p style={{ marginBottom: '12px' }}>
            🏷️ <b>Birim Kimliği Doğrulandı:</b> Gerçek birim kimliğiniz (<code>ca-app-pub-1095649040834648/6353100367</code>) tanımlanmıştır. Yeni bir birim açtığınızda buradan değiştirmeniz yeterlidir.
          </p>
          <p>
            ⚡ <b>Çevrimdışı Güvenlik:</b> Telefon internete bağlı değilken dahi son çekilen ayarları SharedPreferences belleğinde saklar.
          </p>
        </div>
      </div>
    </div>
  );
};
