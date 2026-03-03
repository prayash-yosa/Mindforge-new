import { useState, useEffect } from 'react';

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div style={styles.banner} role="alert" aria-live="polite">
      You are offline. Some data may not be available.
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    padding: '10px 16px',
    background: 'var(--color-cream-dark)',
    color: 'var(--color-brown)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 500,
    borderBottom: '1px solid var(--color-border)',
  },
};
