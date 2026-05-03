import { useState } from 'react';
import { Avaliacao } from '../../types/Avaliacao';
import { AvaliacaoList } from './AvaliacaoList';
import { AvaliacaoModal } from './AvaliacaoModal';

export function AvaliacaoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Avaliacao | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #FFB347, #FF9F1C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              ⭐
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-primary)', fontSize: 'var(--text-3xl)' }}>Avaliações</h1>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Avalie veterinários e serviços que atenderam seus pets
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px' }}
          >
            <span style={{ fontSize: 20 }}>➕</span>
            Nova Avaliação
          </button>
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
          <AvaliacaoList
            refreshKey={refreshKey}
            onEdit={(a) => {
              setEditing(a);
              setModalOpen(true);
            }}
            onRefresh={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </div>

      <AvaliacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        registro={editing}
        onSuccess={() => {
          setModalOpen(false);
          setEditing(null);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
