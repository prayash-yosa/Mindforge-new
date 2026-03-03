import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { ChildAttendanceSummary } from '../api/types';

type View = 'weekly' | 'monthly' | 'yearly';

export function AttendanceScreen() {
  const [view, setView] = useState<View>('monthly');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<ChildAttendanceSummary | null>(null);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      let url = '/v1/parent/child/attendance/';
      if (view === 'weekly') url += 'weekly';
      else if (view === 'monthly') url += `monthly?month=${month}&year=${year}`;
      else url += `yearly?year=${year}`;
      const res = await api.get<{ success: boolean; data: ChildAttendanceSummary }>(url);
      setData((res as { data: ChildAttendanceSummary }).data);
      setState('success');
    } catch (e: unknown) {
      setError((e as { error?: { message?: string } })?.error?.message ?? 'Failed to load');
      setState('error');
    }
  }, [view, month, year]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={s.page}>
      <div style={s.content}>
        <h1 style={s.title}>Attendance</h1>
        <div style={s.segmented}>
          {(['weekly', 'monthly', 'yearly'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{ ...s.segBtn, ...(view === v ? s.segBtnActive : {}) }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {view === 'monthly' && (
          <div style={s.controls}>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={s.select}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={s.select}>
              {[year - 2, year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
        {view === 'yearly' && (
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={s.select}>
            {[year - 2, year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
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
        {state === 'success' && data && (
          <>
            <div style={s.summary}>
              <p style={s.percent}>{data.percent}%</p>
              <p style={s.sub}>
                {data.present} / {data.total} days present
              </p>
              {data.period && (
                <p style={s.period}>
                  {data.period.startDate} — {data.period.endDate}
                </p>
              )}
            </div>
            {data.absentDates && data.absentDates.length > 0 && (
              <div style={s.absentSection}>
                <h3 style={s.absentTitle}>Absent days</h3>
                <div style={s.calendarGrid}>
                  {data.absentDates.map((d) => (
                    <span key={d} style={s.absentDate}>{d}</span>
                  ))}
                </div>
              </div>
            )}
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
  segmented: {
    display: 'flex',
    gap: 0,
    marginBottom: 20,
    background: 'var(--color-cream-dark)',
    borderRadius: 'var(--radius-sm)',
    padding: 4,
  },
  segBtn: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    border: 'none',
    background: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    borderRadius: 8,
    transition: 'var(--transition)',
  },
  segBtnActive: {
    background: 'var(--color-surface)',
    color: 'var(--color-brown)',
    fontWeight: 600,
    boxShadow: 'var(--shadow-sm)',
  },
  controls: { display: 'flex', gap: 12, marginBottom: 20 },
  select: {
    padding: '10px 14px',
    fontSize: 14,
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
  },
  summary: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    padding: 24,
    marginBottom: 20,
    boxShadow: 'var(--shadow-sm)',
  },
  percent: { fontSize: 36, fontWeight: 700, color: 'var(--color-sage-dark)', margin: '0 0 8px' },
  sub: { fontSize: 16, color: 'var(--color-text-muted)', margin: '0 0 4px' },
  period: { fontSize: 12, color: 'var(--color-text-muted)', margin: 0 },
  absentSection: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    padding: 16,
    boxShadow: 'var(--shadow-sm)',
  },
  absentTitle: { fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: 'var(--color-brown)' },
  calendarGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  absentDate: {
    padding: '6px 10px',
    background: '#fce4ec',
    color: 'var(--color-incorrect)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
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
