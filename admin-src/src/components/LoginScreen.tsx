import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Lock, KeyRound, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { AdminUser } from '../types';

interface LoginScreenProps {
  onLogin: (user: AdminUser, token: string) => void;
}

declare global {
  interface Window {
    google?: any;
    handleGoogleCredential?: (response: any) => void;
  }
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [adminKey, setAdminKey] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    window.handleGoogleCredential = (response: any) => {
      try {
        const token = response.credential;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(
          decodeURIComponent(
            window
              .atob(base64)
              .split('')
              .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        );

        if (payload.email && payload.email.toLowerCase() === 'mustafakeksinn@gmail.com') {
          onLogin(
            {
              name: payload.name || 'Mustafa Keskin',
              email: payload.email,
              picture: payload.picture || ''
            },
            token
          );
        } else {
          setErrorMessage('Yetkisiz Giriş! Yalnızca yetkili yönetici (mustafakeksinn@gmail.com) panele erişebilir.');
        }
      } catch (err) {
        setErrorMessage('Google yetkilendirme doğrulaması başarısız oldu.');
      }
    };

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '93580675475-1asn8uudfa8pl2oe4ffg2lnib9o70flq.apps.googleusercontent.com',
        callback: window.handleGoogleCredential
      });
      window.google.accounts.id.renderButton(document.getElementById('googleSignInBtn'), {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'sign_in_with'
      });
    }
  }, [onLogin]);

  const handleKeyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    const enteredKey = adminKey.trim();
    if (!enteredKey) {
      setErrorMessage('Lütfen yönetici güvenlik anahtarını girin.');
      setIsVerifying(false);
      return;
    }

    // Master Anahtar Doğrulaması (Sunucu ile tam eşleşen güvenlik standardı)
    if (enteredKey === 'MuminAdmin2026!' || enteredKey === 'mustafakeskin2026') {
      onLogin(
        {
          name: 'Mustafa Keskin',
          email: 'mustafakeksinn@gmail.com',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
        },
        enteredKey
      );
    } else {
      setErrorMessage('Hatalı Yönetici Güvenlik Anahtarı! Erişim reddedildi.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(212,175,55,0.1)', borderRadius: '50%', marginBottom: '16px' }}>
          <Compass size={48} color="#D4AF37" />
        </div>
        <h1>Mümin Pusulası</h1>
        <p>Bulut Yönetim & Canlı API Kontrol Merkezi. Panele erişmek için güvenli yönetici doğrulamasını tamamlayın.</p>

        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Güvenli Yönetici Şifre / Anahtar Girişi */}
        <form onSubmit={handleKeyLogin} style={{ width: '100%', marginBottom: '20px' }}>
          <div className="input-group" style={{ textAlign: 'left', marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} color="#D4AF37" />
              <span>Yönetici Güvenlik Anahtarı / Şifresi</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Yönetici şifrenizi girin..."
                style={{ width: '100%', paddingLeft: '40px' }}
                autoComplete="current-password"
              />
              <Lock
                size={16}
                color="#8E8E93"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', color: '#688879', marginTop: '4px', display: 'block' }}>
              Varsayılan Master Anahtar: <code>MuminAdmin2026!</code>
            </span>
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isVerifying}
          >
            <ShieldCheck size={18} />
            <span>{isVerifying ? 'Doğrulanıyor...' : 'Güvenli Giriş Yap'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.75rem', color: '#8E8E93' }}>veya Google ile</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        {/* 2. Google OAuth */}
        <div id="googleSignInBtn" style={{ width: '100%', minHeight: '44px' }}></div>
      </div>
    </div>
  );
};
