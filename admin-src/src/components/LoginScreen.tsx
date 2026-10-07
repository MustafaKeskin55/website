import React, { useState, useEffect, useRef } from 'react';
import { Compass, ShieldCheck, AlertCircle } from 'lucide-react';
import { AdminUser } from '../types';

interface LoginScreenProps {
  onLogin: (user: AdminUser, token: string) => void;
  initialError?: string | null;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AUTHORIZED_ADMIN_EMAIL = 'mustafakeksinn@gmail.com';
const GOOGLE_CLIENT_ID = '93580675475-1asn8uudfa8pl2oe4ffg2lnib9o70flq.apps.googleusercontent.com';

export const decodeJwtPayload = (token: string): any => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(
    decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  );
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, initialError }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const onLoginRef = useRef(onLogin);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onLoginRef.current = onLogin;
  }, [onLogin]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    let attempts = 0;

    const handleCredential = (response: any) => {
      try {
        const token = response.credential;
        const payload = decodeJwtPayload(token);

        if (
          payload.email &&
          payload.email_verified !== false &&
          payload.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL
        ) {
          setErrorMessage(null);
          onLoginRef.current(
            {
              name: payload.name || 'Yönetici',
              email: payload.email,
              picture: payload.picture || ''
            },
            token
          );
        } else {
          setErrorMessage('Yetkisiz giriş! Yalnızca yetkili yönetici Google hesabı panele erişebilir.');
        }
      } catch (_) {
        setErrorMessage('Google doğrulaması başarısız oldu. Lütfen tekrar deneyin.');
      }
    };

    // Google script'i async yüklendiği için hazır olana kadar bekle
    const init = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id && btnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        const containerWidth = btnRef.current.clientWidth || 280;
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
          locale: 'tr',
          width: Math.max(200, Math.min(containerWidth, 400))
        });
        setIsReady(true);
        return;
      }
      attempts += 1;
      if (attempts > 100) {
        setErrorMessage('Google giriş servisi yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.');
        return;
      }
      timer = window.setTimeout(init, 150);
    };

    init();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <Compass size={44} color="#D4AF37" />
        </div>
        <h1>Mümin Pusulası</h1>
        <p>Yönetim paneline erişmek için yetkili Google hesabınızla giriş yapın.</p>

        {errorMessage && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="google-btn-wrap">
          <div ref={btnRef} id="googleSignInBtn" className="google-btn-slot" />
          {!isReady && !errorMessage && <span className="google-btn-loading">Google yükleniyor...</span>}
        </div>

        <div className="login-note">
          <ShieldCheck size={14} />
          <span>Yalnızca tek yetkili hesap kabul edilir</span>
        </div>
      </div>
    </div>
  );
};
