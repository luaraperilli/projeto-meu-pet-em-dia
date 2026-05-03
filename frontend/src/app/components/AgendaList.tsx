import { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL } from '@lib/api';
import { Agenda } from '../../types/Agenda';
import { PetSpecies } from '../../types/Pet';
import { useToast } from './Toast';

interface AgendaListProps {
  onEdit: (a: Agenda) => void;
  onRefresh: () => void;
  refreshKey: number;
}

type AgendaItem = Agenda & { petName: string; petSpecies: PetSpecies };

export function AgendaList({ onEdit, onRefresh, refreshKey }: AgendaListProps) {
  const { showToast, ToastComponent } = useToast();
  const [allAgendas, setAllAgendas] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<'Todos' | PetSpecies>('Todos');

  const SPECIES_OPTIONS: PetSpecies[] = ['Cachorro', 'Cavalo', 'Gato', 'Outros'];

  async function loadAllAgendas() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/agenda`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao carregar a agenda.');
      const data: AgendaItem[] = await res.json();
      setAllAgendas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar agenda.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllAgendas();
  }, [refreshKey]);

  const filteredAgendas = useMemo(() => {
    let lista = allAgendas;
    if (filterName.trim()) {
      const nomeLower = filterName.trim().toLowerCase();
      lista = lista.filter((a) => a.petName.toLowerCase().includes(nomeLower));
    }
    if (filterSpecies !== 'Todos') lista = lista.filter((a) => a.petSpecies === filterSpecies);
    return lista;
  }, [allAgendas, filterName, filterSpecies]);

  async function onDelete(id: number) {
    if (!confirm('Deseja remover este agendamento?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/agenda/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 204) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erro ao deletar.');
      }

      showToast('Agendamento removido com sucesso!', 'success');
      onRefresh();
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover agendamento.', 'error');
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 32 }}>⏳ Carregando agenda...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: 32, color: 'var(--error)' }}>{error}</div>;

  return (
    <div style={{ padding: '24px 0' }}>
      {ToastComponent}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 200, flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Nome</label>
          <input
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Buscar por nome do pet"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ minWidth: 200 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Espécie</label>
          <select value={filterSpecies} onChange={(e) => setFilterSpecies(e.target.value as 'Todos' | PetSpecies)}>
            <option value="Todos">Todas</option>
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {!filteredAgendas.length ? (
          <div
            style={{
              textAlign: 'center',
              padding: 48,
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--background)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🗓️</div>
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum agendamento encontrado para os filtros atuais.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: 'var(--background)' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Pet</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Espécie</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Data</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Horário</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Procedimento</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Profissional</th>
                  <th style={{ padding: 12, textAlign: 'center', width: 140 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgendas.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{a.petName}</td>
                    <td style={{ padding: 12 }}>{a.petSpecies}</td>
                    <td style={{ padding: 12 }}>{a.data}</td>
                    <td style={{ padding: 12 }}>{a.horario}</td>
                    <td style={{ padding: 12 }}>{a.procedimento}</td>
                    <td style={{ padding: 12 }}>{a.profissional || '-'}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          data-testid={`agenda-edit-${a.id}`}
                          onClick={() => onEdit(a)}
                          style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
                        >
                          Editar
                        </button>
                        <button
                          data-testid={`agenda-delete-${a.id}`}
                          className="danger"
                          onClick={() => onDelete(a.id)}
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
    </div>
  );
}
