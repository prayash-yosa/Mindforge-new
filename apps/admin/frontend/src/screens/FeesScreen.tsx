import { useEffect, useState } from 'react';
import { PageTransition } from '../components/Animations';
import { api } from '../api/client';

interface GradeConfig {
  id: string;
  grade: number;
  academicYear: string;
  totalFeeAmount: number;
}

export default function FeesScreen() {
  const [configs, setConfigs] = useState<GradeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: GradeConfig[] }>('/v1/admin/fees/grade-configs')
      .then((r) => setConfigs(r.data ?? []))
      .catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-brown)' }}>Fees Configuration</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Grade fees & extra subject fees
      </p>

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
        ) : configs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No grade fee configs. Add configs via API.
          </div>
        ) : (
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-cream-dark)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Grade</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Academic Year</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Fee</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{c.grade}</td>
                  <td style={{ padding: '0.75rem' }}>{c.academicYear}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{c.totalFeeAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
