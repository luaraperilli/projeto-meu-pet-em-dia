import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';
import { CATEGORIAS_SUPRIMENTO, CategoriaSuprimento, Suprimento } from '../../types/Suprimento';
import { Pet } from '../../types/Pet';

type FormState = {
  petId: string;
  nome: string;
  categoria: CategoriaSuprimento;
  quantidade: string;
  unidade: string;
  consumoDiario: string;
  diasAlerta: string;
};

interface SuprimentoFormProps {
  registro?: Suprimento | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SuprimentoForm({ registro, onSuccess, onCancel }: SuprimentoFormProps) {
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState<FormState>({
    petId: registro?.petId?.toString() || '',
    nome: registro?.nome || '',
    categoria: registro?.categoria || 'Ração',
    quantidade: registro?.quantidade.toString() || '',
    unidade: registro?.unidade || 'kg',
    consumoDiario: registro?.consumoDiario?.toString() || '',
    diasAlerta: registro?.diasAlerta.toString() || '7',
  });
  const [pets, setPets] = useState<Pet[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const canSubmit = useMemo(
    () =>
      form.nome.trim().length >= 3 &&
      !!form.unidade &&
      Number(form.quantidade) >= 0 &&
      Number(form.diasAlerta) >= 1 &&
      !submitting,
    [form, submitting],
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/pets`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.json())
      .then((d) => setPets(Array.isArray(d) ? d : []))
      .catch(() => setPets([]));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = registro ? `${API_BASE_URL}/suprimentos/${registro.id}` : `${API_BASE_URL}/suprimentos`;
      const method = registro ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          petId: form.petId ? Number(form.petId) : null,
          nome: form.nome.trim(),
          categoria: form.categoria,
          quantidade: Number(form.quantidade),
          unidade: form.unidade.trim(),
          consumoDiario: form.consumoDiario ? Number(form.consumoDiario) : null,
          diasAlerta: Number(form.diasAlerta),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar');
      showToast(registro ? 'Suprimento atualizado!' : 'Suprimento cadastrado!', 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Erro', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {ToastComponent}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div>
          <label>Nome *</label>
          <input value={form.nome} onChange={(e) => onChange('nome', e.target.value)} placeholder="Ex: Ração Premium 15kg" />
        </div>

        <div>
          <label>Categoria *</label>
          <select
            value={form.categoria}
            onChange={(e) => onChange('categoria', e.target.value as CategoriaSuprimento)}
          >
            {CATEGORIAS_SUPRIMENTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Pet (opcional)</label>
          <select value={form.petId} onChange={(e) => onChange('petId', e.target.value)}>
            <option value="">Geral (não vinculado a pet)</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Quantidade *</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.quantidade}
            onChange={(e) => onChange('quantidade', e.target.value)}
          />
        </div>

        <div>
          <label>Unidade *</label>
          <input
            value={form.unidade}
            onChange={(e) => onChange('unidade', e.target.value)}
            placeholder="kg, ml, unidades..."
          />
        </div>

        <div>
          <label>Consumo diário (opcional)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.consumoDiario}
            onChange={(e) => onChange('consumoDiario', e.target.value)}
            placeholder="Ex: 0.3"
          />
          <small style={{ color: 'var(--text-secondary)' }}>Usado pra calcular alerta de reposição</small>
        </div>

        <div>
          <label>Avisar com X dias *</label>
          <input
            type="number"
            min={1}
            value={form.diasAlerta}
            onChange={(e) => onChange('diasAlerta', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="submit" disabled={!canSubmit} style={{ flex: 1, minWidth: 200 }}>
          {submitting ? 'Salvando...' : registro ? '✓ Salvar' : '✓ Cadastrar'}
        </button>
        <button type="button" className="secondary" onClick={onCancel} style={{ flex: 1, minWidth: 200 }}>
          ✕ Cancelar
        </button>
      </div>
    </form>
  );
}
