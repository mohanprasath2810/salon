// This is the app's one deliberate signature element: every booked
// appointment renders like a ticket stub, with a perforated tear-line
// between the "what/where" side and the "when" side. It's a visual
// metaphor for the thing a booking actually is — a reserved ticket
// for a specific time.

import { useState } from 'react';

const STATUS_LABEL = {
  BOOKED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
};

export default function AppointmentTicket({ appointment, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  const start = new Date(appointment.startTime);
  const dateLabel = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeLabel = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const canCancel = appointment.status === 'BOOKED' && start.getTime() - Date.now() > 2 * 60 * 60 * 1000;

  async function handleCancel() {
    setCancelling(true);
    try {
      await onCancel(appointment.id);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div style={styles.ticket} className="ticket-card fade-in">
      <div style={styles.main}>
        <div style={styles.badgeRow}>
          <span className={`badge badge-${appointment.status.toLowerCase()}`}>
            {STATUS_LABEL[appointment.status] || appointment.status}
          </span>
        </div>
        <h3 style={styles.serviceName}>{appointment.service.name}</h3>
        <p style={styles.meta}>{appointment.salon.name}</p>
        <p style={styles.meta}>with {appointment.staff.user.name}</p>

        {canCancel && (
          <button
            className="btn btn-danger-outline btn-sm"
            style={{ marginTop: 12 }}
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling…' : 'Cancel appointment'}
          </button>
        )}
      </div>

      <div style={styles.perforation}>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={styles.dot} />
        ))}
      </div>

      <div style={styles.stub}>
        <span style={styles.stubLabel}>Date</span>
        <span style={styles.stubValue}>{dateLabel}</span>
        <span style={styles.stubLabel} className="mt">Time</span>
        <span style={styles.stubValue}>{timeLabel}</span>
      </div>
    </div>
  );
}

const styles = {
  ticket: {
    display: 'flex',
    background: 'var(--paper-raised)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--line)',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    padding: '20px 22px',
  },
  badgeRow: { marginBottom: 10 },
  serviceName: { fontSize: '1.15rem', marginBottom: 4 },
  meta: { margin: '2px 0', color: 'var(--ink-soft)', fontSize: '0.9rem' },
  perforation: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: '0 3px',
    background:
      'repeating-linear-gradient(to bottom, var(--line) 0, var(--line) 6px, transparent 6px, transparent 12px)',
    width: 1,
  },
  dot: { display: 'none' },
  stub: {
    width: 120,
    background: 'var(--wine)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '20px 16px',
    gap: 2,
  },
  stubLabel: {
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    opacity: 0.75,
  },
  stubValue: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.05rem',
    fontWeight: 600,
    marginBottom: 4,
  },
};
