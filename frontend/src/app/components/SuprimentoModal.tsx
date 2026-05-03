import { useEffect, useRef } from 'react';
import { Suprimento } from '../../types/Suprimento';
import { SuprimentoForm } from './SuprimentoForm';

interface SuprimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  registro: Suprimento | null;
  onSuccess: () => void;
}

export function SuprimentoModal({ isOpen, onClose, registro, onSuccess }: SuprimentoModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = registro ? 'edit' : 'create';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: 700,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontFamily: 'var(--font-primary)', fontSize: 'var(--text-2xl)' }}>
            {mode === 'create' ? '📦 Novo Suprimento' : '✏️ Editar Suprimento'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: 'none' }}
          >
            ✕
          </button>
        </div>

        <SuprimentoForm
          registro={registro}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
