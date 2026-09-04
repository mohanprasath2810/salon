import { useEffect, useState } from 'react';
import * as api from '../api/client';
import AppointmentTicket from '../components/AppointmentTicket';

function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    </svg>
  );
}
function UpcomingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SkeletonTicket() {
  return (
    <div className="card" style={{ display: 'flex', overflow: 'hidden', height: 110 }}>
      <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 72, height: 20, borderRadius: 20 }} />
        </div>
        <div className="skeleton skeleton-title" style={{ width: '55%' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
      </div>
      <div className="skeleton" style={{ width: 120, borderRadius: 0 }} />
    </div>
  );
}

export default function MyBookingsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [notice, setNotice]             = useState('');

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    api.getMyAppointments()
      .then((data) => setAppointments(data.appointments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCancel(id) {
    setError('');
    setNotice('');
    try {
      await api.cancelAppointment(id);
      setNotice('Appointment cancelled successfully.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const upcoming = appointments.filter((a) => a.status === 'BOOKED');
  const past     = appointments.filter((a) => a.status !== 'BOOKED');

  return (
    <div className="container" style={styles.page}>
      {/* Page header */}
      <div style={styles.pageHeader} className="fade-in">
        <div>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Your appointments</p>
          <h1 style={styles.pageTitle}>My Bookings</h1>
        </div>
        <a href="/" className="btn btn-primary hide-mobile" style={{ alignSelf: 'flex-end' }}>
          <PlusIcon /> New booking
        </a>
      </div>

      {/* Alerts */}
      {error  && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      {/* Content */}
      {loading ? (
        <div style={styles.stack}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonTicket key={i} />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state fade-in" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">
            <CalendarIcon />
          </div>
          <h3>No bookings yet</h3>
          <p>Once you book an appointment, it'll show up here.</p>
          <a href="/" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
            <PlusIcon /> Explore salons
          </a>
        </div>
      ) : (
        <div className="fade-in">
          {upcoming.length > 0 && (
            <section style={{ marginBottom: 44 }} aria-labelledby="upcoming-heading">
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}><UpcomingIcon /></span>
                <h2 id="upcoming-heading" style={styles.sectionTitle}>Upcoming</h2>
                <span style={styles.sectionCount}>{upcoming.length}</span>
              </div>
              <div style={styles.stack} className="fade-in-stagger">
                {upcoming.map((appt) => (
                  <AppointmentTicket key={appt.id} appointment={appt} onCancel={handleCancel} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section aria-labelledby="past-heading">
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}><HistoryIcon /></span>
                <h2 id="past-heading" style={styles.sectionTitle}>Past</h2>
                <span style={styles.sectionCount}>{past.length}</span>
              </div>
              <div style={{ ...styles.stack, opacity: 0.82 }} className="fade-in-stagger">
                {past.map((appt) => (
                  <AppointmentTicket key={appt.id} appointment={appt} onCancel={handleCancel} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 760,
    paddingTop: 48,
    paddingBottom: 80,
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 36,
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
    fontWeight: 500,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid var(--line)',
  },
  sectionIcon: {
    color: 'var(--ink-soft)',
    display: 'flex',
  },
  sectionTitle: {
    fontSize: '0.88rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontFamily: 'var(--font-body)',
    color: 'var(--ink-soft)',
  },
  sectionCount: {
    background: 'var(--paper-muted)',
    border: '1px solid var(--line)',
    color: 'var(--ink-soft)',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '1px 8px',
    borderRadius: 'var(--radius-full)',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
};
