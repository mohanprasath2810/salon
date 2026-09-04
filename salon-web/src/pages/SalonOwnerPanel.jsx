import { useEffect, useState } from 'react';
import * as api from '../api/client';

/* ══════════════════════════════════════════════════════
   SALON OWNER PANEL
   4 tabs: My Salon · Services · Staff · Appointments
   ══════════════════════════════════════════════════════ */

const PAGE_CSS = `
  @keyframes ownerBg {
    0%,100%{background-position:0% 50%;}
    50%{background-position:100% 50%;}
  }
  @keyframes popIn {
    0%  { transform:scale(0.93); opacity:0; }
    100%{ transform:scale(1);    opacity:1; }
  }
  .owner-tab-btn {
    position:relative; padding:10px 22px;
    border-radius:8px; font-weight:600;
    font-size:0.88rem; border:none;
    background:transparent; color:rgba(255,255,255,0.55);
    cursor:pointer; transition:color 0.15s, background 0.15s;
    white-space:nowrap;
  }
  .owner-tab-btn.active {
    background:#fff; color:var(--wine);
    box-shadow:0 2px 12px rgba(30,23,20,0.12);
  }
  .owner-tab-btn:hover:not(.active){
    background:rgba(255,255,255,0.12); color:#fff;
  }
  .owner-table { width:100%; border-collapse:collapse; font-size:0.88rem; }
  .owner-table th {
    text-align:left; padding:10px 14px;
    font-size:0.72rem; font-weight:700;
    text-transform:uppercase; letter-spacing:0.07em;
    color:var(--ink-soft); border-bottom:2px solid var(--line);
    background:var(--paper-muted);
  }
  .owner-table td {
    padding:12px 14px; border-bottom:1px solid var(--line);
    vertical-align:middle; color:var(--ink);
  }
  .owner-table tr:last-child td { border-bottom:none; }
  .owner-table tr:hover td { background:rgba(122,32,54,0.03); }
  .cat-chip {
    display:inline-block; padding:2px 10px;
    border-radius:99px; font-size:0.7rem; font-weight:700;
    background:var(--wine-light); color:var(--wine);
    border:1px solid rgba(122,32,54,0.2);
  }
  .form-section {
    background:#fff; border-radius:14px;
    padding:28px; border:1px solid var(--line);
    box-shadow:0 4px 20px rgba(30,23,20,0.07);
    animation: popIn 0.3s cubic-bezier(0.22,0.68,0,1.2) both;
  }
  .form-section h3 {
    font-family:var(--font-display); font-size:1.1rem;
    font-weight:500; margin-bottom:20px; color:var(--ink);
  }
  .delete-btn {
    padding:5px 10px; border-radius:6px; font-size:0.75rem;
    font-weight:700; border:1.5px solid var(--danger-ink);
    color:var(--danger-ink); background:transparent; cursor:pointer;
    transition:background 0.15s;
  }
  .delete-btn:hover { background:var(--danger-bg); }
  .edit-btn {
    padding:5px 10px; border-radius:6px; font-size:0.75rem;
    font-weight:700; border:1.5px solid var(--ink-soft);
    color:var(--ink-soft); background:transparent; cursor:pointer;
    transition:background 0.15s, color 0.15s;
    margin-right:6px;
  }
  .edit-btn:hover { background:var(--paper-muted); color:var(--ink); }
`;

/* ── Tiny helpers ────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Alert({ type, msg }) {
  if (!msg) return null;
  return <div className={`alert alert-${type}`} style={{ marginBottom: 16 }}>{msg}</div>;
}

function Spinner() {
  return <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />;
}

/* ══════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════ */
export default function SalonOwnerPanel() {
  const [tab, setTab]       = useState('salon');
  const [salon, setSalon]   = useState(null);   // the owner's salon
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.getMySalons()
      .then(d => setSalon(d.salons?.[0] ?? null))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const TABS = [
    { id: 'salon',        label: '🏠  My Salon' },
    { id: 'appointments', label: '📅  Appointments' },
    { id: 'services',     label: '✂️  Services' },
    { id: 'staff',        label: '👤  Staff' },
  ];

  return (
    <div style={s.page}>
      <style>{PAGE_CSS}</style>

      {/* Header */}
      <div style={s.header}>
        <div className="container" style={s.headerInner}>
          <div>
            <p style={s.eyebrow}>Salon management</p>
            <h1 style={s.title}>Owner Panel</h1>
            {salon && <p style={s.salonName}>{salon.name}</p>}
          </div>
          <div style={s.ownerBadge}>🏠 Salon Owner</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBarWrap}>
        <div className="container">
          <div style={s.tabBar}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`owner-tab-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                disabled={t.id !== 'salon' && !salon && !loading}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={s.content}>
        {error && <Alert type="error" msg={error} />}

        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <Spinner />
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>Loading your salon…</p>
          </div>
        ) : (
          <>
            {tab === 'salon'        && <SalonTab    salon={salon} onSaved={setSalon} />}
            {tab === 'appointments' && salon && <AppointmentsTab salonId={salon.id} />}
            {tab === 'services'     && salon && <ServicesTab salonId={salon.id} />}
            {tab === 'staff'        && salon && <StaffTab    salonId={salon.id} />}
            {(tab === 'services' || tab === 'staff' || tab === 'appointments') && !salon && (
              <div style={{ color: 'rgba(255,255,255,0.6)', paddingTop: 32 }}>
                Set up your salon info first before managing services and staff.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 1 — MY SALON  (create or edit salon profile)
   ══════════════════════════════════════════════════════ */
function SalonTab({ salon, onSaved }) {
  const [form, setForm] = useState({
    name: salon?.name ?? '',
    description: salon?.description ?? '',
    address: salon?.address ?? '',
    city: salon?.city ?? '',
    phone: salon?.phone ?? '',
    imageUrl: salon?.imageUrl ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      let saved;
      if (salon) {
        const d = await api.updateSalon(salon.id, form);
        saved = d.salon;
      } else {
        const d = await api.createSalon(form);
        saved = d.salon;
      }
      onSaved(saved);
      setSuccess(salon ? 'Salon updated successfully!' : 'Salon created! Now add your services.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={s.sectionTitle}>{salon ? 'Edit Salon Profile' : 'Create Your Salon'}</h2>
      <p style={s.sectionSub}>
        {salon ? 'Update your salon info visible to customers.' : 'Fill in the details to get your salon listed on the platform.'}
      </p>

      <div className="form-section">
        <Alert type="error"   msg={error} />
        <Alert type="success" msg={success} />

        <form onSubmit={handleSubmit}>
          <Field label="Salon name *">
            <input value={form.name} onChange={e => upd('name', e.target.value)} required placeholder="e.g. Glow Studio" />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => upd('description', e.target.value)}
              rows={3}
              placeholder="What makes your salon special…"
              style={{ padding: '11px 14px', borderRadius: 8, border: '1.5px solid var(--line)', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Address *">
              <input value={form.address} onChange={e => upd('address', e.target.value)} required placeholder="12 MG Road" />
            </Field>
            <Field label="City *">
              <input value={form.city} onChange={e => upd('city', e.target.value)} required placeholder="Chennai" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Phone">
              <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Image URL">
              <input value={form.imageUrl} onChange={e => upd('imageUrl', e.target.value)} placeholder="https://…" />
            </Field>
          </div>

          {/* Preview */}
          {form.imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <button className="btn btn-primary btn-block btn-lg" disabled={saving} style={{ marginTop: 8 }}>
            {saving ? <><Spinner /> Saving…</> : salon ? 'Save changes' : 'Create salon'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 2 — APPOINTMENTS  (salon owner / staff view)
   Shows every booking for this salon, filterable by
   date and status. Owner can also cancel any booking.
   ══════════════════════════════════════════════════════ */
function AppointmentsTab({ salonId }) {
  const today = new Date().toISOString().split('T')[0];

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [notice,       setNotice]       = useState('');
  const [dateFilter,   setDateFilter]   = useState(today);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelling,   setCancelling]   = useState(null);

  useEffect(() => { load(); }, [dateFilter, statusFilter]);

  function load() {
    setLoading(true); setError('');
    api.getSalonAppointments(salonId, dateFilter, statusFilter)
      .then(d => setAppointments(d.appointments))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment? The customer will need to rebook.')) return;
    setCancelling(id);
    try {
      await api.cancelAppointment(id);
      setNotice('Appointment cancelled.');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
      setTimeout(() => setNotice(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelling(null);
    }
  }

  /* Group appointments by time period for easy scanning */
  const upcoming = appointments.filter(a => a.status === 'BOOKED' && new Date(a.startTime) >= new Date());
  const past     = appointments.filter(a => a.status !== 'BOOKED' || new Date(a.startTime) < new Date());

  const STATUS_COLOURS = {
    BOOKED:    { bg: 'var(--success-bg)',  color: 'var(--success-ink)' },
    CANCELLED: { bg: 'var(--danger-bg)',   color: 'var(--danger-ink)'  },
    COMPLETED: { bg: 'var(--paper-muted)', color: 'var(--ink-soft)'    },
    NO_SHOW:   { bg: 'var(--warning-bg)',  color: 'var(--warning-ink)' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={s.sectionTitle}>Appointments</h2>
          <p style={s.sectionSub}>See every customer booking for your salon — filter by date or status.</p>
        </div>
        <span style={s.countBadge}>{appointments.length} shown</span>
      </div>

      <Alert type="error"   msg={error}  />
      <Alert type="success" msg={notice} />

      {/* Filters */}
      <div style={apptStyle.filterBar}>
        <div style={apptStyle.filterGroup}>
          <label style={apptStyle.filterLabel}>📅 Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={apptStyle.filterInput}
          />
        </div>
        <div style={apptStyle.filterGroup}>
          <label style={apptStyle.filterLabel}>Filter status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={apptStyle.filterInput}
          >
            <option value="">All statuses</option>
            <option value="BOOKED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No-show</option>
          </select>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setDateFilter(today); setStatusFilter(''); }}
          style={{ alignSelf:'flex-end', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)' }}
        >
          Reset
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ overflow:'hidden' }}>
          <table className="owner-table">
            <thead>
              <tr>
                {['Customer','Service','Stylist','Time','Duration','Status','Action'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height:14, borderRadius:6, width: j===0?'80%':'55%' }} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : appointments.length === 0 ? (
        <div style={apptStyle.empty}>
          <div style={apptStyle.emptyIcon}>📅</div>
          <h3 style={{ color:'#fff', marginBottom:6 }}>No appointments found</h3>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem' }}>
            Try a different date or status filter.
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

          {/* ── Upcoming / Confirmed ── */}
          {upcoming.length > 0 && (
            <div>
              <div style={apptStyle.groupHeader}>
                <span style={apptStyle.groupDot('#3A5630')} />
                <span style={apptStyle.groupLabel}>Upcoming ({upcoming.length})</span>
              </div>
              <div className="card" style={{ overflow:'hidden' }}>
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Stylist</th>
                      <th>Date & Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map(a => (
                      <AppointmentRow
                        key={a.id}
                        appt={a}
                        statusColours={STATUS_COLOURS}
                        onCancel={handleCancel}
                        cancelling={cancelling}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Past / Other ── */}
          {past.length > 0 && (
            <div>
              <div style={apptStyle.groupHeader}>
                <span style={apptStyle.groupDot('var(--ink-muted)')} />
                <span style={apptStyle.groupLabel}>Past & Others ({past.length})</span>
              </div>
              <div className="card" style={{ overflow:'hidden', opacity:0.88 }}>
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Stylist</th>
                      <th>Date & Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {past.map(a => (
                      <AppointmentRow
                        key={a.id}
                        appt={a}
                        statusColours={STATUS_COLOURS}
                        onCancel={handleCancel}
                        cancelling={cancelling}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Single appointment row ──────────────────────────── */
function AppointmentRow({ appt, statusColours, onCancel, cancelling }) {
  const start    = new Date(appt.startTime);
  const dateStr  = start.toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' });
  const timeStr  = start.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
  const dur      = appt.service?.durationMinutes;
  const sc       = statusColours[appt.status] ?? statusColours.COMPLETED;
  const canCancel = appt.status === 'BOOKED';

  return (
    <tr>
      <td>
        <div style={{ fontWeight:600 }}>{appt.customer?.name ?? '—'}</div>
      </td>
      <td style={{ color:'var(--ink-soft)', fontSize:'0.82rem' }}>
        {appt.customer?.phone || '—'}
      </td>
      <td style={{ fontWeight:500 }}>{appt.service?.name ?? '—'}</td>
      <td style={{ color:'var(--ink-soft)' }}>{appt.staff?.user?.name ?? '—'}</td>
      <td>
        <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{dateStr}</div>
        <div style={{ color:'var(--wine)', fontSize:'0.82rem', fontWeight:700 }}>{timeStr}</div>
      </td>
      <td style={{ color:'var(--ink-soft)' }}>{dur ? `${dur} min` : '—'}</td>
      <td>
        <span style={{
          display:'inline-block', padding:'3px 10px',
          borderRadius:99, fontSize:'0.72rem', fontWeight:700,
          background: sc.bg, color: sc.color,
        }}>
          {appt.status === 'BOOKED' ? 'Confirmed' : appt.status.charAt(0) + appt.status.slice(1).toLowerCase().replace('_',' ')}
        </span>
      </td>
      <td>
        {canCancel && (
          <button
            className="delete-btn"
            onClick={() => onCancel(appt.id)}
            disabled={cancelling === appt.id}
            style={{ fontSize:'0.75rem' }}
          >
            {cancelling === appt.id ? '…' : 'Cancel'}
          </button>
        )}
      </td>
    </tr>
  );
}

const apptStyle = {
  filterBar: {
    display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-end',
    background:'rgba(255,255,255,0.08)',
    backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:12, padding:'16px 20px', marginBottom:24,
  },
  filterGroup: { display:'flex', flexDirection:'column', gap:6 },
  filterLabel: { fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'rgba(255,255,255,0.55)' },
  filterInput: {
    padding:'8px 12px', borderRadius:8,
    border:'1.5px solid rgba(255,255,255,0.18)',
    background:'rgba(255,255,255,0.10)',
    color:'#fff', fontSize:'0.88rem', fontWeight:500,
    outline:'none', cursor:'pointer',
    appearance: 'none',
  },
  empty: {
    textAlign:'center', padding:'60px 24px',
    background:'rgba(255,255,255,0.05)',
    borderRadius:14, border:'1px solid rgba(255,255,255,0.08)',
  },
  emptyIcon: { fontSize:'2.5rem', marginBottom:16 },
  groupHeader: {
    display:'flex', alignItems:'center', gap:8,
    marginBottom:10,
  },
  groupDot: (color) => ({
    width:8, height:8, borderRadius:'50%',
    background: color, display:'inline-block', flexShrink:0,
  }),
  groupLabel: {
    fontSize:'0.78rem', fontWeight:700,
    textTransform:'uppercase', letterSpacing:'0.07em',
    color:'rgba(255,255,255,0.6)',
  },
};

/* ══════════════════════════════════════════════════════
   TAB 3 — SERVICES  (list + add + edit + delete)
   ══════════════════════════════════════════════════════ */
function ServicesTab({ salonId }) {
  const [services,   setServices]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [editTarget, setEditTarget] = useState(null);  // service being edited
  const [showAdd,    setShowAdd]    = useState(false);

  useEffect(() => {
    Promise.all([
      api.ownerGetServices(salonId),
      api.getCategories(),
    ])
      .then(([sd, cd]) => {
        setServices(sd.services);
        setCategories(cd.categories ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [salonId]);

  async function handleDelete(id) {
    if (!window.confirm('Remove this service? Existing bookings are kept.')) return;
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (e) { setError(e.message); }
  }

  function onSaved(svc, isNew) {
    if (isNew) {
      setServices(prev => [...prev, svc]);
      setShowAdd(false);
    } else {
      setServices(prev => prev.map(s => s.id === svc.id ? svc : s));
      setEditTarget(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={s.sectionTitle}>Services</h2>
          <p style={s.sectionSub}>Add services and assign categories so customers can filter by type.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowAdd(v => !v); setEditTarget(null); }}
          style={{ alignSelf: 'flex-start' }}
        >
          {showAdd ? '✕ Cancel' : '+ Add service'}
        </button>
      </div>

      <Alert type="error" msg={error} />

      {/* Add form */}
      {showAdd && (
        <div style={{ marginBottom: 24 }}>
          <ServiceForm
            salonId={salonId}
            categories={categories}
            onSaved={svc => onSaved(svc, true)}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {/* Edit form */}
      {editTarget && (
        <div style={{ marginBottom: 24 }}>
          <ServiceForm
            salonId={salonId}
            categories={categories}
            initial={editTarget}
            onSaved={svc => onSaved(svc, false)}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="owner-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 6, width: j === 0 ? '70%' : '50%' }} /></td>
                  ))}
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 36, color: 'var(--ink-soft)' }}>
                  No services yet. Click "+ Add service" to create one.
                </td>
              </tr>
            ) : (
              services.map(svc => (
                <tr key={svc.id}>
                  <td style={{ fontWeight: 600 }}>{svc.name}</td>
                  <td>
                    {svc.category
                      ? <span className="cat-chip">{svc.category.name}</span>
                      : <span style={{ color: 'var(--ink-muted)', fontSize: '0.82rem' }}>—</span>
                    }
                  </td>
                  <td>{svc.durationMinutes} min</td>
                  <td>₹{Number(svc.price).toLocaleString('en-IN')}</td>
                  <td>
                    <button className="edit-btn" onClick={() => { setEditTarget(svc); setShowAdd(false); }}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(svc.id)}>Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Service form (shared for add + edit) ────────────── */
function ServiceForm({ salonId, categories, initial, onSaved, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name:            initial?.name            ?? '',
    description:     initial?.description     ?? '',
    durationMinutes: initial?.durationMinutes ?? 30,
    price:           initial?.price           ?? '',
    categoryId:      initial?.categoryId      ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        price: Number(form.price),
        categoryId: form.categoryId || null,
      };
      let saved;
      if (isEdit) {
        const d = await api.updateService(initial.id, payload);
        // re-attach category object for display
        const cat = categories.find(c => c.id === payload.categoryId);
        saved = { ...d.service, category: cat ?? null };
      } else {
        const d = await api.createService(salonId, payload);
        const cat = categories.find(c => c.id === payload.categoryId);
        saved = { ...d.service, category: cat ?? null };
      }
      onSaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-section">
      <h3>{isEdit ? `Edit — ${initial.name}` : 'New Service'}</h3>
      <Alert type="error" msg={error} />
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Service name *">
            <input value={form.name} onChange={e => upd('name', e.target.value)} required placeholder="e.g. Haircut & Styling" />
          </Field>
          <Field label="Category">
            <select value={form.categoryId} onChange={e => upd('categoryId', e.target.value)}>
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Duration (minutes) *">
            <input type="number" min={5} step={5} value={form.durationMinutes}
              onChange={e => upd('durationMinutes', e.target.value)} required />
          </Field>
          <Field label="Price (₹) *">
            <input type="number" min={0} step={1} value={form.price}
              onChange={e => upd('price', e.target.value)} required placeholder="799" />
          </Field>
        </div>
        <Field label="Description">
          <input value={form.description} onChange={e => upd('description', e.target.value)}
            placeholder="Short description (optional)" />
        </Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
            {saving ? <><Spinner /> Saving…</> : isEdit ? 'Save changes' : 'Add service'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 3 — STAFF  (list + add staff members)
   ══════════════════════════════════════════════════════ */
function StaffTab({ salonId }) {
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    api.ownerGetStaff(salonId)
      .then(d => setStaff(d.staff))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [salonId]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={s.sectionTitle}>Staff Members</h2>
          <p style={s.sectionSub}>Add stylists and staff who work at your salon.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(v => !v)}
          style={{ alignSelf: 'flex-start' }}
        >
          {showAdd ? '✕ Cancel' : '+ Add staff'}
        </button>
      </div>

      <Alert type="error" msg={error} />

      {showAdd && (
        <div style={{ marginBottom: 24 }}>
          <AddStaffForm
            salonId={salonId}
            onSaved={member => { setStaff(prev => [...prev, member]); setShowAdd(false); }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {/* Staff grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="skeleton skeleton-avatar" style={{ width: 64, height: 64, margin: '0 auto 12px' }} />
              <div className="skeleton skeleton-text" style={{ width: '55%', margin: '0 auto 8px' }} />
              <div className="skeleton skeleton-text" style={{ width: '75%', margin: '0 auto' }} />
            </div>
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
          No staff yet. Click "+ Add staff" to invite a team member.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {staff.map(m => (
            <div key={m.id} className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--wine),var(--gold))',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500,
                margin: '0 auto 12px',
                boxShadow: '0 4px 14px rgba(122,32,54,0.25)',
              }}>
                {m.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{m.user?.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 4 }}>{m.user?.email}</div>
              {m.bio && <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.5 }}>{m.bio}</div>}
              <div style={{ marginTop: 10 }}>
                <span style={{
                  display: 'inline-block', padding: '2px 10px',
                  borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                  background: m.isActive ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: m.isActive ? 'var(--success-ink)' : 'var(--danger-ink)',
                }}>
                  {m.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Add staff form ──────────────────────────────────── */
function AddStaffForm({ salonId, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', bio: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const d = await api.createStaff(salonId, form);
      onSaved(d.staff);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-section">
      <h3>Add Staff Member</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 20, marginTop: -8 }}>
        This creates a new account for the staff member with role STAFF.
      </p>
      <Alert type="error" msg={error} />
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Full name *">
            <input value={form.name} onChange={e => upd('name', e.target.value)} required placeholder="Alex Stylist" />
          </Field>
          <Field label="Email *">
            <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} required placeholder="alex@salon.com" />
          </Field>
          <Field label="Password *">
            <input type="password" value={form.password} onChange={e => upd('password', e.target.value)} required placeholder="Min. 6 characters" minLength={6} />
          </Field>
          <Field label="Bio (optional)">
            <input value={form.bio} onChange={e => upd('bio', e.target.value)} placeholder="Senior stylist, 5 years exp." />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
            {saving ? <><Spinner /> Adding…</> : 'Add staff member'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

/* ── Page styles ─────────────────────────────────────── */
const s = {
  page: {
    minHeight: 'calc(100vh - var(--nav-h))',
    background: 'linear-gradient(135deg, #1A1310 0%, #2E1A10 40%, #1E1714 100%)',
    backgroundSize: '400% 400%',
    animation: 'ownerBg 16s ease-in-out infinite',
  },
  header: {
    borderBottom: '1px solid rgba(200,155,60,0.18)',
    padding: '36px 0 28px',
  },
  headerInner: {
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
  },
  eyebrow: {
    fontSize: '0.72rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.12em',
    color: 'rgba(200,155,60,0.8)', marginBottom: 8,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.6rem,3vw,2.2rem)',
    fontWeight: 500, color: '#fff', margin: 0,
  },
  salonName: {
    color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginTop: 6,
  },
  ownerBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'rgba(200,155,60,0.20)',
    border: '1px solid rgba(200,155,60,0.35)',
    color: 'rgba(200,155,60,0.95)',
    borderRadius: 99, padding: '6px 14px',
    fontSize: '0.78rem', fontWeight: 700,
  },
  tabBarWrap: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '10px 0',
    position: 'sticky', top: 'var(--nav-h)', zIndex: 5,
  },
  tabBar: { display: 'flex', gap: 4, overflowX: 'auto' },
  content: { paddingTop: 36, paddingBottom: 80 },
  countBadge: {
    background: 'rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 99, padding: '4px 12px',
    fontSize: '0.78rem', fontWeight: 600,
    alignSelf: 'flex-start', marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.3rem', fontWeight: 500,
    color: '#fff', marginBottom: 4,
  },
  sectionSub: {
    fontSize: '0.88rem',
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 24,
  },
};
