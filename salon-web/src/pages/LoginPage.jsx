import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* ── Brand panel (left) ── */}
      <div style={styles.brandPanel} aria-hidden="true">
        <div style={styles.brandInner}>
          <div style={styles.brandLogo}>
            <span style={styles.brandMark}>✦</span>
            <span style={styles.brandName}>Gloss</span>
            <span style={styles.brandDot}>.</span>
          </div>
          <p style={styles.brandTagline}>
            Your perfect salon,<br />
            <em>moments away.</em>
          </p>
          <div style={styles.brandAccents}>
            <div style={styles.accentCircle1} />
            <div style={styles.accentCircle2} />
            <div style={styles.accentCircle3} />
          </div>
        </div>
      </div>

      {/* ── Form panel (right) ── */}
      <main style={styles.formPanel}>
        <div style={styles.formInner} className="fade-in">
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Welcome back</h1>
            <p style={styles.formSub}>Log in to manage your bookings.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <span className="input-icon"><MailIcon /></span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field">
              <div style={styles.labelRow}>
                <label htmlFor="password">Password</label>
              </div>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? <><span className="spinner" /> Logging in…</> : 'Log in'}
            </button>
          </form>

          <p style={styles.switchLine}>
            New here?{' '}
            <Link to="/register" style={styles.switchLink}>Create an account</Link>
          </p>

          {/* Demo credentials */}
          <div style={styles.demoBox}>
            <span style={styles.demoPill}>Demo</span>
            <div style={styles.demoText}>
              <div><strong>Email:</strong> customer@salonapp.com</div>
              <div><strong>Password:</strong> Password123!</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - var(--nav-h))',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  /* Brand side */
  brandPanel: {
    background: 'linear-gradient(150deg, #5C1728 0%, #7A2036 45%, #3A1016 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  brandInner: {
    position: 'relative',
    zIndex: 1,
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  brandMark: {
    color: 'var(--gold)',
    fontSize: '1.2rem',
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    fontWeight: 500,
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  brandDot: {
    color: 'var(--gold)',
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 400,
    lineHeight: 1.3,
    maxWidth: 320,
  },
  brandAccents: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  accentCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'rgba(200,155,60,0.12)',
  },
  accentCircle2: {
    position: 'absolute',
    bottom: 40,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
  },
  accentCircle3: {
    position: 'absolute',
    bottom: -100,
    right: 20,
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'rgba(200,155,60,0.08)',
  },
  /* Form side */
  formPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    background: 'var(--paper)',
  },
  formInner: {
    width: '100%',
    maxWidth: 400,
  },
  formHeader: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: '1.9rem',
    fontWeight: 500,
    marginBottom: 6,
  },
  formSub: {
    color: 'var(--ink-soft)',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLine: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--ink-soft)',
    marginTop: 24,
  },
  switchLink: {
    color: 'var(--wine)',
    fontWeight: 600,
    textDecoration: 'none',
  },
  demoBox: {
    marginTop: 28,
    padding: '14px 16px',
    background: 'var(--paper-muted)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    fontSize: '0.82rem',
    color: 'var(--ink-soft)',
    lineHeight: 1.7,
  },
  demoPill: {
    background: 'var(--gold-light)',
    color: 'var(--gold-dark)',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
    marginTop: 2,
  },
  demoText: {},
};
