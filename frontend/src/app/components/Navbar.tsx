import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@app/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@lib/api';

const PUBLIC_ROUTES = ['/login', '/register', '/esqueci-senha', '/resetar-senha', '/termos'];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifIds, setNotifIds] = useState<string[]>([]);

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    if (!user) return;
    const carregar = () =>
      fetch(`${API_BASE_URL}/notificacoes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => {
          const all: { id: string }[] = Array.isArray(d) ? d : [];
          const ids = all.map((n) => n.id);
          setNotifIds(ids);
          const seen = new Set<string>(JSON.parse(localStorage.getItem('notifSeen') || '[]'));
          setNotifCount(ids.filter((id) => !seen.has(id)).length);
        })
        .catch(() => setNotifCount(0));
    carregar();
    const t = setInterval(carregar, 60_000);
    return () => clearInterval(t);
  }, [user]);

  function abrirNotificacoes() {
    localStorage.setItem('notifSeen', JSON.stringify(notifIds));
    setNotifCount(0);
    navigate('/notificacoes');
  }

  if (!user || isPublicRoute) return null;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    ...(user.type === 'Tutor'
      ? [
          { path: '/pets', label: 'Pets', icon: '🐾' },
          { path: '/agenda', label: 'Agenda', icon: '📅' },
          { path: '/registros-saude', label: 'Saúde', icon: '💉' },
        ]
      : []),
  ];

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 32px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)',
        }}
        className="navbar-desktop"
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            fontFamily: 'var(--font-primary)',
            color: 'var(--primary)',
            textDecoration: 'none',
          }}
        >
          Meu Pet em Dia
        </Link>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              data-testid={link.path === '/admin/users' ? 'nav-admin-users' : undefined}
              style={{
                position: 'relative',
                color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 'var(--font-medium)',
                transition: 'color 0.3s ease',
                padding: '8px 0',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{link.icon}</span>
              {link.label}
              {location.pathname === link.path && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-16px',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--primary)',
                    borderRadius: '3px 3px 0 0',
                  }}
                />
              )}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={abrirNotificacoes}
            title="Notificações"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 24,
              padding: 8,
              position: 'relative',
              boxShadow: 'none',
            }}
          >
            🔔
            {notifCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  minWidth: 18,
                  height: 18,
                  padding: '0 4px',
                  background: 'var(--error)',
                  color: 'white',
                  borderRadius: 9,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifCount}
              </span>
            )}
          </button>

          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--surface)',
                fontWeight: 'var(--font-bold)',
                cursor: 'pointer',
                border: '2px solid var(--primary-light)',
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 220,
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  padding: 8,
                  zIndex: 1001,
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{user.name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user.type}</div>
                </div>
                <div
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/perfil');
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>👤</span>
                  Meu Perfil
                </div>
                <hr style={{ margin: '8px 0' }} />
                <div
                  onClick={logout}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: 'var(--error)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>🚪</span>
                  Sair
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <nav
        className="mobile-topbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1001,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 16px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--primary)',
            fontWeight: 'var(--font-semibold)',
          }}
        >
          <span style={{ fontSize: 'var(--text-base)' }}>Meu Pet em Dia</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <button
            onClick={abrirNotificacoes}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              padding: 6,
              position: 'relative',
              boxShadow: 'none',
            }}
          >
            🔔
            {notifCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  minWidth: 16,
                  height: 16,
                  padding: '0 3px',
                  background: 'var(--error)',
                  color: 'white',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifCount}
              </span>
            )}
          </button>

          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--surface)',
              fontWeight: 'var(--font-bold)',
              cursor: 'pointer',
              border: '2px solid var(--primary-light)',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: 220,
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: 8,
                zIndex: 1002,
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user.type}</div>
              </div>
              <div
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/perfil');
                }}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                }}
              >
                <span>👤</span>
                Meu Perfil
              </div>
              <hr style={{ margin: '8px 0' }} />
              <div
                onClick={logout}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: 'var(--error)',
                  cursor: 'pointer',
                }}
              >
                <span>🚪</span>
                Sair
              </div>
            </div>
          )}
        </div>
      </nav>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          display: 'none',
          justifyContent: 'space-around',
          padding: '8px 0 12px',
          boxShadow: '0 -2px 10px var(--shadow)',
          zIndex: 1000,
        }}
        className="bottom-nav"
      >
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              padding: '8px 10px',
              minWidth: 60,
            }}
          >
            <span
              style={{
                fontSize: '22px',
                transition: 'transform 0.3s ease',
                transform: location.pathname === link.path ? 'translateY(-2px)' : 'none',
              }}
            >
              {link.icon}
            </span>
            <span style={{ whiteSpace: 'nowrap' }}>{link.label}</span>
          </Link>
        ))}
      </nav>

      <style>{`
        @media (min-width: 769px) {
          .navbar-desktop { display: flex !important; }
          .bottom-nav { display: none !important; }
          .mobile-topbar { display: none !important; }
        }
        @media (max-width: 768px) {
          .navbar-desktop { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .bottom-nav { display: flex !important; }
          body { padding-bottom: 80px !important; }
        }
      `}</style>
    </>
  );
}
