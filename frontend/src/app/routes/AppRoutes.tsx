import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@app/providers/AuthProvider';
import { LoginForm } from '@app/components/LoginForm';
import { RegisterForm } from '@app/components/RegisterForm';
import { Navbar } from '@app/components/Navbar';
import { AdminUsersPage } from '@app/components/AdminUsersPage';
import { PetsPage } from '@app/components/PetsPage';
import { AgendaPage } from '@app/components/AgendaPage';
import { RegistroSaudePage } from '@app/components/RegistroSaudePage';
import { FinanceiroPage } from '@app/components/FinanceiroPage';
import { SuprimentoPage } from '@app/components/SuprimentoPage';
import { AvaliacaoPage } from '@app/components/AvaliacaoPage';
import { RelatoriosPage } from '@app/components/RelatoriosPage';
import { NotificacoesPage } from '@app/components/NotificacoesPage';
import { PetsCompartilhadosPage } from '@app/components/PetsCompartilhadosPage';
import { PerfilPage } from '@app/components/PerfilPage';
import { EsqueciSenhaPage } from '@app/components/EsqueciSenhaPage';
import { ResetarSenhaPage } from '@app/components/ResetarSenhaPage';
import { TermosPage } from '@app/components/TermosPage';

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function TutorOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.type !== 'Tutor') return <Navigate to="/" replace />;
  return children;
}

function VetOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.type !== 'Veterinário') return <Navigate to="/" replace />;
  return children;
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTutor = user?.type === 'Tutor';
  const isVet = user?.type === 'Veterinário';

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
        {
          icon: '💰',
          title: 'Financeiro',
          subtitle: 'Controle de gastos',
          color: 'linear-gradient(135deg, #6BCF7F, #52B869)',
          path: '/financeiro',
        },
        {
          icon: '📦',
          title: 'Estoque',
          subtitle: 'Suprimentos e alertas de reposição',
          color: 'linear-gradient(135deg, #FFD93D, #F5C518)',
          path: '/estoque',
        },
        {
          icon: '⭐',
          title: 'Avaliações',
          subtitle: 'Avalie veterinários e serviços',
          color: 'linear-gradient(135deg, #FFB347, #FF9F1C)',
          path: '/avaliacoes',
        },
        {
          icon: '📊',
          title: 'Relatórios',
          subtitle: 'Saúde e gastos por período (PDF)',
          color: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          path: '/relatorios',
        },
      ]
    : isVet
      ? [
          {
            icon: '🐾',
            title: 'Pets Compartilhados',
            subtitle: 'Pets cujos tutores te concederam acesso',
            color: 'linear-gradient(135deg, var(--secondary), var(--primary))',
            path: '/pets-compartilhados',
          },
          {
            icon: '💉',
            title: 'Registros de Saúde',
            subtitle: 'Histórico clínico dos pets compartilhados',
            color: 'linear-gradient(135deg, #FFE66D, #F5D942)',
            path: '/registros-saude',
          },
          {
            icon: '⭐',
            title: 'Avaliações',
            subtitle: 'Veja avaliações de profissionais',
            color: 'linear-gradient(135deg, #FFB347, #FF9F1C)',
            path: '/avaliacoes',
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
            Bem-vindo ao painel de {isVet ? 'veterinário' : 'tutor'}
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
          <Route path="/termos" element={<TermosPage />} />
          <Route path="/pets" element={<TutorOnly><PetsPage /></TutorOnly>} />
          <Route path="/agenda" element={<TutorOnly><AgendaPage /></TutorOnly>} />
          <Route path="/registros-saude" element={<Protected><RegistroSaudePage /></Protected>} />
          <Route path="/financeiro" element={<TutorOnly><FinanceiroPage /></TutorOnly>} />
          <Route path="/estoque" element={<TutorOnly><SuprimentoPage /></TutorOnly>} />
          <Route path="/avaliacoes" element={<Protected><AvaliacaoPage /></Protected>} />
          <Route path="/relatorios" element={<TutorOnly><RelatoriosPage /></TutorOnly>} />
          <Route path="/notificacoes" element={<Protected><NotificacoesPage /></Protected>} />
          <Route path="/pets-compartilhados" element={<VetOnly><PetsCompartilhadosPage /></VetOnly>} />
          <Route path="/perfil" element={<Protected><PerfilPage /></Protected>} />
          <Route path="/admin/users" element={<AdminOnly><AdminUsersPage /></AdminOnly>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
