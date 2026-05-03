import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';
import { Pet } from '../../types/Pet';
import { RelatorioGastos, RelatorioSaude } from '../../types/Relatorio';

type Tab = 'saude' | 'gastos';

export function RelatoriosPage() {
  const { showToast, ToastComponent } = useToast();
  const [tab, setTab] = useState<Tab>('saude');
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [relatorioSaude, setRelatorioSaude] = useState<RelatorioSaude | null>(null);
  const [relatorioGastos, setRelatorioGastos] = useState<RelatorioGastos | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/pets`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.json())
      .then((d) => setPets(Array.isArray(d) ? d : []))
      .catch(() => setPets([]));
  }, []);

  function buildUrl(format?: 'pdf') {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (petId) params.set('petId', petId);
    if (format) params.set('format', format);
    return `${API_BASE_URL}/relatorios/${tab}?${params.toString()}`;
  }

  async function gerar() {
    if (!from || !to) {
      showToast('Selecione o período', 'error');
      return;
    }
    if (tab === 'saude' && !petId) {
      showToast('Selecione um pet', 'error');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildUrl(), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro');
      if (tab === 'saude') setRelatorioSaude(data);
      else setRelatorioGastos(data);
    } catch (err: any) {
      showToast(err.message || 'Erro', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function baixarPdf() {
    if (!from || !to) {
      showToast('Selecione o período', 'error');
      return;
    }
    if (tab === 'saude' && !petId) {
      showToast('Selecione um pet', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildUrl('pdf'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao gerar PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${tab}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast(err.message || 'Erro', 'error');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 16px' }}>
      {ToastComponent}
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            📊
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-primary)', fontSize: 'var(--text-3xl)' }}>Relatórios</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Visão consolidada por período, exportável em PDF</p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 32,
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              onClick={() => setTab('saude')}
              className={tab === 'saude' ? '' : 'secondary'}
              style={{ flex: 1 }}
            >
              💉 Saúde
            </button>
            <button
              onClick={() => setTab('gastos')}
              className={tab === 'gastos' ? '' : 'secondary'}
              style={{ flex: 1 }}
            >
              💰 Gastos
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div>
              <label>De *</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label>Até *</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <label>Pet {tab === 'saude' ? '*' : '(opcional)'}</label>
              <select value={petId} onChange={(e) => setPetId(e.target.value)}>
                <option value="">{tab === 'saude' ? 'Selecione' : 'Todos'}</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={gerar} disabled={loading} style={{ flex: 1, minWidth: 200 }}>
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
            <button onClick={baixarPdf} className="secondary" style={{ flex: 1, minWidth: 200 }}>
              Baixar PDF
            </button>
          </div>
        </div>

        {tab === 'saude' && relatorioSaude && (
          <div
            style={{
              marginTop: 24,
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 32,
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {relatorioSaude.pet.name} — {relatorioSaude.periodo.from} a {relatorioSaude.periodo.to}
            </h2>

            <h3>Registros de Saúde ({relatorioSaude.registros.length})</h3>
            {!relatorioSaude.registros.length ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum registro no período.</p>
            ) : (
              <ul>
                {relatorioSaude.registros.map((r) => (
                  <li key={r.id}>
                    {r.data} {r.horario} — <strong>{r.tipoRegistro}</strong> ({r.profissional})
                  </li>
                ))}
              </ul>
            )}

            <h3>Agendamentos ({relatorioSaude.agenda.length})</h3>
            {!relatorioSaude.agenda.length ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum agendamento no período.</p>
            ) : (
              <ul>
                {relatorioSaude.agenda.map((a) => (
                  <li key={a.id}>
                    {a.data} {a.horario} — <strong>{a.procedimento}</strong>
                    {a.profissional ? ` (${a.profissional})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'gastos' && relatorioGastos && (
          <div
            style={{
              marginTop: 24,
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 32,
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {relatorioGastos.periodo.from} a {relatorioGastos.periodo.to}
            </h2>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 600 }}>Total: R$ {relatorioGastos.total.toFixed(2)}</p>

            <h3>Por Categoria</h3>
            <ul>
              {Object.entries(relatorioGastos.porCategoria).map(([cat, valor]) => (
                <li key={cat}>
                  {cat}: <strong>R$ {valor.toFixed(2)}</strong>
                </li>
              ))}
            </ul>

            <h3>Por Pet</h3>
            <ul>
              {relatorioGastos.porPet.map((p) => (
                <li key={p.petName}>
                  {p.petName}: <strong>R$ {p.total.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
