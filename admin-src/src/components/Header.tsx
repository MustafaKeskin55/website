import React from 'react';
import { PieChart, Image, Network, Megaphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { TabKey } from '../types';

interface HeaderProps {
  activeTab: TabKey;
  isOnline: boolean;
  endpointUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, isOnline, endpointUrl }) => {
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
    <header className="header">
      <h2>{getTabTitle()}</h2>
      <div className="status-badge" style={{ borderColor: isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
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
  );
};
