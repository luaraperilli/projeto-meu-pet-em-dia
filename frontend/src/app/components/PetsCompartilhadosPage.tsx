import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { SharedPet } from '../../types/PetAccess';

export function PetsCompartilhadosPage() {
  const [pets, setPets] = useState<SharedPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/pet-access/shared-with-me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Falha ao carregar'))))
      .then((d) => setPets(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            🐾
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-primary)', fontSize: 'var(--text-3xl)' }}>
              Pets Compartilhados
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Pets cujos tutores te concederam acesso (RF4.2)
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>⏳ Carregando...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--error)' }}>{error}</div>
        ) : !pets.length ? (
          <div
            style={{
              textAlign: 'center',
              padding: 48,
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '2px dashed var(--border)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔐</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Nenhum tutor te concedeu acesso a um pet ainda. Peça pra eles te adicionarem pelo seu email cadastrado.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {pets.map((pet) => (
              <div
                key={pet.id}
                style={{
                  padding: 20,
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {pet.photoPath ? (
                    <img
                      src={pet.photoPath.startsWith('http') ? pet.photoPath : `${API_BASE_URL}${pet.photoPath}`}
                      alt={pet.name}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: 'var(--background)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      🐶
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{pet.name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {pet.species}
                      {pet.breed ? ` · ${pet.breed}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Tutor: <strong>{pet.ownerName}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
