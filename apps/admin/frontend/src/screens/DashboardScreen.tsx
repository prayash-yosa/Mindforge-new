import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/Animations';
import { PopCard, AnimatedList } from '../components/Animations';
import { api } from '../api/client';

interface Kpis {
  totalOutstanding?: number;
  paymentsThisMonth?: number;
}

export default function DashboardScreen() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [pending, setPending] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: Kpis }>('/v1/admin/fees/kpis').then((r) => r.data).catch(() => null),
      api.get<{ data: unknown[] }>('/v1/admin/users/pending').then((r) => r.data).catch(() => []),
    ]).then(([k, p]) => {
      setKpis(k ?? {});
      setPending(p ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading...
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-brown)' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <PopCard delay={0}>
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
              Pending Approvals
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-sage-dark)' }}>
              {pending.length}
            </div>
          </div>
        </PopCard>
        <PopCard delay={80}>
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
              Outstanding Fees
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brown)' }}>
              ₹{kpis?.totalOutstanding ?? 0}
            </div>
          </div>
        </PopCard>
        <PopCard delay={160}>
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
              Payments This Month
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-correct)' }}>
              ₹{kpis?.paymentsThisMonth ?? 0}
            </div>
          </div>
        </PopCard>
      </div>

      <PopCard delay={200}>
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--color-brown)' }}>Pending User Approvals</h2>
            <Link
              to="/users"
              style={{ fontSize: '0.9rem', color: 'var(--color-sage-dark)', fontWeight: 500 }}
            >
              View all →
            </Link>
          </div>
          <div style={{ padding: '1rem' }}>
            {pending.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No pending approvals.</p>
            ) : (
              <AnimatedList stagger={40}>
                {(pending as { id?: string; role?: string; username?: string }[]).map((u, i) => (
                  <div
                    key={u.id ?? i}
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{u.username ?? u.role ?? 'User'}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{u.role}</span>
                  </div>
                ))}
              </AnimatedList>
            )}
          </div>
        </div>
      </PopCard>
    </PageTransition>
  );
}
