import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { ChildProgressTest } from '../api/types';
import { AnimatedList } from '../components/Animations';

export function ProgressScreen() {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [tests, setTests] = useState<ChildProgressTest[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const url =
        '/v1/parent/child/progress/tests' +
        (selectedSubject ? `?subject=${encodeURIComponent(selectedSubject)}` : '');
      const res = await api.get<{ success: boolean; data: { tests: ChildProgressTest[]; total: number } }>(url);
      const data = (res as { data: { tests: ChildProgressTest[] } }).data;
      setTests(data.tests);
      setState('success');
    } catch (e: unknown) {
      setError((e as { error?: { message?: string } })?.error?.message ?? 'Failed to load');
      setState('error');
    }
  }, [selectedSubject]);

  useEffect(() => {
    load();
  }, [load]);

  const subjects = [...new Set(tests.map((t) => t.subject))].sort();
  const filtered = selectedSubject ? tests.filter((t) => t.subject === selectedSubject) : tests;

  return (
    <div style={s.page}>
      <div style={s.content}>
        <h1 style={s.title}>Academic Progress</h1>
        {subjects.length > 0 && (
          <div style={s.chips}>
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                style={{ ...s.chip, ...(selectedSubject === subj ? s.chipActive : {}) }}
              >
                {subj}
              </button>
            ))}
          </div>
        )}
        {state === 'loading' && <div style={s.skeleton}>Loading...</div>}
        {state === 'error' && (
          <div style={s.stateCard}>
            <p style={s.stateEmoji}>&#9888;&#65039;</p>
            <p style={s.stateTitle}>Something went wrong</p>
            <p style={s.stateDesc}>{error}</p>
            <button style={s.retryBtn} onClick={load} type="button">Retry</button>
          </div>
        )}
        {state === 'success' && (
          <div style={s.list}>
            {filtered.length === 0 ? (
              <p style={s.empty}>No test results yet.</p>
            ) : (
              <AnimatedList baseDelay={0} stagger={50}>
                {filtered.map((t) => (
                  <div key={t.testId} style={s.card}>
                    <div style={s.cardRow}>
                      <span style={s.cardSubject}>{t.subject}</span>
                      <span style={s.cardDate}>{t.date}</span>
                    </div>
                    <p style={s.cardTest}>{t.testName}</p>
                    <p style={s.cardMarks}>
                      Child: {t.childMarks}% | Highest: {t.highestMarks}% | Lowest: {t.lowestMarks}%
                    </p>
                  </div>
                ))}
              </AnimatedList>
            )}
          </div>
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
  chips: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  chip: {
    padding: '8px 16px',
    fontSize: 14,
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  chipActive: {
    background: 'var(--color-sage)',
    color: '#fff',
    borderColor: 'var(--color-sage)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    boxShadow: 'var(--shadow-sm)',
  },
  cardRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  cardSubject: { fontSize: 12, color: 'var(--color-text-muted)' },
  cardDate: { fontSize: 12, color: 'var(--color-text-muted)' },
  cardTest: { fontSize: 15, fontWeight: 600, color: 'var(--color-brown)', margin: '0 0 8px' },
  cardMarks: { fontSize: 14, color: 'var(--color-sage-dark)', margin: 0 },
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
  empty: { textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 },
};
