import React from 'react';
import { PieChart, Image, Network, Megaphone, CheckCircle2, AlertCircle, Compass, LogOut } from 'lucide-react';
import { TabKey, AdminUser } from '../types';

interface HeaderProps {
  activeTab: TabKey;
  isOnline: boolean;
  endpointUrl?: string;
  user?: AdminUser;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, isOnline, endpointUrl, user, onLogout }) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <PieChart size={24} color="#D4AF37" /> Canlı Sistem Durumu
          </>
        );
      case 'wallpapers':
        return (
          <>
            <Image size={24} color="#D4AF37" /> Duvar Kağıtları Yönetimi
          </>
        );
      case 'apis':
        return (
          <>
            <Network size={24} color="#D4AF37" /> API & Sunucu Bağlantıları
          </>
        );
      case 'ads':
        return (
          <>
            <Megaphone size={24} color="#D4AF37" /> AdMob Reklam Yönetimi
          </>
        );
    }
  };

  return (
    <>
      {user && (
        <div className="mobile-topbar">
          <div className="mobile-brand">
            <Compass size={22} color="#D4AF37" />
            <span>Mümin Pusulası</span>
          </div>
          <div className="mobile-user">
            <img
              src={user.picture || 'https://www.gravatar.com/avatar/?d=mp'}
              alt={user.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/?d=mp';
              }}
            />
            <button className="logout-btn" onClick={onLogout} title="Çıkış Yap" aria-label="Çıkış Yap">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
      <header className="header">
        <h2>{getTabTitle()}</h2>
        <div className={`status-badge ${isOnline ? '' : 'offline'}`}>
          {isOnline ? (
            <>
              <CheckCircle2 size={14} color="#10B981" />
              <span style={{ color: '#10B981' }}>Sunucu Bağlantısı Aktif</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} color="#EF4444" />
              <span style={{ color: '#EF4444' }}>Sunucuya Ulaşılamıyor</span>
            </>
          )}
        </div>
      </header>
    </>
  );
};
