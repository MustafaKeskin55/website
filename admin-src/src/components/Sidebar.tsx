import React from 'react';
import { Compass, PieChart, Image, Network, Megaphone, LogOut, CheckCircle, Users } from 'lucide-react';
import { TabKey, AdminUser } from '../types';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  user: AdminUser;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Compass size={28} color="#D4AF37" />
        <span>Mümin Pusulası</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
        >
          <PieChart size={18} />
          <span>Genel Bakış</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => onTabChange('members')}
        >
          <Users size={18} />
          <span>Üyeler</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'wallpapers' ? 'active' : ''}`}
          onClick={() => onTabChange('wallpapers')}
        >
          <Image size={18} />
          <span>Duvar Kağıtları</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'apis' ? 'active' : ''}`}
          onClick={() => onTabChange('apis')}
        >
          <Network size={18} />
          <span>API & Sistem</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'ads' ? 'active' : ''}`}
          onClick={() => onTabChange('ads')}
        >
          <Megaphone size={18} />
          <span>Reklam Ayarları</span>
        </button>
      </nav>

      <div className="user-profile">
        <img
          src={user.picture || 'https://www.gravatar.com/avatar/?d=mp'}
          alt={user.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/?d=mp';
          }}
        />
        <div className="user-info-text">
          <div title={user.name}>{user.name}</div>
          <span>
            <CheckCircle size={10} color="#10B981" /> Sistem Yöneticisi
          </span>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Çıkış Yap">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
