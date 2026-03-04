import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardIcon,
  UsersIcon,
  FeesIcon,
  PaymentsIcon,
  PaymentInfoIcon,
  AuditLogsIcon,
  CloseIcon,
} from './Icons';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { path: '/users', label: 'Users', Icon: UsersIcon },
  { path: '/fees', label: 'Fees', Icon: FeesIcon },
  { path: '/payments', label: 'Payments', Icon: PaymentsIcon },
  { path: '/payment-info', label: 'Payment Info', Icon: PaymentInfoIcon },
  { path: '/audit-logs', label: 'Audit Logs', Icon: AuditLogsIcon },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  adminName: string | null;
  onLogout: () => void;
}

export function MobileDrawer({ open, onClose, adminName, onLogout }: MobileDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close menu"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'min(280px, 85vw)',
          maxWidth: 320,
          background: 'var(--color-surface)',
          zIndex: 1001,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerSlideIn 0.25s ease',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', color: 'var(--color-sage-dark)', fontWeight: 600 }}>Mindforge Admin</h2>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              padding: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon size={24} />
          </button>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                onClick={() => handleNav(path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  color: isActive ? 'var(--color-sage-dark)' : 'var(--color-text)',
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'var(--color-cream-dark)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--color-sage)' : '4px solid transparent',
                  textDecoration: 'none',
                  minHeight: 48,
                }}
              >
                <Icon size={22} color={isActive ? 'var(--color-sage-dark)' : 'var(--color-text-muted)'} />
                {label}
              </NavLink>
            );
          })}
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            {adminName ?? 'Admin'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              fontSize: '0.9rem',
              color: 'var(--color-sage-dark)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
