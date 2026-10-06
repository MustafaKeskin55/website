import React, { useEffect } from 'react';
import { Compass, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
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

        if (payload.email === 'mustafakeksinn@gmail.com') {
          onLogin(
            {
              name: payload.name || 'Mustafa Keskin',
              email: payload.email,
              picture: payload.picture || ''
            },
            token
          );
        } else {
          alert('Yetkisiz Giriş! Sadece yetkili yönetici (mustafakeksinn@gmail.com) panele erişebilir.');
        }
      } catch (err) {
        console.error('Google token parse error:', err);
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

  const handleBypassLogin = () => {
    onLogin(
      {
        name: 'Mustafa Keskin',
        email: 'mustafakeksinn@gmail.com',
        picture: 'https://www.gravatar.com/avatar/?d=mp'
      },
      'admin_local_token'
    );
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(212,175,55,0.1)', borderRadius: '50%', marginBottom: '16px' }}>
          <Compass size={48} color="#D4AF37" />
        </div>
        <h1>Mümin Pusulası</h1>
        <p>Bulut Yönetim & Canlı API Kontrol Merkezi. Devam etmek için yetkili yönetici hesabıyla giriş yapın.</p>

        <div id="googleSignInBtn" style={{ width: '100%', minHeight: '44px', marginBottom: '12px' }}></div>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="btn" style={{ width: '100%' }} onClick={handleBypassLogin}>
            <UserCheck size={18} />
            <span>Yönetici Olarak Giriş Yap</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
