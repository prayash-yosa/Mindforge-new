import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { MenuIcon } from './Icons';

function getPageTitle(path: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/fees': 'Fees',
    '/payments': 'Payments',
    '/payment-info': 'Payment Info',
    '/audit-logs': 'Audit Logs',
  };
  return map[path] ?? 'Admin';
}

export function AppShell() {
  const { adminName, logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && <Sidebar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            padding: isMobile ? '0.75rem 1rem' : '0.75rem 1.5rem',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
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
                <MenuIcon size={24} />
              </button>
            )}
            <span style={{ color: isMobile ? 'var(--color-text)' : 'var(--color-text-muted)', fontSize: isMobile ? '1rem' : '0.9rem', fontWeight: isMobile ? 600 : 400 }}>
              {isMobile ? getPageTitle(location.pathname) : 'Admin Portal'}
            </span>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{adminName ?? 'Admin'}</span>
              <button
                onClick={logout}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  color: 'var(--color-sage-dark)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                }}
              >
                Logout
              </button>
            </div>
          )}
        </header>
        <div
          style={{
            padding: isMobile ? '1rem' : '1.5rem',
            flex: 1,
            paddingBottom: isMobile ? 'calc(1rem + env(safe-area-inset-bottom, 0))' : undefined,
          }}
        >
          <Outlet />
        </div>
      </main>
      {isMobile && (
        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          adminName={adminName}
          onLogout={logout}
        />
      )}
    </div>
  );
}
