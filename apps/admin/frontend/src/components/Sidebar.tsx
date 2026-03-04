import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/users', label: 'Users' },
  { path: '/fees', label: 'Fees' },
  { path: '/payments', label: 'Payments' },
  { path: '/payment-info', label: 'Payment Info' },
  { path: '/audit-logs', label: 'Audit Logs' },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: '1rem 0',
      }}
    >
      <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-sage-dark)', fontWeight: 600 }}>Mindforge Admin</h2>
      </div>
      <nav>
        {NAV_ITEMS.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              display: 'block',
              padding: '0.6rem 1rem',
              color: isActive ? 'var(--color-sage-dark)' : 'var(--color-text)',
              fontWeight: isActive ? 600 : 400,
              background: isActive ? 'var(--color-cream-dark)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-sage)' : '3px solid transparent',
              textDecoration: 'none',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
