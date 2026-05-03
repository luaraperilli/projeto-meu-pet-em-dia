import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';
import { CATEGORIAS_FINANCEIRO, CategoriaFinanceiro, Financeiro } from '../../types/Financeiro';

interface FinanceiroListProps {
  onEdit: (r: Financeiro) => void;
  onRefresh: () => void;
  refreshKey: number;
}

export function FinanceiroList({ onEdit, onRefresh, refreshKey }: FinanceiroListProps) {
  const { showToast, ToastComponent } = useToast();
  const [registros, setRegistros] = useState<Financeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<'Todas' | CategoriaFinanceiro>('Todas');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/financeiro`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao carregar registros financeiros');
      const data = await res.json();
      setRegistros(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  const filtrados = useMemo(() => {
    if (filterCategoria === 'Todas') return registros;
    return registros.filter((r) => r.categoria === filterCategoria);
  }, [registros, filterCategoria]);

  const total = useMemo(() => filtrados.reduce((acc, r) => acc + r.valor, 0), [filtrados]);

  async function onDelete(id: number) {
    if (!confirm('Excluir este registro financeiro?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/financeiro/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 204) throw new Error('Falha ao excluir');
      showToast('Registro excluído', 'success');
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
        <div style={{ minWidth: 200 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Categoria</label>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value as 'Todas' | CategoriaFinanceiro)}
          >
            <option value="Todas">Todas</option>
            {CATEGORIAS_FINANCEIRO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            padding: '12px 16px',
            background: 'var(--background)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--font-semibold)',
          }}
        >
          Total: R$ {total.toFixed(2)}
        </div>
      </div>

      {!filtrados.length ? (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--background)',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>💰</div>
          <p style={{ color: 'var(--text-secondary)' }}>Nenhum registro financeiro</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background)' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Data</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Pet</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Categoria</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Valor</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Observações</th>
                <th style={{ padding: 12, textAlign: 'center', width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r, idx) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: idx % 2 === 0 ? 'var(--surface)' : 'var(--background)',
                  }}
                >
                  <td style={{ padding: 12 }}>{r.data}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{r.petName ?? `#${r.petId}`}</td>
                  <td style={{ padding: 12 }}>{r.categoria}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>R$ {r.valor.toFixed(2)}</td>
                  <td style={{ padding: 12, color: 'var(--text-secondary)' }}>{r.observacoes || '-'}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => onEdit(r)} style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}>
                        Editar
                      </button>
                      <button
                        className="danger"
                        onClick={() => onDelete(r.id)}
                        style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
