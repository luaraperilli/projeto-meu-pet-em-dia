import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useToast } from './Toast';
import { Pet } from '../../types/Pet';
import { PetAccessGrant } from '../../types/PetAccess';

interface PetAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet | null;
}

export function PetAccessModal({ isOpen, onClose, pet }: PetAccessModalProps) {
  const { showToast, ToastComponent } = useToast();
  const [acessos, setAcessos] = useState<PetAccessGrant[]>([]);
  const [vetEmail, setVetEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !pet) return;
    loadAcessos();
  }, [isOpen, pet]);

  async function loadAcessos() {
    if (!pet) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/pet-access/pet/${pet.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAcessos(Array.isArray(data) ? data : []);
    } catch {
      setAcessos([]);
    } finally {
      setLoading(false);
    }
  }

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    if (!pet || !vetEmail.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/pet-access/pet/${pet.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vetEmail: vetEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erro ao conceder acesso');
      showToast('Acesso concedido!', 'success');
      setVetEmail('');
      loadAcessos();
    } catch (err: any) {
      showToast(err.message === 'VetNotFound' ? 'Veterinário não encontrado' : err.message || 'Erro', 'error');
    }
  }

  async function revoke(vetUserId: number) {
    if (!pet) return;
    if (!confirm('Revogar acesso deste veterinário?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/pet-access/pet/${pet.id}/vet/${vetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 204) throw new Error('Falha ao revogar');
      showToast('Acesso revogado', 'success');
      loadAcessos();
    } catch (err: any) {
      showToast(err.message || 'Erro', 'error');
    }
  }

  if (!isOpen || !pet) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {ToastComponent}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0 }}>🔐 Acessos de {pet.name}</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: 'none' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <form onSubmit={grant} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <input
              type="email"
              placeholder="Email do veterinário"
              value={vetEmail}
              onChange={(e) => setVetEmail(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit">➕ Conceder</button>
          </form>

          {loading ? (
            <p>Carregando...</p>
          ) : !acessos.length ? (
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum veterinário tem acesso ainda.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {acessos.map((a) => (
                <li
                  key={a.id}
                  style={{
                    padding: 12,
                    background: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.vetName}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{a.vetEmail}</div>
                  </div>
                  <button className="danger" onClick={() => revoke(a.vetUserId)} style={{ padding: '6px 12px' }}>
                    Revogar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
