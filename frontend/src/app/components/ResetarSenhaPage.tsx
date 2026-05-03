import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';

export function ResetarSenhaPage() {
  const { showToast, ToastComponent } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro');
      showToast('Senha redefinida! Faça login com a nova senha.', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      showToast(err.message || 'Erro', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {ToastComponent}
      <div
        style={{
          maxWidth: 400,
          width: '100%',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <Link to="/login" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)' }}>
          ← Voltar
        </Link>
        <h1 style={{ fontFamily: 'var(--font-primary)', marginTop: 16, marginBottom: 16 }}>Redefinir senha</h1>

        <form onSubmit={onSubmit}>
          <label>Token (recebido por email)</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} required />

          <label style={{ marginTop: 12 }}>Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8-12 chars, maiúscula, número, especial"
            required
          />

          <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: 16 }}>
            {submitting ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
