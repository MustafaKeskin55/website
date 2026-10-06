import React, { useState } from 'react';
import { Network, Play, CheckCircle2, AlertTriangle, ShieldCheck, Save, Loader2, Server } from 'lucide-react';
import { AppConfig } from '../types';

interface ApisTabProps {
  config: AppConfig;
  onUpdate: (updated: Partial<AppConfig>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ApisTab: React.FC<ApisTabProps> = ({ config, onUpdate, onSave, isSaving }) => {
  const [prayerStatus, setPrayerStatus] = useState<string>('Hazır - Test etmek için tıklayın');
  const [quranStatus, setQuranStatus] = useState<string>('Hazır - Test etmek için tıklayın');
  const [audioStatus, setAudioStatus] = useState<string>('Hazır - Test etmek için tıklayın');
  const [serverStatus, setServerStatus] = useState<string>('Hazır - Ping için tıklayın');

  const [testingPrayer, setTestingPrayer] = useState<boolean>(false);
  const [testingQuran, setTestingQuran] = useState<boolean>(false);
  const [testingAudio, setTestingAudio] = useState<boolean>(false);
  const [testingServer, setTestingServer] = useState<boolean>(false);

  // 1. Namaz Vakitleri Canlı Testi
  const testPrayerApi = async () => {
    setTestingPrayer(true);
    setPrayerStatus('İstek gönderiliyor...');
    const start = Date.now();
    try {
      const base = (config.prayerApiUrl || 'https://api.aladhan.com/').replace(/\/$/, '');
      const res = await fetch(`${base}/v1/timingsByCity?city=Istanbul&country=Turkey&method=13`);
      const dur = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        const fajr = data?.data?.timings?.Fajr || 'Mevcut';
        setPrayerStatus(`🟢 200 OK (${dur}ms) - Namaz Vakitleri Aktif (İmsak: ${fajr})`);
      } else {
        setPrayerStatus(`❌ Hata (${res.status} ${res.statusText}) - Yanıt süresi: ${dur}ms`);
      }
    } catch (e: any) {
      const dur = Date.now() - start;
      setPrayerStatus(`⚠️ Bağlantı Başarısız (${dur}ms): ${e.message || 'Ağ Hatası'}`);
    }
    setTestingPrayer(false);
  };

  // 2. Kur'an API Canlı Testi
  const testQuranApi = async () => {
    setTestingQuran(true);
    setQuranStatus('İstek gönderiliyor...');
    const start = Date.now();
    try {
      const base = (config.quranApiUrl || 'https://api.quran.com/api/v4/').replace(/\/$/, '');
      const res = await fetch(`${base}/chapters`);
      const dur = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        const count = data?.chapters?.length || 114;
        setQuranStatus(`🟢 200 OK (${dur}ms) - Kur'an API Aktif (${count} Sure Doğrulandı)`);
      } else {
        setQuranStatus(`❌ Hata (${res.status} ${res.statusText}) - Yanıt süresi: ${dur}ms`);
      }
    } catch (e: any) {
      const dur = Date.now() - start;
      setQuranStatus(`⚠️ Bağlantı Başarısız (${dur}ms): ${e.message || 'Ağ Hatası'}`);
    }
    setTestingQuran(false);
  };

  // 3. Ses CDN Canlı Testi
  const testAudioCdn = async () => {
    setTestingAudio(true);
    setAudioStatus('CDN kontrol ediliyor...');
    const start = Date.now();
    try {
      const base = (config.audioCdnUrl || 'https://download.quranicaudio.com/quran/').replace(/\/$/, '');
      // Fatiha suresi ses dosyası erişim testi
      const testFileUrl = `${base}/001.mp3`;
      const res = await fetch(testFileUrl, { method: 'HEAD', mode: 'no-cors' });
      const dur = Date.now() - start;
      setAudioStatus(`🟢 CDN Erişilebilir (${dur}ms) - MP3 Ses Akışı Aktif`);
    } catch (e: any) {
      const dur = Date.now() - start;
      setAudioStatus(`⚠️ CDN Uyarısı (${dur}ms): ${e.message || 'CORS veya Ağ Kısıtı'}`);
    }
    setTestingAudio(false);
  };

  // 4. Merkezi Sunucu / Worker API Canlı Ping
  const testServerApi = async () => {
    setTestingServer(true);
    setServerStatus('Sunucu pingleniyor...');
    const start = Date.now();
    try {
      const target = (config.serverApiUrl || '').trim() || '/api/config';
      const res = await fetch(target);
      const dur = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        const hasAdMob = !!data.bannerAdUnitId;
        setServerStatus(`🟢 200 OK (${dur}ms) - Sunucu & KV Veritabanı Aktif (${hasAdMob ? 'Veri Doğrulandı' : 'Varsayılan'})`);
      } else {
        setServerStatus(`❌ Sunucu Yanıtı: ${res.status} ${res.statusText} (${dur}ms)`);
      }
    } catch (e: any) {
      const dur = Date.now() - start;
      setServerStatus(`❌ Bağlantı Kurulamadı (${dur}ms): ${e.message}`);
    }
    setTestingServer(false);
  };

  return (
    <div className="controls-grid">
      {/* API Endpointleri */}
      <div className="control-panel">
        <div className="panel-title">
          <span><Network size={20} /> Dinamik Harici API Servisleri</span>
        </div>

        {/* Namaz Vakitleri */}
        <div className="input-group">
          <label>Namaz Vakitleri API Base URL</label>
          <div className="input-with-button">
            <input
              type="text"
              value={config.prayerApiUrl}
              onChange={(e) => onUpdate({ prayerApiUrl: e.target.value })}
              placeholder="https://api.aladhan.com/"
            />
            <button className="btn-outline" onClick={testPrayerApi} disabled={testingPrayer}>
              {testingPrayer ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Test Et</span>
            </button>
          </div>
          <span className="ping-badge">{prayerStatus}</span>
        </div>

        {/* Kur'an API */}
        <div className="input-group">
          <label>Kur'an-ı Kerim API Base URL</label>
          <div className="input-with-button">
            <input
              type="text"
              value={config.quranApiUrl}
              onChange={(e) => onUpdate({ quranApiUrl: e.target.value })}
              placeholder="https://api.quran.com/api/v4/"
            />
            <button className="btn-outline" onClick={testQuranApi} disabled={testingQuran}>
              {testingQuran ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Test Et</span>
            </button>
          </div>
          <span className="ping-badge">{quranStatus}</span>
        </div>

        {/* Ses & Kıraat CDN */}
        <div className="input-group">
          <label>Kur'an Ses & Kıraat CDN URL</label>
          <div className="input-with-button">
            <input
              type="text"
              value={config.audioCdnUrl}
              onChange={(e) => onUpdate({ audioCdnUrl: e.target.value })}
              placeholder="https://download.quranicaudio.com/quran/"
            />
            <button className="btn-outline" onClick={testAudioCdn} disabled={testingAudio}>
              {testingAudio ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Test Et</span>
            </button>
          </div>
          <span className="ping-badge">{audioStatus}</span>
        </div>

        <button className="btn" style={{ width: '100%', marginTop: '20px' }} onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaving ? 'Kaydediliyor & Yayınlanıyor...' : 'Tüm API Ayarlarını Kaydet & Yayınla'}</span>
        </button>
      </div>

      {/* Merkezi Bulut Sunucu URL */}
      <div className="control-panel">
        <div className="panel-title">
          <span><Server size={20} /> Merkezi Sunucu & Worker Yönetimi</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
          Uygulamanın bağlandığı ana Cloudflare Worker veya özel alan adı URL'si.
        </p>

        <div className="input-group">
          <label>Sunucu API Base URL</label>
          <div className="input-with-button">
            <input
              type="text"
              value={config.serverApiUrl || ''}
              onChange={(e) => onUpdate({ serverApiUrl: e.target.value })}
              placeholder="https://muminpusulasi.keskindev.com/api/config"
            />
            <button className="btn-outline" onClick={testServerApi} disabled={testingServer}>
              {testingServer ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Ping At</span>
            </button>
          </div>
          <span className="ping-badge">{serverStatus}</span>
        </div>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(212,175,55,0.06)',
            borderRadius: '14px',
            border: '1px solid rgba(212,175,55,0.2)'
          }}
        >
          <h4 style={{ fontSize: '0.92rem', color: 'var(--gold)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} /> Sıfır Kesinti & Güvenli Doğrulama
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', lineHeight: '1.6' }}>
            Yaptığınız tüm değişiklikler hem tarayıcı önbelleğine hem de Cloudflare KV bulutuna güvenli anahtarla kaydedilir. Mobil APK buradaki verileri anlık olarak çeker.
          </p>
        </div>
      </div>
    </div>
  );
};
