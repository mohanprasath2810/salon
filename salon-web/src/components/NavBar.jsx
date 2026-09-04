import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Shadow on scroll
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Overlay for mobile menu */}
      <div
        className={`mobile-nav-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <header style={{ ...styles.header, ...(scrolled ? styles.headerScrolled : {}) }}>
        <div className="container" style={styles.inner}>

          {/* Logo */}
          <Link to="/" style={styles.logo} aria-label="Gloss home">
            <span style={styles.logoMark}>✦</span>
            <span>Gloss</span>
            <span style={styles.logoDot}>.</span>
          </Link>

          {/* Desktop nav */}
          <nav style={styles.desktopNav} aria-label="Main navigation">
            <Link
              to="/"
              style={styles.link}
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Discover
            </Link>
            {user && (
              <Link
                to="/bookings"
                style={styles.link}
                className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}
              >
                My Bookings
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                style={styles.adminLink}
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                ⚙ Admin
              </Link>
            )}
            {user?.role === 'SALON_OWNER' && (
              <Link
                to="/owner"
                style={styles.ownerLink}
                className={`nav-link ${isActive('/owner') ? 'active' : ''}`}
              >
                🏠 My Salon
              </Link>
            )}

            <div style={styles.navSep} aria-hidden="true" />

            {user ? (
              <>
                <div style={styles.userChip}>
                  <div style={styles.userAvatar}>{user.name?.[0]?.toUpperCase() ?? '?'}</div>
                  <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="btn btn-icon show-mobile"
            style={styles.hamburger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>

        {/* Mobile drawer */}
        <div style={{ ...styles.mobileDrawer, ...(menuOpen ? styles.mobileDrawerOpen : {}) }} aria-hidden={!menuOpen}>
          <nav style={styles.mobileNav}>
            <Link to="/" style={styles.mobileLink}>
              <span>Discover</span>
            </Link>
            {user && (
              <Link to="/bookings" style={styles.mobileLink}>
                <span>My Bookings</span>
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" style={{ ...styles.mobileLink, color: 'var(--wine)', fontWeight: 700 }}>
                <span>⚙ Admin Dashboard</span>
              </Link>
            )}
            {user?.role === 'SALON_OWNER' && (
              <Link to="/owner" style={{ ...styles.mobileLink, color: 'var(--gold-dark)', fontWeight: 700 }}>
                <span>🏠 My Salon Panel</span>
              </Link>
            )}
          </nav>

          <div style={styles.mobileDivider} />

          <div style={styles.mobileActions}>
            {user ? (
              <>
                <div style={styles.mobileUser}>
                  <div style={styles.userAvatar}>{user.name?.[0]?.toUpperCase() ?? '?'}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{user.email}</div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-block" onClick={handleLogout} style={{ marginTop: 8 }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-block" style={{ marginBottom: 10 }}>Log in</Link>
                <Link to="/register" className="btn btn-primary btn-block">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <style>{`
        .ham-line { transition: all 0.25s cubic-bezier(0.22, 0.68, 0, 1.2); transform-origin: center; }
      `}</style>
      {open ? (
        <>
          <line className="ham-line" x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line className="ham-line" x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line className="ham-line" x1="3" y1="7"  x2="19" y2="7"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line className="ham-line" x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line className="ham-line" x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

const styles = {
  header: {
    borderBottom: '1px solid var(--line)',
    background: 'var(--paper-glass)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    transition: 'box-shadow 0.2s ease',
  },
  headerScrolled: {
    boxShadow: '0 2px 20px rgba(30, 23, 20, 0.10)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'var(--nav-h)',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.45rem',
    fontWeight: 600,
    textDecoration: 'none',
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    letterSpacing: '-0.01em',
    flexShrink: 0,
  },
  logoMark: {
    color: 'var(--gold)',
    fontSize: '0.9rem',
    lineHeight: 1,
    marginBottom: '2px',
  },
  logoDot: { color: 'var(--wine)' },
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  link: {
    textDecoration: 'none',
    color: 'var(--ink)',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  adminLink: {
    textDecoration: 'none',
    color: 'var(--wine)',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
  ownerLink: {
    textDecoration: 'none',
    color: 'var(--gold-dark)',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
  navSep: {
    width: 1,
    height: 20,
    background: 'var(--line)',
    margin: '0 4px',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 10px 5px 6px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--paper-muted)',
    border: '1px solid var(--line)',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--wine), var(--gold))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--ink)',
  },
  hamburger: {
    color: 'var(--ink)',
    border: '1.5px solid var(--line)',
    borderRadius: 'var(--radius)',
    background: 'var(--paper-raised)',
  },
  mobileDrawer: {
    overflow: 'hidden',
    maxHeight: 0,
    transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'var(--paper-raised)',
    borderTop: '1px solid var(--line)',
  },
  mobileDrawerOpen: {
    maxHeight: '440px',
  },
  mobileNav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 20px',
    textDecoration: 'none',
    color: 'var(--ink)',
    fontSize: '1rem',
    fontWeight: 500,
    borderBottom: '1px solid var(--line)',
  },
  mobileDivider: {
    height: 1,
    background: 'var(--line)',
  },
  mobileActions: {
    padding: '16px 20px 20px',
  },
  mobileUser: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0 12px',
  },
};
