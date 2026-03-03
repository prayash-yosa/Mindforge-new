import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ApiClientError } from '../auth/AuthContext';

type ScreenState = 'mobile' | 'mpin' | 'loading' | 'error' | 'locked';

export function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [mpin, setMpin] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>('mobile');
  const [errorMsg, setErrorMsg] = useState('');
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const update = () => {
      const diff = Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000));
      setCountdown(diff);
      if (diff <= 0) { setScreenState('mobile'); setLockedUntil(null); }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const handleMobileSubmit = useCallback(() => {
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      setMobileNumber(cleaned.slice(0, 10));
      setScreenState('mpin');
      setErrorMsg('');
      setMpin('');
    } else {
      setErrorMsg('Enter a valid 10-digit mobile number');
    }
  }, [mobileNumber]);

  const handleDigit = useCallback((d: string) => {
    if (screenState === 'loading' || screenState === 'locked') return;
    setErrorMsg('');
    setMpin((prev) => (prev.length < 6 ? prev + d : prev));
  }, [screenState]);

  const handleDelete = useCallback(() => {
    if (screenState === 'loading' || screenState === 'locked') return;
    setMpin((prev) => prev.slice(0, -1));
  }, [screenState]);

  const handleLogin = useCallback(async () => {
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length < 10 || mpin.length !== 6 || screenState === 'loading') return;
    setScreenState('loading');
    setErrorMsg('');
    try {
      await login(cleaned, mpin);
      navigate('/home', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        const e = err.error;
        if (e.code === 'LOCKED_OUT') {
          setScreenState('locked');
          const retrySec = e.retryAfter ?? 900;
          setLockedUntil(new Date(Date.now() + retrySec * 1000).toISOString());
          setErrorMsg(`Account locked. Try again in ${Math.ceil(retrySec / 60)} minutes.`);
          return;
        }
        setScreenState('error');
        setErrorMsg(e.message || 'Invalid credentials');
      } else {
        setScreenState('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
      setMpin('');
    }
  }, [mobileNumber, mpin, screenState, login, navigate]);

  useEffect(() => {
    if (mpin.length === 6 && screenState === 'mpin') handleLogin();
  }, [mpin, screenState, handleLogin]);

  const isLocked = screenState === 'locked';
  const isLoading = screenState === 'loading';

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.brand}>
          <img src="/images/logo.png" alt="Mindforge" style={s.logoImg} />
          <h1 style={s.title}>Mindforge</h1>
          <p style={s.subtitle}>Parent Portal</p>
        </div>

        <div style={s.card}>
          {screenState === 'mobile' ? (
            <>
              <div style={s.field}>
                <label htmlFor="mobile" style={s.label}>Mobile Number</label>
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ ...s.input, ...(errorMsg ? s.inputError : {}) }}
                  maxLength={10}
                  autoFocus
                />
              </div>
              {errorMsg && <p style={s.error}>{errorMsg}</p>}
              <button
                onClick={handleMobileSubmit}
                style={s.primaryBtn}
                disabled={mobileNumber.replace(/\D/g, '').length < 10}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <p style={s.prompt}>Enter 6-digit MPIN for {mobileNumber}</p>
              <div style={s.dotsRow} aria-label={`${mpin.length} of 6 digits entered`}>
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} style={{ ...s.dot, ...(i < mpin.length ? s.dotFilled : {}) }} />
                ))}
              </div>
              {errorMsg && <p style={s.error}>{errorMsg}</p>}
              {isLocked && <p style={s.locked}>Retry in {countdown}s</p>}
              {!isLocked && (
                <div style={s.keypad}>
                  {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d) =>
                    d === '' ? <div key="sp" /> : (
                      <button
                        key={d}
                        onClick={() => (d === '⌫' ? handleDelete() : handleDigit(d))}
                        style={s.keypadBtn}
                        disabled={isLoading}
                        aria-label={d === '⌫' ? 'Delete' : `Digit ${d}`}
                      >
                        {d}
                      </button>
                    )
                  )}
                </div>
              )}
              <button onClick={() => { setScreenState('mobile'); setErrorMsg(''); setMpin(''); }} style={s.backBtn}>
                Change number
              </button>
            </>
          )}
        </div>

        <p style={s.footer}>Mindforge Education Platform &middot; For Parents</p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-cream)',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  brand: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  logoImg: {
    width: 80,
    height: 80,
    borderRadius: 'var(--radius-lg)',
    objectFit: 'contain' as const,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--color-brown)',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: 'var(--color-surface)',
    padding: 24,
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-brown)',
  },
  input: {
    height: 48,
    padding: '0 14px',
    fontSize: 15,
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--color-border)',
    outline: 'none',
    background: 'var(--color-cream)',
    color: 'var(--color-text)',
    transition: 'var(--transition)',
  },
  inputError: { borderColor: 'var(--color-incorrect)' },
  prompt: { fontSize: 16, color: 'var(--color-brown)', textAlign: 'center' as const },
  dotsRow: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8 },
  dot: { width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--color-border)', background: 'var(--color-surface)' },
  dotFilled: { background: 'var(--color-sage-dark)', borderColor: 'var(--color-sage-dark)' },
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 8 },
  keypadBtn: {
    minHeight: 48,
    minWidth: 48,
    fontSize: 20,
    fontWeight: 500,
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-cream)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  primaryBtn: {
    height: 48,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-sage)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'var(--transition)',
  },
  backBtn: {
    width: '100%',
    padding: 12,
    fontSize: 14,
    color: 'var(--color-text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  error: {
    fontSize: 13,
    color: 'var(--color-incorrect)',
    background: '#fce4ec',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center' as const,
  },
  locked: { color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center' as const },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--color-text-muted)',
    marginTop: 8,
  },
};
