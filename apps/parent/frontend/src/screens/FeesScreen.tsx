import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { ChildFeesSummary, PayInfo } from '../api/types';

interface FeesHistoryEntry {
  date: string;
  amount: number;
  mode?: string;
}

export function FeesScreen() {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [summary, setSummary] = useState<ChildFeesSummary | null>(null);
  const [payInfo, setPayInfo] = useState<PayInfo | null>(null);
  const [history, setHistory] = useState<FeesHistoryEntry[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const [sumRes, payRes, histRes] = await Promise.all([
        api.get<{ success: boolean; data: ChildFeesSummary }>('/v1/parent/child/fees/summary'),
        api.get<{ success: boolean; data: PayInfo }>('/v1/parent/child/fees/pay-info'),
        api.get<{ success: boolean; data: FeesHistoryEntry[] }>('/v1/parent/child/fees/history'),
      ]);
      setSummary((sumRes as { data: ChildFeesSummary }).data);
      setPayInfo((payRes as { data: PayInfo }).data);
      setHistory((histRes as { data: FeesHistoryEntry[] }).data ?? []);
      setState('success');
    } catch (e: unknown) {
      setError((e as { error?: { message?: string } })?.error?.message ?? 'Failed to load');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={s.page}>
      <div style={s.content}>
        <h1 style={s.title}>Fees & Pay Info</h1>
        {state === 'loading' && <div style={s.skeleton}>Loading...</div>}
        {state === 'error' && (
          <div style={s.stateCard}>
            <p style={s.stateEmoji}>&#9888;&#65039;</p>
            <p style={s.stateTitle}>Something went wrong</p>
            <p style={s.stateDesc}>{error}</p>
            <button style={s.retryBtn} onClick={load} type="button">Retry</button>
          </div>
        )}
        {state === 'success' && summary && (
          <>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Fees Summary</h3>
              <p style={s.row}>Total: ₹{summary.total.toLocaleString()}</p>
              <p style={s.row}>Paid: ₹{summary.paid.toLocaleString()}</p>
              <p style={{
                ...s.row,
                color: summary.balance > 0 ? 'var(--color-incorrect)' : 'var(--color-sage-dark)',
              }}>
                Balance: ₹{summary.balance.toLocaleString()}
              </p>
              {summary.lastPaymentDate && (
                <p style={s.row}>Last payment: {summary.lastPaymentDate}</p>
              )}
            </div>
            {history.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Payment History</h3>
                {history.map((h, i) => (
                  <p key={i} style={s.row}>{h.date}: ₹{h.amount.toLocaleString()} {h.mode ? `(${h.mode})` : ''}</p>
                ))}
              </div>
            )}
            {payInfo && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Payment Details</h3>
                <p style={s.disclaimer}>Use your banking app to pay. This app does not process payments.</p>
                {payInfo.upiId && <p style={s.row}>UPI ID: {payInfo.upiId}</p>}
                {payInfo.bankName && <p style={s.row}>Bank: {payInfo.bankName}</p>}
                {payInfo.accountName && <p style={s.row}>Account: {payInfo.accountName}</p>}
                {payInfo.accountNumber && <p style={s.row}>A/c: {payInfo.accountNumber}</p>}
                {payInfo.ifsc && <p style={s.row}>IFSC: {payInfo.ifsc}</p>}
                {payInfo.qrCodeUrl && (
                  <img src={payInfo.qrCodeUrl} alt="Payment QR" style={s.qr} />
                )}
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
  disclaimer: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  qr: { width: 120, height: 120, marginTop: 12 },
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
