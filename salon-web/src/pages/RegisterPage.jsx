import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
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
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const PERKS = [
  'Instant booking confirmation',
  'Manage & cancel appointments',
  'Discover top-rated stylists',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* ── Brand panel ── */}
      <div style={styles.brandPanel} aria-hidden="true">
        <div style={styles.brandInner}>
          <div style={styles.brandLogo}>
            <span style={styles.brandMark}>✦</span>
            <span style={styles.brandName}>Gloss</span>
            <span style={styles.brandDot}>.</span>
          </div>
          <p style={styles.brandTagline}>
            Join thousands who book<br />
            <em>their best look with us.</em>
          </p>
          <ul style={styles.perkList} aria-label="Account benefits">
            {PERKS.map((perk) => (
              <li key={perk} style={styles.perkItem}>
                <span style={styles.perkCheck}><CheckIcon /></span>
                {perk}
              </li>
            ))}
          </ul>
          <div style={styles.brandAccents}>
            <div style={styles.accentCircle1} />
            <div style={styles.accentCircle2} />
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <main style={styles.formPanel}>
        <div style={styles.formInner} className="fade-in">
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Create your account</h1>
            <p style={styles.formSub}>Ready in under a minute.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <div className="input-wrap">
                <span className="input-icon"><UserIcon /></span>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Jane Smith"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <span className="input-icon"><MailIcon /></span>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="phone">Phone</label>
              <div className="input-wrap">
                <span className="input-icon"><PhoneIcon /></span>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p style={styles.switchLine}>
            Already have an account?{' '}
            <Link to="/login" style={styles.switchLink}>Log in</Link>
          </p>
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
  brandPanel: {
    background: 'linear-gradient(150deg, #3A2C1A 0%, #5C4520 50%, #1E1714 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  brandInner: { position: 'relative', zIndex: 1 },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  brandMark: { color: 'var(--gold)', fontSize: '1.2rem' },
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
    fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
    fontWeight: 400,
    lineHeight: 1.35,
    maxWidth: 320,
    marginBottom: 36,
  },
  perkList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  perkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.92rem',
    fontWeight: 500,
  },
  perkCheck: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'rgba(200,155,60,0.25)',
    border: '1.5px solid rgba(200,155,60,0.6)',
    color: 'var(--gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandAccents: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  accentCircle1: {
    position: 'absolute', top: -60, right: -60,
    width: 260, height: 260, borderRadius: '50%',
    background: 'rgba(200,155,60,0.10)',
  },
  accentCircle2: {
    position: 'absolute', bottom: -80, left: -40,
    width: 200, height: 200, borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
  },
  formPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    background: 'var(--paper)',
  },
  formInner: { width: '100%', maxWidth: 400 },
  formHeader: { marginBottom: 28 },
  formTitle: { fontSize: '1.9rem', fontWeight: 500, marginBottom: 6 },
  formSub: { color: 'var(--ink-soft)', fontSize: '0.95rem' },
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
};
