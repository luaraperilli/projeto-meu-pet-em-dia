import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';
import { Suprimento } from '../../types/Suprimento';

interface SuprimentoListProps {
  onEdit: (s: Suprimento) => void;
  onRefresh: () => void;
  refreshKey: number;
}

function diasRestantes(s: Suprimento): number | null {
  if (!s.consumoDiario || s.consumoDiario <= 0) return null;
  return Math.floor(s.quantidade / s.consumoDiario);
}

export function SuprimentoList({ onEdit, onRefresh, refreshKey }: SuprimentoListProps) {
  const { showToast, ToastComponent } = useToast();
  const [suprimentos, setSuprimentos] = useState<Suprimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/suprimentos`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao carregar suprimentos');
      const data = await res.json();
      setSuprimentos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function onDelete(id: number) {
    if (!confirm('Excluir este suprimento?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/suprimentos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 204) throw new Error('Falha ao excluir');
      showToast('Suprimento excluído', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro', 'error');
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 32 }}>⏳ Carregando...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: 32, color: 'var(--error)' }}>{error}</div>;

  return (
    <div style={{ padding: '24px 0' }}>
      {ToastComponent}
      {!suprimentos.length ? (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--background)',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
          <p style={{ color: 'var(--text-secondary)' }}>Nenhum suprimento cadastrado</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background)' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Nome</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Categoria</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Pet</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Quantidade</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Dias restantes</th>
                <th style={{ padding: 12, textAlign: 'center', width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {suprimentos.map((s, idx) => {
                const dias = diasRestantes(s);
                const alerta = dias !== null && dias <= s.diasAlerta;
                return (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: alerta ? 'rgba(255, 107, 107, 0.08)' : idx % 2 === 0 ? 'var(--surface)' : 'var(--background)',
                    }}
                  >
                    <td style={{ padding: 12, fontWeight: 600 }}>
                      {alerta && <span style={{ marginRight: 6 }}>⚠️</span>}
                      {s.nome}
                    </td>
                    <td style={{ padding: 12 }}>{s.categoria}</td>
                    <td style={{ padding: 12 }}>{s.petName || '-'}</td>
                    <td style={{ padding: 12 }}>
                      {s.quantidade} {s.unidade}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        color: alerta ? 'var(--error)' : 'var(--text-primary)',
                        fontWeight: alerta ? 600 : 400,
                      }}
                    >
                      {dias !== null ? `${dias} dias` : '-'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => onEdit(s)} style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}>
                          Editar
                        </button>
                        <button
                          className="danger"
                          onClick={() => onDelete(s.id)}
                          style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
