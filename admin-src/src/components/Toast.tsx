import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="toast-container">
      {type === 'success' ? (
        <CheckCircle2 size={20} color="#10B981" />
      ) : (
        <AlertCircle size={20} color="#EF4444" />
      )}
      <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
};
