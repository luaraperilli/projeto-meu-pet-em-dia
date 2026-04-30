import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: { bg: 'rgba(107, 207, 127, 0.15)', border: 'var(--success)', icon: '✓' },
    error: { bg: 'rgba(255, 107, 107, 0.15)', border: 'var(--error)', icon: '✗' },
    warning: { bg: 'rgba(255, 179, 71, 0.15)', border: 'var(--warning)', icon: '⚠' },
    info: { bg: 'rgba(78, 205, 196, 0.15)', border: 'var(--secondary)', icon: 'ℹ' },
  };

  const config = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        minWidth: '320px',
        maxWidth: '420px',
        padding: '16px 20px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: `4px solid ${config.border}`,
        animation: 'slideIn 0.3s ease',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          background: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'var(--font-bold)',
          color: config.border,
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          lineHeight: '1.5',
          wordBreak: 'break-word',
        }}
      >
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '4px',
          boxShadow: 'none',
          flexShrink: 0,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, ToastComponent };
}
