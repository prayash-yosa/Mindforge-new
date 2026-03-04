import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { PageTransition } from '../components/Animations';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ token: string; adminName: string; adminId: string }>('/v1/admin/auth/login', {
        email,
        password,
      });
      login(res.token, res.adminName, res.adminId);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ token: string; adminName: string; adminId: string }>('/v1/admin/auth/demo-login', {});
      login(res.token, res.adminName, res.adminId);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '1.5rem',
            margin: '1rem',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-sage-dark)', marginBottom: '0.25rem' }}>
              Mindforge
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  minHeight: 44,
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem',
                }}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  minHeight: 44,
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem',
                }}
                disabled={loading}
              />
            </div>

            {error && (
              <div style={{ color: 'var(--color-incorrect)', fontSize: '0.85rem' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="touch-target"
              style={{
                padding: '0.75rem 1rem',
                minHeight: 48,
                background: 'var(--color-sage)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="touch-target"
              style={{
                padding: '0.6rem 1rem',
                minHeight: 44,
                color: 'var(--color-sage-dark)',
                fontSize: '0.9rem',
                background: 'transparent',
              }}
            >
              Demo login
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
