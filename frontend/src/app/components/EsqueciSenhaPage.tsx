import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';

export function EsqueciSenhaPage() {
  const { showToast, ToastComponent } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setEnviado(true);
    } catch {
      showToast('Erro ao processar solicitação', 'error');
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
        <h1 style={{ fontFamily: 'var(--font-primary)', marginTop: 16, marginBottom: 16 }}>Esqueci minha senha</h1>

        {enviado ? (
          <div>
            <p>
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá instruções de recuperação.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              <strong>Modo dev:</strong> o token foi impresso no console do backend. Use ele em{' '}
              <Link to="/resetar-senha">/resetar-senha</Link>.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Informe seu email cadastrado e enviaremos instruções para redefinir a senha.
            </p>
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: 16 }}>
              {submitting ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
