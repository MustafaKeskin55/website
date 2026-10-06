import React from 'react';
import { PieChart, Image, Network, Megaphone, CheckCircle2 } from 'lucide-react';
import { TabKey } from '../types';

interface HeaderProps {
  activeTab: TabKey;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, isOnline }) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <PieChart size={24} color="#D4AF37" /> Genel Bakış
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
            <Network size={24} color="#D4AF37" /> API & Sistem Yönetimi
          </>
        );
      case 'ads':
        return (
          <>
            <Megaphone size={24} color="#D4AF37" /> Google AdMob Reklam Yönetimi
          </>
        );
    }
  };

  return (
    <header className="header">
      <h2>{getTabTitle()}</h2>
      <div className="status-badge">
        <CheckCircle2 size={14} color="#10B981" />
        <span>{isOnline ? 'Sistem Aktif & Senkronize (Bulut API)' : 'Sistem Aktif (Yerel & Hazır)'}</span>
      </div>
    </header>
  );
};
