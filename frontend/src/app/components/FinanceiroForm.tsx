import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';
import { CATEGORIAS_FINANCEIRO, CategoriaFinanceiro, Financeiro } from '../../types/Financeiro';
import { Pet } from '../../types/Pet';

type FormState = {
  petId: string;
  categoria: CategoriaFinanceiro;
  data: string;
  valor: string;
  observacoes: string;
};

interface FinanceiroFormProps {
  registro?: Financeiro | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FinanceiroForm({ registro, onSuccess, onCancel }: FinanceiroFormProps) {
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState<FormState>({
    petId: registro?.petId.toString() || '',
    categoria: registro?.categoria || 'Consulta',
    data: registro?.data || '',
    valor: registro?.valor.toString() || '',
    observacoes: registro?.observacoes || '',
  });
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const canSubmit = useMemo(
    () => !!form.petId && !!form.data && !!form.valor && Number(form.valor) >= 0 && !submitting && !loadingPets,
    [form, submitting, loadingPets],
  );

  useEffect(() => {
    const fetchPets = async () => {
      setLoadingPets(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/pets`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setPets(Array.isArray(data) ? data : []);
      } catch {
        showToast('Erro ao carregar pets', 'error');
      } finally {
        setLoadingPets(false);
      }
    };
    fetchPets();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = registro ? `${API_BASE_URL}/financeiro/${registro.id}` : `${API_BASE_URL}/financeiro`;
      const method = registro ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          petId: Number(form.petId),
          categoria: form.categoria,
          data: form.data,
          valor: Number(form.valor),
          observacoes: form.observacoes.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar');
      showToast(registro ? 'Registro atualizado!' : 'Registro criado!', 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {ToastComponent}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div>
          <label>Pet *</label>
          <select disabled={loadingPets} value={form.petId} onChange={(e) => onChange('petId', e.target.value)}>
            <option value="">{loadingPets ? 'Carregando...' : 'Selecione um pet'}</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Categoria *</label>
          <select value={form.categoria} onChange={(e) => onChange('categoria', e.target.value as CategoriaFinanceiro)}>
            {CATEGORIAS_FINANCEIRO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Data *</label>
          <input type="date" value={form.data} onChange={(e) => onChange('data', e.target.value)} />
        </div>

        <div>
          <label>Valor (R$) *</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.valor}
            onChange={(e) => onChange('valor', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Observações</label>
          <textarea
            rows={2}
            maxLength={200}
            value={form.observacoes}
            onChange={(e) => onChange('observacoes', e.target.value)}
            placeholder="Ex: Reforço antirrábica anual"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="submit" disabled={!canSubmit} style={{ flex: 1, minWidth: 200 }}>
          {submitting ? 'Salvando...' : registro ? '✓ Salvar Alterações' : '✓ Cadastrar Gasto'}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onCancel}
          disabled={submitting}
          style={{ flex: 1, minWidth: 200 }}
        >
          ✕ Cancelar
        </button>
      </div>
    </form>
  );
}
