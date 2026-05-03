import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { Notificacao } from '../../types/Notificacao';

export function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/notificacoes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.json())
      .then((d) => setNotificacoes(Array.isArray(d) ? d : []))
      .catch(() => setNotificacoes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--warning), var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            🔔
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-primary)', fontSize: 'var(--text-3xl)' }}>Notificações</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Compromissos próximos e alertas de reposição de suprimentos
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>⏳ Carregando...</div>
        ) : !notificacoes.length ? (
          <div
            style={{
              textAlign: 'center',
              padding: 48,
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <p style={{ color: 'var(--text-secondary)' }}>Nada pendente! Tudo em dia.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notificacoes.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: 20,
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${n.tipo === 'agenda' ? 'var(--primary)' : 'var(--warning)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 32 }}>{n.tipo === 'agenda' ? '📅' : '📦'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{n.titulo}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{n.descricao}</div>
                </div>
                <div
                  style={{
                    padding: '6px 12px',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: n.diasRestantes <= 1 ? 'var(--error)' : 'var(--text-primary)',
                  }}
                >
                  {n.diasRestantes === 0 ? 'Hoje' : `${n.diasRestantes}d`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
