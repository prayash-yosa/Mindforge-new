import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { ApiResponse, ParentDashboard, ParentProfile } from '../api/types';
import { Skeleton, CardSkeleton } from '../components/Skeleton';
import { PopCard, AnimatedList } from '../components/Animations';

type ScreenState = 'loading' | 'success' | 'error';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function HomeScreen() {
  const navigate = useNavigate();
  const [state, setState] = useState<ScreenState>('loading');
  const [dashboard, setDashboard] = useState<ParentDashboard | null>(null);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const [dashRes, profileRes] = await Promise.all([
        api.get<ApiResponse<ParentDashboard>>('/v1/parent/dashboard'),
        api.get<ApiResponse<ParentProfile>>('/v1/parent/profile'),
      ]);
      setDashboard(dashRes.data);
      setProfile(profileRes.data);
      setState('success');
    } catch (e: unknown) {
      const err = e as { error?: { message?: string } };
      setError(err?.error?.message ?? 'Failed to load. Pull to refresh.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const childName = profile?.child?.name ?? 'Child';
  const childClass = profile?.child?.class ?? '-';
  const childSection = profile?.child?.section ?? '';

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.greeting}>{greeting()},</p>
          <h1 style={s.name}>{profile?.parent?.name ?? 'Parent'}</h1>
          <p style={s.childPill}>
            Child: {childName} &bull; Class {childClass}{childSection ? childSection : ''}
          </p>
        </div>
      </header>

      <div style={s.content}>
        {state === 'loading' && (
          <div style={s.section}>
            <div style={s.kpiGrid}>
              {[0, 1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
            <div style={s.skeletonList}>
              <Skeleton height={14} width="30%" />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        )}

        {state === 'error' && (
          <div style={s.stateCard}>
            <p style={s.stateEmoji}>&#9888;&#65039;</p>
            <p style={s.stateTitle}>Something went wrong</p>
            <p style={s.stateDesc}>{error}</p>
            <button style={s.retryBtn} onClick={load} type="button">
              Retry
            </button>
          </div>
        )}

        {state === 'success' && dashboard && (
          <>
            {dashboard.latestTest && (
              <PopCard delay={0}>
                <div
                  style={s.card}
                  onClick={() => navigate('/progress')}
                  onKeyDown={(ev) => ev.key === 'Enter' && navigate('/progress')}
                  role="button"
                  tabIndex={0}
                  aria-label="View latest test"
                >
                  <h3 style={s.cardTitle}>Latest Test</h3>
                  <p style={s.cardSubject}>{dashboard.latestTest.subject}</p>
                  <p style={s.cardTest}>{dashboard.latestTest.testName}</p>
                  <p style={s.cardMarks}>
                    {dashboard.latestTest.childMarks}% (Highest: {dashboard.latestTest.highestMarks}%)
                  </p>
                </div>
              </PopCard>
            )}

            <div style={s.cardList}>
              <AnimatedList baseDelay={80} stagger={60}>
                <div
                  style={s.card}
                  onClick={() => navigate('/attendance')}
                  onKeyDown={(ev) => ev.key === 'Enter' && navigate('/attendance')}
                  role="button"
                  tabIndex={0}
                  aria-label="View attendance"
                >
                  <h3 style={s.cardTitle}>Attendance This Month</h3>
                  <p style={s.cardPercent}>{dashboard.attendanceThisMonth.percent}%</p>
                  <p style={s.cardSub}>
                    {dashboard.attendanceThisMonth.present} / {dashboard.attendanceThisMonth.total} days present
                  </p>
                </div>
                <div
                  style={s.card}
                  onClick={() => navigate('/fees')}
                  onKeyDown={(ev) => ev.key === 'Enter' && navigate('/fees')}
                  role="button"
                  tabIndex={0}
                  aria-label="View fees"
                >
                  <h3 style={s.cardTitle}>Fees Summary</h3>
                  <p style={s.cardSub}>
                    Paid: ₹{dashboard.feesSummary.paid.toLocaleString()} &bull; Balance: ₹
                    {dashboard.feesSummary.balance.toLocaleString()}
                  </p>
                </div>
              </AnimatedList>
            </div>

            <div style={s.quickLinks}>
              <button style={s.linkBtn} onClick={() => navigate('/progress')} type="button">
                Progress
              </button>
              <button style={s.linkBtn} onClick={() => navigate('/attendance')} type="button">
                Attendance
              </button>
              <button style={s.linkBtn} onClick={() => navigate('/fees')} type="button">
                Fees
              </button>
            </div>
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
  header: {
    padding: '20px 16px 12px',
  },
  greeting: {
    fontSize: 13,
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    marginBottom: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--color-brown)',
    letterSpacing: -0.3,
  },
  childPill: {
    fontSize: 14,
    color: 'var(--color-sage-dark)',
    marginTop: 4,
    fontWeight: 500,
  },
  content: { padding: '0 16px', marginTop: 8 },
  section: { padding: '0 16px' },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  skeletonList: {
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardList: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 14px',
    marginBottom: 12,
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
  },
  cardTitle: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    marginBottom: 6,
    fontWeight: 600,
  },
  cardSubject: { fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 4px' },
  cardTest: { fontSize: 15, fontWeight: 600, color: 'var(--color-brown)', margin: '0 0 4px' },
  cardMarks: { fontSize: 14, color: 'var(--color-sage-dark)', margin: 0 },
  cardPercent: { fontSize: 24, fontWeight: 700, color: 'var(--color-sage-dark)', margin: '0 0 4px' },
  cardSub: { fontSize: 14, color: 'var(--color-text-muted)', margin: 0 },
  quickLinks: { display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' },
  linkBtn: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-sage-dark)',
    background: 'var(--color-surface)',
    border: '1.5px solid var(--color-sage-light)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  stateCard: {
    margin: '40px 16px',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '40px 24px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  stateEmoji: { fontSize: 36, marginBottom: 12 },
  stateTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--color-brown)',
    marginBottom: 6,
  },
  stateDesc: {
    fontSize: 14,
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
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
