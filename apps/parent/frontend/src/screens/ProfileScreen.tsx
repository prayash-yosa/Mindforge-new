import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { ParentProfile } from '../api/types';

export function ProfileScreen() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const res = await api.get<{ success: boolean; data: ParentProfile }>('/v1/parent/profile');
      setProfile((res as { data: ParentProfile }).data);
      setState('success');
    } catch (e: unknown) {
      setError((e as { error?: { message?: string } })?.error?.message ?? 'Failed to load');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={s.page}>
      <div style={s.content}>
        <h1 style={s.title}>Profile</h1>
        {state === 'loading' && <div style={s.skeleton}>Loading...</div>}
        {state === 'error' && (
          <div style={s.stateCard}>
            <p style={s.stateEmoji}>&#9888;&#65039;</p>
            <p style={s.stateTitle}>Something went wrong</p>
            <p style={s.stateDesc}>{error}</p>
            <button style={s.retryBtn} onClick={load} type="button">Retry</button>
          </div>
        )}
        {state === 'success' && profile && (
          <>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Parent</h3>
              <p style={s.row}>Name: {profile.parent.name}</p>
              <p style={s.row}>Phone: {profile.parent.mobileNumber}</p>
              <p style={s.row}>Relationship: {profile.parent.relationship}</p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Child</h3>
              <p style={s.row}>Name: {profile.child.name}</p>
              <p style={s.row}>Class: {profile.child.class}{profile.child.section ? profile.child.section : ''}</p>
            </div>
            <p style={s.contact}>Contact school for support.</p>
            <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    paddingBottom: 80,
    minHeight: '100dvh',
    background: 'var(--color-cream)',
  },
  content: { padding: '20px 16px' },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 16px',
    color: 'var(--color-brown)',
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 14px',
    marginBottom: 16,
    boxShadow: 'var(--shadow-sm)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: '0 0 12px',
    color: 'var(--color-brown)',
  },
  row: { fontSize: 14, margin: '4px 0', color: 'var(--color-text-muted)' },
  contact: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    marginBottom: 24,
  },
  logoutBtn: {
    width: '100%',
    padding: 14,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-incorrect)',
    background: 'var(--color-surface)',
    border: '1.5px solid var(--color-incorrect)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  skeleton: { padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' },
  stateCard: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '40px 24px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  stateEmoji: { fontSize: 36, marginBottom: 12 },
  stateTitle: { fontSize: 17, fontWeight: 700, color: 'var(--color-brown)', marginBottom: 6 },
  stateDesc: { fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5 },
  retryBtn: {
    marginTop: 16,
    height: 40,
    padding: '0 24px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-sage)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
  },
};
