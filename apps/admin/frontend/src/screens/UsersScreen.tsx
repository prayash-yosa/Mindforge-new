import { useEffect, useState } from 'react';
import { PageTransition } from '../components/Animations';
import { AnimatedList } from '../components/Animations';
import { api } from '../api/client';

interface User {
  id: string;
  role: string;
  username?: string;
  mobileNumber?: string;
  status: string;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = role ? `?role=${role}` : '';
    api
      .get<{ data: User[] }>(`/v1/admin/users/pending${q}`)
      .then((r) => setUsers(r.data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [role]);

  return (
    <PageTransition>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-brown)' }}>Users</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Approvals & account statuses
      </p>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface)',
          }}
        >
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="parent">Parents</option>
        </select>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No pending users.
          </div>
        ) : (
          <AnimatedList stagger={30}>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{u.username ?? u.mobileNumber ?? u.id}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{u.role} · {u.status}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="touch-target"
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--color-sage)',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="touch-target"
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </AnimatedList>
        )}
      </div>
    </PageTransition>
  );
}
