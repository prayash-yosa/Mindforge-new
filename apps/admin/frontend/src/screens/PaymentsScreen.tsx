import { useState } from 'react';
import { PageTransition } from '../components/Animations';

export default function PaymentsScreen() {
  const [studentId, setStudentId] = useState('');

  return (
    <PageTransition>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-brown)' }}>Payments</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Fee ledger & payment entry
      </p>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Student ID</label>
          <input
            type="text"
            placeholder="Enter student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 300,
              padding: '0.75rem 1rem',
              minHeight: 44,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Search for a student to view fee summary and payment history.
        </p>
      </div>
    </PageTransition>
  );
}
