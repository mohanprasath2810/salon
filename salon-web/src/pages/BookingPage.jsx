import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/* ── Icons ───────────────────────────────────────────── */
function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CheckCircleIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { salon, service, staff } = state || {};

  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!salon || !service || !staff) navigate('/');
  }, [salon, service, staff, navigate]);

  useEffect(() => {
    if (!staff || !service) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    api.getAvailability(staff.id, date, service.id)
      .then((data) => setSlots(data.slots))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSlots(false));
  }, [date, staff, service]);

  async function confirmBooking() {
    if (!user) { navigate('/login'); return; }
    setBooking(true);
    setError('');
    try {
      await api.bookAppointment({
        salonId: salon.id,
        staffId: staff.id,
        serviceId: service.id,
        startTime: selectedSlot.start,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      api.getAvailability(staff.id, date, service.id).then((data) => setSlots(data.slots));
    } finally {
      setBooking(false);
    }
  }

  if (!salon || !service || !staff) return null;

  /* ── Success Screen ──────────────────────────────── */
  if (success) {
    const slot = selectedSlot;
    const slotDate = slot ? new Date(slot.start) : null;
    return (
      <div className="container fade-in" style={styles.successWrap}>
        <div style={styles.successCard}>
          <div style={styles.successIconWrap}>
            <CheckCircleIcon size={52} />
          </div>
          <h1 style={styles.successTitle}>You're all booked!</h1>
          <p style={styles.successSub}>
            Your appointment is confirmed. See you there!
          </p>

          <div style={styles.successDetails}>
            {[
              { icon: <TagIcon />,      label: 'Service',  value: service.name },
              { icon: <UserIcon />,     label: 'Stylist',  value: staff.user.name },
              { icon: <ClockIcon />,    label: 'Duration', value: `${service.durationMinutes} min · ${formatPrice(service.price)}` },
              { icon: <CalendarIcon />, label: 'When',     value: slotDate
                  ? slotDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : '' },
            ].map((row) => (
              <div key={row.label} style={styles.successRow}>
                <span style={styles.successRowIcon}>{row.icon}</span>
                <span style={styles.successRowLabel}>{row.label}</span>
                <span style={styles.successRowValue}>{row.value}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 28 }}
            onClick={() => navigate('/bookings')}
          >
            View my bookings
          </button>
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 10 }}
            onClick={() => navigate('/')}
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  /* ── Booking Form ────────────────────────────────── */
  const endTime = selectedSlot
    ? new Date(new Date(selectedSlot.start).getTime() + service.durationMinutes * 60000)
    : null;

  return (
    <div className="container" style={styles.pageWrap}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={styles.backBtn}>
        <ArrowLeftIcon /> Back
      </button>

      <div style={styles.layout}>
        {/* ── Left column: form ── */}
        <div style={styles.formCol}>
          <h1 style={styles.pageTitle}>Confirm your appointment</h1>
          <p style={styles.pageSub}>{salon.name}</p>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Date picker */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <CalendarIcon />
              <h2 style={styles.sectionTitle}>Pick a date</h2>
            </div>
            <div className="field" style={{ maxWidth: 220, marginBottom: 0 }}>
              <input
                id="date"
                type="date"
                min={todayISO()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Time slots */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <ClockIcon />
              <h2 style={styles.sectionTitle}>Available times</h2>
            </div>

            {loadingSlots ? (
              <div style={styles.slotGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div style={styles.noSlots}>
                <p>No open slots for this date. Try another day.</p>
              </div>
            ) : (
              <div style={styles.slotGrid} className="fade-in-stagger">
                {slots.map((slot) => {
                  const time = new Date(slot.start).toLocaleTimeString(undefined, {
                    hour: 'numeric', minute: '2-digit',
                  });
                  const isSelected = selectedSlot?.start === slot.start;
                  return (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      className="slot-btn"
                      aria-pressed={isSelected}
                      style={{
                        ...styles.slotBtn,
                        background: isSelected ? 'var(--wine)' : 'var(--paper-raised)',
                        color: isSelected ? '#fff' : 'var(--ink)',
                        border: isSelected ? '1.5px solid var(--wine)' : '1.5px solid var(--line)',
                        boxShadow: isSelected ? '0 4px 14px var(--wine-glow)' : 'var(--shadow-xs)',
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            disabled={!selectedSlot || booking}
            onClick={confirmBooking}
            style={{ marginTop: 8 }}
          >
            {booking
              ? <><span className="spinner" /> Booking…</>
              : user
                ? 'Confirm booking'
                : 'Log in to book'}
          </button>
        </div>

        {/* ── Right column: summary ── */}
        <aside style={styles.summaryCol}>
          <div className="card" style={styles.summaryCard}>
            <div style={styles.summaryHeader}>
              <p style={styles.summaryEyebrow}>Booking summary</p>
            </div>
            <div style={styles.summaryBody}>
              {[
                { icon: <TagIcon />,   label: 'Service',  value: service.name },
                { icon: <UserIcon />,  label: 'Stylist',  value: staff.user.name },
                { icon: <ClockIcon />, label: 'Duration', value: `${service.durationMinutes} min` },
                { icon: <TagIcon />,   label: 'Price',    value: formatPrice(service.price) },
              ].map((row) => (
                <div key={row.label} style={styles.summaryRow}>
                  <span style={styles.summaryIcon}>{row.icon}</span>
                  <span style={styles.summaryLabel}>{row.label}</span>
                  <span style={styles.summaryValue}>{row.value}</span>
                </div>
              ))}

              {selectedSlot && (
                <>
                  <div style={styles.summaryDivider} />
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryIcon}><CalendarIcon /></span>
                    <span style={styles.summaryLabel}>Date</span>
                    <span style={styles.summaryValue}>
                      {new Date(selectedSlot.start).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryIcon}><ClockIcon /></span>
                    <span style={styles.summaryLabel}>Time</span>
                    <span style={styles.summaryValue}>
                      {new Date(selectedSlot.start).toLocaleTimeString(undefined, {
                        hour: 'numeric', minute: '2-digit',
                      })}
                      {endTime && ` – ${endTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────── */
const styles = {
  pageWrap: {
    maxWidth: 860,
    paddingTop: 36,
    paddingBottom: 80,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 32,
    alignItems: 'start',
  },
  formCol: {},
  pageTitle: {
    fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
    fontWeight: 500,
    marginBottom: 4,
  },
  pageSub: {
    color: 'var(--ink-soft)',
    fontSize: '0.92rem',
    marginBottom: 28,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    color: 'var(--ink-soft)',
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: 'var(--font-body)',
  },
  noSlots: {
    padding: '20px 0',
    color: 'var(--ink-soft)',
    fontSize: '0.9rem',
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
    gap: 10,
  },
  slotBtn: {
    padding: '11px 8px',
    fontSize: '0.85rem',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
  },
  summaryCol: {
    position: 'sticky',
    top: 'calc(var(--nav-h) + 24px)',
  },
  summaryCard: {
    overflow: 'hidden',
    border: '1px solid var(--line)',
  },
  summaryHeader: {
    padding: '16px 20px 14px',
    borderBottom: '1px solid var(--line)',
    background: 'var(--paper-muted)',
  },
  summaryEyebrow: {
    fontWeight: 700,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--ink-soft)',
    margin: 0,
  },
  summaryBody: {
    padding: '16px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.88rem',
  },
  summaryIcon: {
    color: 'var(--ink-muted)',
    display: 'flex',
    flexShrink: 0,
  },
  summaryLabel: {
    color: 'var(--ink-soft)',
    flex: 1,
    fontWeight: 500,
  },
  summaryValue: {
    color: 'var(--ink)',
    fontWeight: 600,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    background: 'var(--line)',
    margin: '4px 0',
  },
  // Success screen
  successWrap: {
    maxWidth: 480,
    paddingTop: 72,
    paddingBottom: 80,
    textAlign: 'center',
  },
  successCard: {
    background: 'var(--paper-raised)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-xl)',
    padding: '48px 36px 40px',
    boxShadow: 'var(--shadow-md)',
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    background: 'var(--success-bg)',
    color: 'var(--success-ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 0 0 8px rgba(59,130,46,0.08)',
  },
  successTitle: {
    fontSize: '1.9rem',
    marginBottom: 10,
  },
  successSub: {
    color: 'var(--ink-soft)',
    fontSize: '0.95rem',
    marginBottom: 28,
    lineHeight: 1.6,
  },
  successDetails: {
    background: 'var(--paper-muted)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    textAlign: 'left',
  },
  successRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.88rem',
  },
  successRowIcon: {
    color: 'var(--ink-muted)',
    display: 'flex',
    flexShrink: 0,
  },
  successRowLabel: {
    color: 'var(--ink-soft)',
    flex: 1,
    fontWeight: 500,
  },
  successRowValue: {
    fontWeight: 600,
    color: 'var(--ink)',
  },
};
