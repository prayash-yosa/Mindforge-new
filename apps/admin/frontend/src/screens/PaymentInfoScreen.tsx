import { useEffect, useState } from 'react';
import { PageTransition } from '../components/Animations';
import { api } from '../api/client';

interface PaymentInfo {
  qrImageUrl?: string;
  upiId?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export default function PaymentInfoScreen() {
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: PaymentInfo | null }>('/v1/admin/payment-info')
      .then((r) => setInfo(r.data ?? null))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-brown)' }}>Payment Info</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        QR, UPI & bank details for Parent app
      </p>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.5rem',
        }}
      >
        {loading ? (
          <div style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : !info ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No payment info configured.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {info.upiId && <div><strong>UPI ID:</strong> {info.upiId}</div>}
            {info.bankName && <div><strong>Bank:</strong> {info.bankName}</div>}
            {info.accountName && <div><strong>Account Name:</strong> {info.accountName}</div>}
            {info.accountNumber && <div><strong>Account No:</strong> {info.accountNumber}</div>}
            {info.ifscCode && <div><strong>IFSC:</strong> {info.ifscCode}</div>}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
