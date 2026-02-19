import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/attendance', label: 'Attendance', icon: '📅' },
  { path: '/doubts', label: 'Doubts', icon: '💬' },
  { path: '/profile', label: 'Profile', icon: '👤' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{ ...styles.tab, color: active ? 'var(--color-sage-dark)' : 'var(--color-text-muted)' }}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <span style={styles.icon}>{tab.icon}</span>
            <span style={{ ...styles.label, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: 'var(--color-surface)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
    maxWidth: 480,
    margin: '0 auto',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '8px 16px',
    fontSize: 11,
    transition: 'var(--transition)',
  },
  icon: { fontSize: 20 },
  label: { fontSize: 11 },
};
