import { useEffect, useState } from 'react';
import { PageTransition } from '../components/Animations';
import { api } from '../api/client';

interface AuditLog {
  id: string;
  adminId: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
}

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: AuditLog[] }>('/v1/admin/audit-logs')
      .then((r) => setLogs(r.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-brown)' }}>Audit Logs</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Admin action history
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
        ) : logs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No audit logs.
          </div>
        ) : (
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-cream-dark)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Entity</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{l.adminId}</td>
                  <td style={{ padding: '0.75rem' }}>{l.entityType}/{l.entityId}</td>
                  <td style={{ padding: '0.75rem' }}>{l.action}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(l.createdAt).toLocaleString()}</td>
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
