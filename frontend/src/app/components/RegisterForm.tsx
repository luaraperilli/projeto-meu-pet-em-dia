import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@app/providers/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { maskBrPhone, isCompleteBrPhone } from '@utils/brPhone';
import { maskBrCPF, isCompleteBrCPF } from '@utils/brCPF';
import { useToast } from './Toast';

type UserType = 'Tutor' | 'Veterinário';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [type, setType] = useState<UserType>('Tutor');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [crmv, setCrmv] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [professionalIdDoc, setProfessionalIdDoc] = useState<File | null>(null);
  const [diplomaDoc, setDiplomaDoc] = useState<File | null>(null);
  const isVet = type === 'Veterinário';
  const [loading, setLoading] = useState(false);

  const passwordRequirements = useMemo(
    () => ({
      length: password.length >= 8 && password.length <= 12,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    }),
    [password],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (name.trim().length < 3 || name.trim().length > 100) {
      showToast('❌ Nome deve ter entre 3 e 100 caracteres', 'error');
      setLoading(false);
      return;
    }
    if (!isCompleteBrCPF(cpf)) {
      showToast('❌ CPF incompleto. Use o formato: 000.000.000-00', 'error');
      setLoading(false);
      return;
    }
    if (email.trim().length < 10 || email.trim().length > 256) {
      showToast('❌ E-mail deve ter entre 10 e 256 caracteres', 'error');
      setLoading(false);
      return;
    }
    if (!isCompleteBrPhone(phone)) {
      showToast('❌ Celular inválido. Use o formato: (00) 00000-0000', 'error');
      setLoading(false);
      return;
    }
    if (!Object.values(passwordRequirements).every(Boolean)) {
      const missing = [];
      if (!passwordRequirements.length) missing.push('8 a 12 caracteres');
      if (!passwordRequirements.uppercase) missing.push('letra maiúscula');
      if (!passwordRequirements.number) missing.push('número');
      if (!passwordRequirements.special) missing.push('caractere especial');
      showToast(`❌ Senha precisa ter: ${missing.join(', ')}`, 'error');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      showToast('❌ As senhas não coincidem', 'error');
      setLoading(false);
      return;
    }
    if (isVet) {
      if (!crmv.trim()) {
        showToast('❌ CRMV é obrigatório para veterinários', 'error');
        setLoading(false);
        return;
      }
      if (!professionalIdDoc) {
        showToast('❌ Documento de identidade profissional é obrigatório', 'error');
        setLoading(false);
        return;
      }
      if (!diplomaDoc) {
        showToast('❌ Diploma/Certificado é obrigatório', 'error');
        setLoading(false);
        return;
      }
    }

    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('cpf', cpf.trim());
      fd.append('type', type);
      fd.append('email', email.trim());
      fd.append('phone', phone.trim());
      if (address) fd.append('address', address);
      fd.append('password', password);
      if (isVet) {
        fd.append('crmv', crmv.trim());
        fd.append('clinicAddress', clinicAddress.trim() || '');
        if (professionalIdDoc) fd.append('professionalIdDoc', professionalIdDoc);
        if (diplomaDoc) fd.append('diplomaDoc', diplomaDoc);
      }

      await register(fd);
      showToast('✅ Conta criada com sucesso! Bem-vindo!', 'success');
      setTimeout(() => navigate('/'), 800);
    } catch (err: any) {
      const errorMsg = err?.message || 'Falha ao registrar. Verifique os dados e tente novamente.';
      showToast(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isVet) {
      setCrmv('');
      setClinicAddress('');
      setProfessionalIdDoc(null);
      setDiplomaDoc(null);
    }
  }, [isVet]);

  return (
    <>
      {ToastComponent}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <Link
              to="/login"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ← Voltar
            </Link>
            <h1
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'var(--text-3xl)',
                marginTop: '16px',
                marginBottom: '8px',
              }}
            >
              Criar Conta
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Bem-vindo ao Meu Pet em Dia!
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ marginBottom: '12px' }}>Escolha seu perfil:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['Tutor', 'Veterinário'].map((t) => (
                <div
                  key={t}
                  onClick={() => setType(t as UserType)}
                  style={{
                    padding: '20px 16px',
                    border: `2px solid ${type === t ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: type === t ? 'rgba(255, 107, 157, 0.05)' : 'transparent',
                    boxShadow: type === t ? '0 0 0 3px rgba(255, 107, 157, 0.1)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{t === 'Tutor' ? '🏠' : '⚕️'}</div>
                  <div
                    style={{
                      fontWeight: 'var(--font-semibold)',
                      color: type === t ? 'var(--primary)' : 'var(--text-primary)',
                    }}
                  >
                    {t}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <label>Nome Completo *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" required />

            <label>CPF *</label>
            <input
              value={cpf}
              onChange={(e) => setCpf(maskBrCPF(e.target.value))}
              placeholder="000.000.000-00"
              required
            />

            {isVet ? (
              <>
                <label>CRMV *</label>
                <input value={crmv} onChange={(e) => setCrmv(e.target.value)} placeholder="Número do CRMV" required />

                <label>Documento de identidade profissional *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setProfessionalIdDoc(e.target.files?.[0] ?? null)}
                  style={{ padding: '10px 12px' }}
                  required
                />

                <label>Diploma/Certificado *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setDiplomaDoc(e.target.files?.[0] ?? null)}
                  style={{ padding: '10px 12px' }}
                  required
                />

                <label>Endereço da Clínica</label>
                <input
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="CEP e cidade"
                />
              </>
            ) : (
              <>
                <label>Endereço</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="CEP e cidade" />
              </>
            )}

            <label>E-mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />

            <label>Celular *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(maskBrPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              required
            />

            <label>Senha *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 a 12 caracteres"
              required
            />

            <label>Confirmar Senha *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
            />

            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Requisitos da senha:
              </div>
              {[
                { key: 'length', label: 'Mínimo 8 e máximo 12 caracteres' },
                { key: 'uppercase', label: 'Uma letra maiúscula' },
                { key: 'number', label: 'Um número' },
                { key: 'special', label: 'Um caractere especial' },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '16px',
                      color: passwordRequirements[key as keyof typeof passwordRequirements]
                        ? 'var(--success)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {passwordRequirements[key as keyof typeof passwordRequirements] ? '✓' : '○'}
                  </span>
                  <span
                    style={{
                      color: passwordRequirements[key as keyof typeof passwordRequirements]
                        ? 'var(--success)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
              {password && confirmPassword && password !== confirmPassword && (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', marginTop: '8px' }}
                >
                  <span>✗</span>
                  <span>As senhas não coincidem</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '24px', padding: '16px', fontSize: 'var(--text-lg)' }}
            >
              {loading ? 'Criando Conta...' : 'Criar Conta'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            Já tem conta?{' '}
            <Link to="/login" style={{ fontWeight: 'var(--font-semibold)', color: 'var(--primary)' }}>
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
