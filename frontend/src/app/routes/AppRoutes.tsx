import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@app/providers/AuthProvider';
import { LoginForm } from '@app/components/LoginForm';
import { RegisterForm } from '@app/components/RegisterForm';
import { Navbar } from '@app/components/Navbar';
import { PetsPage } from '@app/components/PetsPage';
import { AgendaPage } from '@app/components/AgendaPage';
import { RegistroSaudePage } from '@app/components/RegistroSaudePage';
import { NotificacoesPage } from '@app/components/NotificacoesPage';
import { PerfilPage } from '@app/components/PerfilPage';
import { EsqueciSenhaPage } from '@app/components/EsqueciSenhaPage';
import { ResetarSenhaPage } from '@app/components/ResetarSenhaPage';

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function TutorOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.type !== 'Tutor') return <Navigate to="/" replace />;
  return children;
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTutor = user?.type === 'Tutor';

  const dashboardCards = isTutor
    ? [
        {
          icon: '🐾',
          title: 'Meus Pets',
          subtitle: 'Cadastre e gerencie seus pets',
          color: 'linear-gradient(135deg, #FFA070, #FF8855)',
          path: '/pets',
        },
        {
          icon: '📅',
          title: 'Agenda',
          subtitle: 'Vacinas, consultas e lembretes',
          color: 'linear-gradient(135deg, #4ECDC4, #3BB5AC)',
          path: '/agenda',
        },
        {
          icon: '💉',
          title: 'Registros de Saúde',
          subtitle: 'Histórico e próximos reforços',
          color: 'linear-gradient(135deg, #FFE66D, #F5D942)',
          path: '/registros-saude',
        },
      ]
    : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <div
        style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: 'var(--text-3xl)', marginBottom: '8px' }}>
            Olá, {user?.name}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', margin: 0 }}>
            Bem-vindo ao painel de {user?.type === 'Veterinário' ? 'veterinário' : 'tutor'}
          </p>
        </div>
        <div
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--primary-dark)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {user?.type}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        {dashboardCards.map((card) => (
          <div
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {card.icon}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'var(--text-xl)',
                marginBottom: '8px',
                color: 'var(--text-primary)',
              }}
            >
              {card.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RootRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/resetar-senha" element={<ResetarSenhaPage />} />
          <Route path="/pets" element={<TutorOnly><PetsPage /></TutorOnly>} />
          <Route path="/agenda" element={<TutorOnly><AgendaPage /></TutorOnly>} />
          <Route path="/registros-saude" element={<TutorOnly><RegistroSaudePage /></TutorOnly>} />
          <Route path="/notificacoes" element={<Protected><NotificacoesPage /></Protected>} />
          <Route path="/perfil" element={<Protected><PerfilPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
