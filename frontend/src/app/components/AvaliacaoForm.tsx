import { useMemo, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';
import { Avaliacao } from '../../types/Avaliacao';

type FormState = {
  profissional: string;
  servico: string;
  nota: number;
  comentario: string;
};

interface AvaliacaoFormProps {
  registro?: Avaliacao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AvaliacaoForm({ registro, onSuccess, onCancel }: AvaliacaoFormProps) {
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState<FormState>({
    profissional: registro?.profissional || '',
    servico: registro?.servico || '',
    nota: registro?.nota || 5,
    comentario: registro?.comentario || '',
  });
  const [submitting, setSubmitting] = useState(false);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const canSubmit = useMemo(
    () =>
      form.profissional.trim().length >= 3 &&
      form.servico.trim().length >= 3 &&
      form.nota >= 1 &&
      form.nota <= 5 &&
      !submitting,
    [form, submitting],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = registro ? `${API_BASE_URL}/avaliacoes/${registro.id}` : `${API_BASE_URL}/avaliacoes`;
      const method = registro ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          profissional: form.profissional.trim(),
          servico: form.servico.trim(),
          nota: form.nota,
          comentario: form.comentario.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar');
      showToast(registro ? 'Avaliação atualizada!' : 'Avaliação publicada!', 'success');
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
          <label>Profissional *</label>
          <input
            value={form.profissional}
            onChange={(e) => onChange('profissional', e.target.value)}
            placeholder="Nome do veterinário/tosador"
            maxLength={100}
          />
        </div>

        <div>
          <label>Serviço *</label>
          <input
            value={form.servico}
            onChange={(e) => onChange('servico', e.target.value)}
            placeholder="Ex: Consulta, Vacina, Banho"
            maxLength={100}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Nota *</label>
          <div style={{ display: 'flex', gap: 8, fontSize: 32 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => onChange('nota', n)}
                style={{
                  cursor: 'pointer',
                  color: n <= form.nota ? '#FFB347' : 'var(--border)',
                  userSelect: 'none',
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Comentário</label>
          <textarea
            rows={3}
            maxLength={500}
            value={form.comentario}
            onChange={(e) => onChange('comentario', e.target.value)}
            placeholder="Como foi sua experiência?"
          />
          <small style={{ color: 'var(--text-secondary)' }}>{form.comentario.length}/500</small>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="submit" disabled={!canSubmit} style={{ flex: 1, minWidth: 200 }}>
          {submitting ? 'Salvando...' : registro ? '✓ Salvar' : '✓ Publicar'}
        </button>
        <button type="button" className="secondary" onClick={onCancel} style={{ flex: 1, minWidth: 200 }}>
          ✕ Cancelar
        </button>
      </div>
    </form>
  );
}
