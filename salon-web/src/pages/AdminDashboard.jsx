import { useEffect, useState } from 'react';
import * as api from '../api/client';

/* ══════════════════════════════════════════════════════
   ADMIN DASHBOARD
   4 tabs: Overview · Salons · Users · Categories
   ══════════════════════════════════════════════════════ */

const PAGE_CSS = `
  @keyframes statPop {
    0%   { transform: scale(0.92); opacity: 0; }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes adminBg {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  .admin-stat-card { animation: statPop 0.35s cubic-bezier(0.22,0.68,0,1.2) both; }
  .admin-tab-btn {
    position: relative;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.88rem;
    border: none;
    background: transparent;
    color: var(--ink-soft);
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .admin-tab-btn.active {
    background: #fff;
    color: var(--wine);
    box-shadow: 0 2px 12px rgba(30,23,20,0.10);
  }
  .admin-tab-btn:hover:not(.active) {
    background: rgba(255,255,255,0.55);
    color: var(--ink);
  }
  .admin-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .admin-table th {
    text-align: left; padding: 10px 14px;
    font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: var(--ink-soft);
    border-bottom: 2px solid var(--line);
    background: var(--paper-muted);
  }
  .admin-table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--line);
    vertical-align: middle;
    color: var(--ink);
  }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-table tr:hover td { background: rgba(200,155,60,0.04); }
  .role-pill {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .role-ADMIN    { background: rgba(122,32,54,0.12); color: var(--wine); }
  .role-CUSTOMER { background: rgba(95,113,87,0.14); color: var(--sage); }
  .role-SALON_OWNER { background: rgba(200,155,60,0.18); color: var(--gold-dark); }
`;

/* ── Icons ───────────────────────────────────────────── */
function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const ICONS = {
  users:       'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  salons:      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  appts:       'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  reviews:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  staff:       'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  tag:         'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  plus:        'M12 5v14M5 12h14',
  check:       'M20 6L9 17l-5-5',
  ban:         'M18.364 5.636l-12.728 12.728M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
};

/* ── Skeleton row ────────────────────────────────────── */
function SkeletonRows({ cols = 4, rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 6, width: j === 0 ? '70%' : '50%' }} /></td>
      ))}
    </tr>
  ));
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');

  const TABS = [
    { id: 'overview',    label: '📊  Overview' },
    { id: 'salons',      label: '🏠  Salons' },
    { id: 'users',       label: '👥  Users' },
    { id: 'categories',  label: '🏷️  Categories' },
  ];

  return (
    <div style={s.page}>
      <style>{PAGE_CSS}</style>

      {/* ── Header ── */}
      <div style={s.header}>
        <div className="container" style={s.headerInner}>
          <div>
            <p style={s.headerEyebrow}>Platform control</p>
            <h1 style={s.headerTitle}>Admin Dashboard</h1>
          </div>
          <div style={s.adminBadge}>
            <span style={s.adminDot} />
            Admin mode
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={s.tabBarWrap}>
        <div className="container">
          <div style={s.tabBar}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`admin-tab-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="container" style={s.content}>
        {tab === 'overview'   && <OverviewTab />}
        {tab === 'salons'     && <SalonsTab />}
        {tab === 'users'      && <UsersTab />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
   ══════════════════════════════════════════════════════ */
function OverviewTab() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.adminGetStats()
      .then(d => setStats(d.stats))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;

  const cards = stats ? [
    { label: 'Total Customers',    value: stats.totalCustomers,    icon: ICONS.users,   color: '#5F7157', bg: '#EBF0E8' },
    { label: 'Total Salons',       value: stats.totalSalons,       icon: ICONS.salons,  color: '#7A2036', bg: '#F5E8EB' },
    { label: 'Total Staff',        value: stats.totalStaff,        icon: ICONS.staff,   color: '#C89B3C', bg: '#FBF4E6' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: ICONS.appts,   color: '#4A6FA5', bg: '#E8EEF7' },
    { label: 'Total Reviews',      value: stats.totalReviews,      icon: ICONS.reviews, color: '#7A5C2E', bg: '#F5EFE4' },
    { label: 'Average Rating',     value: stats.averageRating ? `${Number(stats.averageRating).toFixed(1)} ★` : '—', icon: ICONS.reviews, color: '#C89B3C', bg: '#FBF4E6' },
  ] : [];

  return (
    <div>
      <h2 style={s.sectionTitle}>Platform Overview</h2>
      <p style={s.sectionSub}>Live stats across the entire platform.</p>

      <div style={s.statsGrid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', marginBottom: 16 }} />
                <div className="skeleton skeleton-title" style={{ width: '50%', marginBottom: 8 }} />
                <div className="skeleton skeleton-text" style={{ width: '70%' }} />
              </div>
            ))
          : cards.map((c, i) => (
              <div
                key={c.label}
                className="card admin-stat-card"
                style={{ ...s.statCard, animationDelay: `${i * 0.06}s` }}
              >
                <div style={{ ...s.statIcon, background: c.bg, color: c.color }}>
                  <Icon d={c.icon} size={22} />
                </div>
                <div style={s.statValue}>{c.value}</div>
                <div style={s.statLabel}>{c.label}</div>
              </div>
            ))
        }
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 2 — SALONS
   ══════════════════════════════════════════════════════ */
function SalonsTab() {
  const [salons, setSalons]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toggling, setToggling] = useState(null); // id of salon being toggled

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api.adminGetSalons()
      .then(d => setSalons(d.salons))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleToggle(id) {
    setToggling(id);
    try {
      await api.adminToggleSalon(id);
      // Update locally without full reload
      setSalons(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    } catch (e) {
      setError(e.message);
    } finally {
      setToggling(null);
    }
  }

  return (
    <div>
      <div style={s.tabHeader}>
        <div>
          <h2 style={s.sectionTitle}>All Salons</h2>
          <p style={s.sectionSub}>Suspend or reinstate salons on the platform.</p>
        </div>
        <span style={s.countBadge}>{salons.length} total</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Salon Name</th>
              <th>Owner</th>
              <th>City</th>
              <th style={{ textAlign: 'center' }}>Staff</th>
              <th style={{ textAlign: 'center' }}>Bookings</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <SkeletonRows cols={7} rows={6} />
              : salons.length === 0
                ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-soft)' }}>
                      No salons found.
                    </td>
                  </tr>
                )
                : salons.map(salon => (
                  <tr key={salon.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{salon.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 2 }}>{salon.address}</div>
                    </td>
                    <td>
                      <div>{salon.owner?.name ?? '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{salon.owner?.email}</div>
                    </td>
                    <td>{salon.city}</td>
                    <td style={{ textAlign: 'center' }}>{salon._count?.staff ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>{salon._count?.appointments ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 99,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: salon.isActive ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: salon.isActive ? 'var(--success-ink)' : 'var(--danger-ink)',
                      }}>
                        {salon.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggle(salon.id)}
                        disabled={toggling === salon.id}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: `1.5px solid ${salon.isActive ? 'var(--danger-ink)' : 'var(--success-ink)'}`,
                          background: 'transparent',
                          color: salon.isActive ? 'var(--danger-ink)' : 'var(--success-ink)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: toggling === salon.id ? 'not-allowed' : 'pointer',
                          opacity: toggling === salon.id ? 0.6 : 1,
                          transition: 'all 0.15s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {toggling === salon.id
                          ? <span className="spinner-dark" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                          : salon.isActive
                            ? <><Icon d={ICONS.ban} size={12} /> Suspend</>
                            : <><Icon d={ICONS.check} size={12} /> Reinstate</>
                        }
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 3 — USERS
   ══════════════════════════════════════════════════════ */
function UsersTab() {
  const [users, setUsers]     = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    api.adminGetUsers(roleFilter)
      .then(d => setUsers(d.users))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  return (
    <div>
      <div style={s.tabHeader}>
        <div>
          <h2 style={s.sectionTitle}>All Users</h2>
          <p style={s.sectionSub}>Everyone registered on the platform.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={s.countBadge}>{users.length} shown</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={s.filterSelect}
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="SALON_OWNER">Salon Owners</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <SkeletonRows cols={5} rows={7} />
              : users.length === 0
                ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-soft)' }}>
                      No users found.
                    </td>
                  </tr>
                )
                : users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{u.email}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`role-pill role-${u.role}`}>{u.role.replace('_', ' ')}</span>
                    </td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
                      {new Date(u.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 4 — CATEGORIES
   ══════════════════════════════════════════════════════ */
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [newName, setNewName]       = useState('');
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    api.adminGetCategories()
      .then(d => setCategories(d.categories))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setAddError('');
    setAddSuccess('');
    try {
      const d = await api.adminCreateCategory(newName.trim());
      setCategories(prev => [...prev, d.category]);
      setNewName('');
      setAddSuccess(`Category "${d.category.name}" added.`);
      setTimeout(() => setAddSuccess(''), 3000);
    } catch (e) {
      setAddError(e.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
      {/* List */}
      <div>
        <div style={s.tabHeader}>
          <div>
            <h2 style={s.sectionTitle}>Service Categories</h2>
            <p style={s.sectionSub}>Categories that services are grouped under.</p>
          </div>
          <span style={s.countBadge}>{categories.length} total</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <SkeletonRows cols={2} rows={5} />
                : categories.length === 0
                  ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-soft)' }}>
                        No categories yet. Add one →
                      </td>
                    </tr>
                  )
                  : categories.map((cat, i) => (
                    <tr key={cat.id}>
                      <td style={{ color: 'var(--ink-muted)', width: 48 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'var(--wine-light)', color: 'var(--wine)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                          }}>
                            {cat.name[0].toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 600 }}>{cat.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add form */}
      <div>
        <h2 style={{ ...s.sectionTitle, marginBottom: 6 }}>Add Category</h2>
        <p style={{ ...s.sectionSub, marginBottom: 20 }}>New categories appear when salon owners create services.</p>

        <div className="card" style={{ padding: 24 }}>
          {addError   && <div className="alert alert-error">{addError}</div>}
          {addSuccess && <div className="alert alert-success">{addSuccess}</div>}

          <form onSubmit={handleAdd}>
            <div className="field">
              <label htmlFor="cat-name">Category name</label>
              <input
                id="cat-name"
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Hair, Nails, Skin…"
                required
                autoComplete="off"
              />
            </div>
            <button
              className="btn btn-primary btn-block"
              disabled={adding || !newName.trim()}
              style={{ marginTop: 4 }}
            >
              {adding
                ? <><span className="spinner" /> Adding…</>
                : <><Icon d={ICONS.plus} size={15} /> Add Category</>
              }
            </button>
          </form>

          {/* Existing categories as chips */}
          {categories.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-muted)', marginBottom: 10 }}>
                Existing
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map(cat => (
                  <span key={cat.id} style={{
                    padding: '4px 12px',
                    borderRadius: 99,
                    background: 'var(--paper-muted)',
                    border: '1px solid var(--line)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--ink-soft)',
                  }}>
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: 'calc(100vh - var(--nav-h))',
    background: 'linear-gradient(135deg,#1E1714 0%,#2A1F1B 40%,#1A1210 100%)',
    backgroundSize: '400% 400%',
    animation: 'adminBg 18s ease-in-out infinite',
  },
  header: {
    borderBottom: '1px solid rgba(200,155,60,0.18)',
    padding: '36px 0 28px',
  },
  headerInner: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerEyebrow: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'rgba(200,155,60,0.8)',
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
  },
  adminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: 'rgba(122,32,54,0.35)',
    border: '1px solid rgba(122,32,54,0.5)',
    color: '#ffb3c0',
    borderRadius: 99,
    padding: '6px 14px',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  adminDot: {
    width: 7, height: 7,
    borderRadius: '50%',
    background: '#ff6b8a',
    boxShadow: '0 0 6px #ff6b8a',
    animation: 'pulse 2s ease-in-out infinite',
    display: 'inline-block',
  },
  tabBarWrap: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '10px 0',
    position: 'sticky',
    top: 'var(--nav-h)',
    zIndex: 5,
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    overflowX: 'auto',
  },
  content: {
    paddingTop: 36,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.3rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: '0.88rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 18,
  },
  statCard: {
    padding: '24px 22px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
  },
  statIcon: {
    width: 46, height: 46,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    color: 'var(--ink)',
    lineHeight: 1,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--ink-soft)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tabHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  countBadge: {
    background: 'rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 99,
    padding: '4px 12px',
    fontSize: '0.78rem',
    fontWeight: 600,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  filterSelect: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1.5px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.10)',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
  },
};
