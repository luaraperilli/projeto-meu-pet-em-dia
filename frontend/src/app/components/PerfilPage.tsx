import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';
import { useAuth } from '@app/providers/AuthProvider';
import { maskBrCPF } from '@utils/brCPF';
import { maskBrPhone } from '@utils/brPhone';
import { useToast } from './Toast';

export function PerfilPage() {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCpf(d.user.cpf || '');
          setPhone(d.user.phone || '');
          setAddress(d.user.address || '');
        }
      })
      .catch(() => {});
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('cpf', cpf.trim());
      fd.append('email', email.trim());
      fd.append('phone', phone.trim());
      if (address) fd.append('address', address);
      if (password) fd.append('password', password);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erro ao atualizar');
      showToast('Perfil atualizado!', 'success');
      setPassword('');
    } catch (err: any) {
      showToast(err.message || 'Erro', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 16px' }}>
      {ToastComponent}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-primary)', marginBottom: 24 }}>👤 Meu Perfil</h1>

        <form
          onSubmit={onSubmit}
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 32,
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <label>Nome *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label>E-mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>CPF *</label>
            <input value={cpf} onChange={(e) => setCpf(maskBrCPF(e.target.value))} required />
          </div>
          <div>
            <label>Celular *</label>
            <input value={phone} onChange={(e) => setPhone(maskBrPhone(e.target.value))} required />
          </div>
          <div>
            <label>Endereço</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label>Nova senha (deixe em branco para manter a atual)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8-12 chars, maiúscula, número, especial"
            />
          </div>

          <button type="submit" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
