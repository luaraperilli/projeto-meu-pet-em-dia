import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useAuth } from '@app/providers/AuthProvider';
import { useToast } from './Toast';
import { Avaliacao } from '../../types/Avaliacao';

interface AvaliacaoListProps {
  onEdit: (a: Avaliacao) => void;
  onRefresh: () => void;
  refreshKey: number;
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: '#FFB347', letterSpacing: 2 }}>
      {'★'.repeat(n)}
      <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - n)}</span>
    </span>
  );
}

export function AvaliacaoList({ onEdit, onRefresh, refreshKey }: AvaliacaoListProps) {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterProfissional, setFilterProfissional] = useState('');
  const [filterNota, setFilterNota] = useState<'Todas' | number>('Todas');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterProfissional.trim()) params.set('profissional', filterProfissional.trim());
      if (filterNota !== 'Todas') params.set('nota', String(filterNota));
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/avaliacoes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar avaliações');
      const data = await res.json();
      setAvaliacoes(Array.isArray(data) ? data : []);
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
    if (!confirm('Excluir esta avaliação?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/avaliacoes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 204) throw new Error('Falha ao excluir');
      showToast('Avaliação excluída', 'success');
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
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 200, flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Profissional</label>
          <input
            value={filterProfissional}
            onChange={(e) => setFilterProfissional(e.target.value)}
            placeholder="Buscar por nome"
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Nota</label>
          <select
            value={filterNota.toString()}
            onChange={(e) => setFilterNota(e.target.value === 'Todas' ? 'Todas' : Number(e.target.value))}
          >
            <option value="Todas">Todas</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrelas
              </option>
            ))}
          </select>
        </div>
        <button onClick={load} style={{ minWidth: 140 }}>
          🔍 Buscar
        </button>
      </div>

      {!avaliacoes.length ? (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--background)',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>⭐</div>
          <p style={{ color: 'var(--text-secondary)' }}>Nenhuma avaliação encontrada</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {avaliacoes.map((a) => {
            const minha = user?.id === a.userId;
            return (
              <div
                key={a.id}
                style={{
                  padding: 20,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 4 }}>{a.profissional}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 8 }}>
                      {a.servico} · {a.data}
                    </div>
                    <Stars n={a.nota} />
                  </div>
                  {minha && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => onEdit(a)} style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
                        Editar
                      </button>
                      <button
                        className="danger"
                        onClick={() => onDelete(a.id)}
                        style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
                {a.comentario && (
                  <p style={{ marginTop: 12, marginBottom: 0, color: 'var(--text-primary)' }}>{a.comentario}</p>
                )}
                {a.autorNome && (
                  <p style={{ marginTop: 8, marginBottom: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    — {a.autorNome}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
