import type { ReactNode } from 'react';

interface ScreenStatesProps {
  state: 'loading' | 'success' | 'error' | 'empty';
  loadingNode?: ReactNode;
  errorNode?: ReactNode;
  emptyNode?: ReactNode;
  children: ReactNode;
}

export function ScreenStates({
  state,
  loadingNode = <div style={styles.centered}>Loading...</div>,
  errorNode,
  emptyNode,
  children,
}: ScreenStatesProps & { errorMsg?: string; onRetry?: () => void }) {
  if (state === 'loading') return <>{loadingNode}</>;
  if (state === 'error' && errorNode) return <>{errorNode}</>;
  if (state === 'empty' && emptyNode) return <>{emptyNode}</>;
  return <>{children}</>;
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={styles.skeleton}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={styles.skeletonCard} />
      ))}
    </div>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={styles.errorCard}>
      <p>{message}</p>
      <button style={styles.retryBtn} onClick={onRetry}>Try Again</button>
    </div>
  );
}

export function EmptyCard({ message }: { message: string }) {
  return (
    <div style={styles.emptyCard}>
      <p>{message}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  centered: { padding: 40, textAlign: 'center', color: '#6b7280' },
  skeleton: { display: 'flex', flexDirection: 'column', gap: 16 },
  skeletonCard: { height: 100, background: '#e5e7eb', borderRadius: 12 },
  errorCard: { background: '#fef2f2', padding: 20, borderRadius: 12 },
  retryBtn: { marginTop: 12, padding: '10px 20px', background: '#4a7c59', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  emptyCard: { padding: 40, textAlign: 'center', color: '#6b7280' },
};
