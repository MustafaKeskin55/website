import React, { useState, useEffect, useMemo } from 'react';
import { TabKey, AppConfig, Wallpaper, AdminUser } from './types';
import { DEFAULT_WALLPAPERS, INITIAL_CONFIG } from './constants';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { WallpapersTab } from './components/WallpapersTab';
import { ApisTab } from './components/ApisTab';
import { AdsTab } from './components/AdsTab';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';

export const App: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('mumin_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('admin_token') || '';
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('mumin_admin_config');
    return saved ? { ...INITIAL_CONFIG, ...JSON.parse(saved) } : INITIAL_CONFIG;
  });

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Canlı Cloudflare API Endpoint
  const getApiEndpoint = (customUrl?: string) => {
    const trimmed = (customUrl || '').trim();
    if (trimmed) return trimmed;
    return 'https://muminpusulasi.keskindev.com/api/config';
  };

  // Sunucudan en güncel ayarları çek
  const fetchServerConfig = async () => {
    const targetUrl = getApiEndpoint(config.serverApiUrl);
    try {
      const res = await fetch(targetUrl);
      if (res.ok) {
        const serverData = await res.json();
        setConfig((prev) => {
          const merged = { ...prev, ...serverData };
          try {
            localStorage.setItem('mumin_admin_config', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
        setIsOnline(true);
      }
    } catch (_) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchServerConfig();
    }
  }, [user]);

  // Aktif Duvar Kağıtları Listesi
  const activeWallpapers = useMemo(() => {
    const deletedSet = new Set(config.deletedWallpaperIds || []);
    const list: Wallpaper[] = [];

    // 1. Varsayılanlar
    DEFAULT_WALLPAPERS.forEach((item) => {
      if (!deletedSet.has(item.id) && !deletedSet.has(item.fileName || '')) {
        list.push(item);
      }
    });

    // 2. Özel yüklenenler
    (config.customWallpapers || []).forEach((custom) => {
      if (!deletedSet.has(custom.id)) {
        list.push(custom);
      }
    });

    return list;
  }, [config.deletedWallpaperIds, config.customWallpapers]);

  // Ayarları Kaydet
  const saveAllConfig = async (overrideConfig?: AppConfig, customToast?: string) => {
    const cfg = overrideConfig || config;
    setIsSaving(true);

    // 1. Yerel önbelleğe yaz (güvenli)
    try {
      localStorage.setItem('mumin_admin_config', JSON.stringify(cfg));
    } catch (_) {}

    // 2. Canlı Sunucuya Gönder
    const targetUrl = getApiEndpoint(cfg.serverApiUrl);
    const activeToken = token || localStorage.getItem('admin_token') || 'MuminAdmin2026!';
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
          'X-Admin-Key': activeToken
        },
        body: JSON.stringify(cfg)
      });

      if (res.ok) {
        showToast(customToast || 'Tüm ayarlar ve değişiklikler başarıyla yayınlandı!');
        setIsOnline(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
          const promptKey = window.prompt(
            'Yönetici Doğrulaması: Lütfen Güvenlik Anahtarını girin:',
            'MuminAdmin2026!'
          );
          if (promptKey) {
            const cleanKey = promptKey.trim();
            setToken(cleanKey);
            localStorage.setItem('admin_token', cleanKey);
            setIsSaving(false);
            saveAllConfig(cfg, customToast);
            return;
          }
        }
        showToast(errData.error || 'Yetkilendirme Hatası: Değişiklikler sunucuya kaydedilemedi.', 'error');
      }
    } catch (e: any) {
      showToast(customToast || 'Ayarlar yerel önbelleğe kaydedildi (Çevrimdışı Mod).', 'error');
      setIsOnline(false);
    }

    setIsSaving(false);
  };

  // Duvar Kağıdı Sil
  const handleDeleteWallpaper = (id: string, label: string) => {
    if (!window.confirm(`"${label}" duvar kağıdını uygulamadan silmek istediğinize emin misiniz?`)) {
      return;
    }

    const updatedDeleted = Array.from(new Set([...(config.deletedWallpaperIds || []), id]));
    const updatedCustom = (config.customWallpapers || []).filter((w) => w.id !== id);

    const updatedCfg: AppConfig = {
      ...config,
      deletedWallpaperIds: updatedDeleted,
      customWallpapers: updatedCustom
    };

    setConfig(updatedCfg);
    saveAllConfig(updatedCfg, `"${label}" duvar kağıdı silindi ve uygulamadan kaldırıldı.`);
  };

  // Yeni Duvar Kağıdı Ekle
  const handleAddWallpaper = (newWp: Wallpaper) => {
    const updatedCustom = [newWp, ...(config.customWallpapers || [])];
    const updatedCfg: AppConfig = {
      ...config,
      customWallpapers: updatedCustom
    };

    setConfig(updatedCfg);
    saveAllConfig(updatedCfg, `"${newWp.label}" duvar kağıdı başarıyla yüklendi ve yayına alındı!`);
  };

  const handleLogin = (newUser: AdminUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('mumin_admin_user', JSON.stringify(newUser));
    localStorage.setItem('admin_token', newToken);
    showToast(`Giriş yapıldı: ${newUser.name}`);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('mumin_admin_user');
    localStorage.removeItem('admin_token');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Header activeTab={activeTab} isOnline={isOnline} />

        {activeTab === 'overview' && (
          <OverviewTab
            config={config}
            wallpapers={activeWallpapers}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'wallpapers' && (
          <WallpapersTab
            wallpapers={activeWallpapers}
            onDelete={handleDeleteWallpaper}
            onAdd={handleAddWallpaper}
          />
        )}

        {activeTab === 'apis' && (
          <ApisTab
            config={config}
            onUpdate={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
            onSave={() => saveAllConfig()}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'ads' && (
          <AdsTab
            config={config}
            onUpdate={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
            onSave={() => saveAllConfig()}
            isSaving={isSaving}
          />
        )}
      </main>

      <Toast message={toastMessage} type={toastType} />
    </div>
  );
};
export default App;
