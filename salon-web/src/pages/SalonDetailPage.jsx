import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api/client';
import { formatPrice } from '../utils/currency';

/* ── Page-level CSS ──────────────────────────────────── */
const PAGE_CSS = `
  /* Keep the default OS cursor — ring is decorative only */

  @keyframes cursorPing {
    0%   { transform:scale(1);   opacity:1; }
    100% { transform:scale(2.8); opacity:0; }
  }
  @keyframes selectPop {
    0%   { transform:scale(0.92); }
    60%  { transform:scale(1.04); }
    100% { transform:scale(1);    }
  }
  @keyframes shimmerBar {
    0%   { transform:translateX(-100%) skewX(-20deg); }
    100% { transform:translateX(300%)  skewX(-20deg); }
  }
  @keyframes avatarGlow {
    0%,100% { box-shadow:0 4px 14px rgba(122,32,54,0.25); }
    50%      { box-shadow:0 0 0 6px rgba(200,155,60,0.3), 0 8px 28px rgba(122,32,54,0.4); }
  }
  @keyframes detailBgShift {
    0%,100%{background-position:0% 50%;}
    50%{background-position:100% 50%;}
  }

  .service-card-3d {
    position:relative; overflow:hidden;
    transition: border-color 0.18s, background 0.22s;
    will-change: transform;
    transform-style: preserve-3d;
  }
  .service-card-3d::after {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 55%);
    opacity:0; transition:opacity 0.2s; border-radius:inherit; pointer-events:none;
  }
  .service-card-3d:hover::after { opacity:1; }
  .service-card-3d.selected-card {
    animation: selectPop 0.35s cubic-bezier(0.22,0.68,0,1.2) both;
    background: linear-gradient(135deg,#fff 55%,rgba(122,32,54,0.05) 100%) !important;
    border-color: var(--wine) !important;
    box-shadow: 0 0 0 3px rgba(122,32,54,0.18), 0 8px 28px rgba(122,32,54,0.18) !important;
  }

  .staff-card-3d {
    position:relative; overflow:hidden;
    transition: border-color 0.2s;
    will-change: transform;
    transform-style: preserve-3d;
  }
  .staff-card-3d:hover .staff-av {
    animation: avatarGlow 1.5s ease-in-out infinite;
    transform: scale(1.12) !important;
  }
  .staff-card-3d:hover .staff-cta {
    opacity:1 !important; transform:translateX(5px) !important;
  }
  .staff-card-3d::before {
    content:'';
    position:absolute;
    top:0; left:-60%; width:40%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
    animation: shimmerBar 2.5s ease-in-out infinite;
    pointer-events:none;
  }
`;

/* ── Custom cursor (decorative trail — real cursor stays visible) ── */
function useCursor(pageRef) {
  const dot    = useRef(null);
  const ring   = useRef(null);
  const pos    = useRef({ x: -200, y: -200 });
  const lerped = useRef({ x: -200, y: -200 });
  const raf    = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      // Dot snaps instantly, offset +12px right and -4px up from the tip
      if (dot.current) {
        dot.current.style.transform =
          `translate(${e.clientX + 12}px, ${e.clientY - 4}px)`;
      }
    };

    const onEnter = () => {
      if (dot.current)  dot.current.style.opacity  = '1';
      if (ring.current) ring.current.style.opacity = '1';
    };
    const onLeave = () => {
      if (dot.current)  dot.current.style.opacity  = '0';
      if (ring.current) ring.current.style.opacity = '0';
    };

    // Grow ring when hovering buttons/links — wine colour
    const onOver = (e) => {
      const isBtn = !!e.target.closest('button, a, [role="button"]');
      if (ring.current) {
        ring.current.style.width        = isBtn ? '54px' : '40px';
        ring.current.style.height       = isBtn ? '54px' : '40px';
        ring.current.style.borderColor  = isBtn
          ? 'rgba(122,32,54,0.70)'
          : 'rgba(122,32,54,0.45)';
        ring.current.style.background   = isBtn
          ? 'radial-gradient(circle, rgba(122,32,54,0.10) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(200,155,60,0.08) 0%, transparent 70%)';
      }
    };

    // Ring lerps behind cursor for a trailing effect
    const loop = () => {
      const lx = lerped.current.x + (pos.current.x - lerped.current.x) * 0.10;
      const ly = lerped.current.y + (pos.current.y - lerped.current.y) * 0.10;
      lerped.current = { x: lx, y: ly };
      if (ring.current) {
        const w = parseFloat(ring.current.style.width) || 40;
        ring.current.style.transform =
          `translate(${lx - w / 2}px, ${ly - w / 2}px)`;
      }
      raf.current = requestAnimationFrame(loop);
    };

    page.addEventListener('mousemove',  onMove);
    page.addEventListener('mouseenter', onEnter);
    page.addEventListener('mouseleave', onLeave);
    page.addEventListener('mouseover',  onOver);
    raf.current = requestAnimationFrame(loop);

    return () => {
      page.removeEventListener('mousemove',  onMove);
      page.removeEventListener('mouseenter', onEnter);
      page.removeEventListener('mouseleave', onLeave);
      page.removeEventListener('mouseover',  onOver);
      cancelAnimationFrame(raf.current);
    };
  }, [pageRef]);

  return { dot, ring };
}

/* ── Icons ───────────────────────────────────────────── */
const ArrowLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ClockIco  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const TagIco    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const CheckIco  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const PinIco    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

/* ── Skeleton ────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ height:360, borderRadius:0 }} />
      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>
        <div className="skeleton skeleton-title" style={{ width:'40%', marginBottom:12 }} />
        <div className="skeleton skeleton-text"  style={{ width:'28%', marginBottom:36 }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
          {Array.from({ length:4 }).map((_,i) => <div key={i} className="skeleton" style={{ height:96, borderRadius:12 }} />)}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════ */
export default function SalonDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const pageRef     = useRef(null);
  const spotRef     = useRef(null);

  const [salon, setSalon]                 = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [staff, setStaff]                 = useState([]);
  const [staffLoading, setStaffLoading]   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const { dot: cursorDot, ring: cursorRing } = useCursor(pageRef);

  useEffect(() => {
    api.getSalon(id).then(d => setSalon(d.salon)).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!selectedService) { setStaff([]); return; }
    setStaffLoading(true);
    api.getStaff(id, selectedService.id).then(d => setStaff(d.staff)).finally(() => setStaffLoading(false));
  }, [selectedService, id]);

  function onPageMouseMove(e) {
    if (!spotRef.current || !pageRef.current) return;
    const r = pageRef.current.getBoundingClientRect();
    spotRef.current.style.background =
      `radial-gradient(700px circle at ${e.clientX-r.left}px ${e.clientY-r.top}px,
        rgba(200,155,60,0.07) 0%,
        rgba(122,32,54,0.05) 30%,
        transparent 65%)`;
  }

  if (loading) return <PageSkeleton />;
  if (error)   return <div className="container" style={{ paddingTop:64 }}><div className="alert alert-error">{error}</div></div>;
  if (!salon)  return null;

  return (
    <>
      <style>{PAGE_CSS}</style>

      {/* Custom cursor */}
      <div ref={cursorDot}  aria-hidden="true" style={cs.dot}  />
      <div ref={cursorRing} aria-hidden="true" style={cs.ring} />

      <div ref={pageRef} style={ps.page} onMouseMove={onPageMouseMove}>
        {/* Spotlight */}
        <div ref={spotRef} style={ps.spotlight} aria-hidden="true" />

        {/* ── Hero ── */}
        <div style={ps.heroWrap} className="fade-in">
          {salon.imageUrl
            ? <img src={salon.imageUrl} alt={salon.name} style={ps.heroImg} />
            : (
              <div style={ps.heroFallback}>
                <span style={ps.heroLetter}>{salon.name[0]}</span>
              </div>
            )}
          <div style={ps.heroGrad} />
          {/* shimmer bar */}
          <div style={ps.shimmer} aria-hidden="true" />

          <button onClick={() => navigate(-1)} style={ps.backBtn} aria-label="Go back">
            <ArrowLeft /> Back
          </button>

          <div style={ps.heroContent}>
            <h1 style={ps.heroTitle}>{salon.name}</h1>
            <div style={ps.heroMeta}><PinIco /><span>{salon.address}, {salon.city}</span></div>
          </div>
        </div>

        {/* ── Body ── */}
        <div
          style={ps.body}
          onMouseMove={onPageMouseMove}
        >
          {salon.description && <p style={ps.desc} className="fade-in">{salon.description}</p>}

          {/* Step 1 */}
          <section style={{ marginTop: salon.description ? 40 : 0 }}>
            <StepHeader n={1} label="Choose a service" />
            <div style={ps.serviceGrid} className="fade-in-stagger">
              {salon.services.map(svc => (
                <ServiceCard3D
                  key={svc.id}
                  service={svc}
                  selected={selectedService?.id === svc.id}
                  onSelect={() => setSelectedService(svc)}
                />
              ))}
            </div>
          </section>

          {/* Step 2 */}
          {selectedService && (
            <section style={{ marginTop:52 }} className="fade-in">
              <StepHeader n={2} label="Choose a stylist" done />
              {staffLoading ? (
                <div style={ps.staffGrid}>
                  {Array.from({ length:3 }).map((_,i) => (
                    <div key={i} className="card" style={{ padding:24, textAlign:'center' }}>
                      <div className="skeleton skeleton-avatar" style={{ width:72, height:72, margin:'0 auto 14px' }} />
                      <div className="skeleton skeleton-text" style={{ width:'55%', margin:'0 auto 8px' }} />
                      <div className="skeleton skeleton-text" style={{ width:'75%', margin:'0 auto' }} />
                    </div>
                  ))}
                </div>
              ) : staff.length === 0 ? (
                <p style={{ color:'var(--ink-soft)', padding:'16px 0' }}>No stylists currently offer this service.</p>
              ) : (
                <div style={ps.staffGrid} className="fade-in-stagger">
                  {staff.map(m => (
                    <StaffCard3D key={m.id} member={m} onClick={() =>
                      navigate(`/salons/${id}/book`, { state:{ salon, service:selectedService, staff:m } })
                    } />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Step header ─────────────────────────────────────── */
function StepHeader({ n, label, done }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
      <div style={{
        width:34, height:34, borderRadius:'50%',
        background: done ? 'linear-gradient(135deg,var(--wine),var(--gold))' : 'var(--wine)',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'0.85rem', fontWeight:700, flexShrink:0,
        boxShadow:'0 4px 14px rgba(122,32,54,0.35)',
      }}>{n}</div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:500 }}>{label}</h2>
    </div>
  );
}

/* ── Service card with 3D tilt ───────────────────────── */
function ServiceCard3D({ service, selected, onSelect }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX-r.left)/r.width  - 0.5) * 16;
    const y = ((e.clientY-r.top) /r.height - 0.5) * -16;
    el.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-5px)`;
    el.style.boxShadow = selected
      ? `0 0 0 3px rgba(122,32,54,0.18), ${-x}px ${y}px 28px rgba(122,32,54,0.22)`
      : `${-x*0.8}px ${y*0.8}px 22px rgba(30,23,20,0.14)`;
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0)';
    el.style.boxShadow = selected ? '0 0 0 3px rgba(122,32,54,0.18),0 8px 28px rgba(122,32,54,0.18)' : 'var(--shadow-card)';
  };

  return (
    <button
      ref={ref}
      onClick={onSelect}
      aria-pressed={selected}
      className={`service-card-3d${selected ? ' selected-card' : ''}`}
      style={{
        display:'flex', flexDirection:'column', alignItems:'flex-start',
        gap:10, padding:'20px 22px',
        background: selected ? 'linear-gradient(135deg,#fff 55%,rgba(122,32,54,0.05) 100%)' : '#fff',
        borderRadius:14, border:`2px solid ${selected ? 'var(--wine)' : 'var(--line)'}`,
        width:'100%', textAlign:'left',
        boxShadow: selected ? '0 0 0 3px rgba(122,32,54,0.18),0 8px 28px rgba(122,32,54,0.18)' : 'var(--shadow-card)',
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Selected checkmark */}
      {selected && (
        <span style={{ position:'absolute', top:12, right:12, width:24, height:24, borderRadius:'50%', background:'var(--wine)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <CheckIco />
        </span>
      )}
      <span style={{ fontWeight:700, fontSize:'1rem', color:'var(--ink)', paddingRight:selected?28:0 }}>{service.name}</span>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <span style={chip}><ClockIco />{service.durationMinutes} min</span>
        <span style={{ ...chip, background: selected ? 'rgba(122,32,54,0.10)' : 'var(--paper-muted)', color: selected ? 'var(--wine)' : 'var(--ink-soft)' }}>
          <TagIco />{formatPrice(service.price)}
        </span>
      </div>
    </button>
  );
}

/* ── Staff card with 3D tilt ─────────────────────────── */
function StaffCard3D({ member, onClick }) {
  const ref     = useRef(null);
  const [hov, setHov] = useState(false);

  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX-r.left)/r.width  - 0.5) * 18;
    const y = ((e.clientY-r.top) /r.height - 0.5) * -18;
    el.style.transform = `perspective(500px) rotateY(${x}deg) rotateX(${y}deg) translateY(-6px) scale(1.02)`;
    el.style.boxShadow = `${-x}px ${y}px 30px rgba(122,32,54,0.20)`;
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(500px) rotateY(0) rotateX(0) translateY(0) scale(1)';
    el.style.boxShadow = 'var(--shadow-card)';
    setHov(false);
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="staff-card-3d"
      style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'26px 18px 20px', background:'#fff',
        borderRadius:14, border:'2px solid var(--line)',
        textAlign:'center', width:'100%', gap:7,
        boxShadow:'var(--shadow-card)',
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => setHov(true)}
    >
      <div className="staff-av" style={{
        width:72, height:72, borderRadius:'50%',
        background:'linear-gradient(135deg,var(--wine),var(--gold))',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:500,
        marginBottom:8,
        transition:'transform 0.25s cubic-bezier(0.22,0.68,0,1.2), box-shadow 0.25s',
        boxShadow:'0 4px 14px rgba(122,32,54,0.25)',
        transform: hov ? 'scale(1.12)' : 'scale(1)',
      }}>
        {member.user.name[0].toUpperCase()}
      </div>
      <span style={{ fontWeight:700, fontSize:'1rem', color:'var(--ink)' }}>{member.user.name}</span>
      {member.bio && <span style={{ fontSize:'0.78rem', color:'var(--ink-soft)', lineHeight:1.5, maxWidth:160 }}>{member.bio}</span>}
      <span className="staff-cta" style={{
        marginTop:6, fontSize:'0.8rem', fontWeight:700, color:'var(--wine)', letterSpacing:'0.03em',
        opacity: hov ? 1 : 0.5,
        transform: hov ? 'translateX(5px)' : 'translateX(0)',
        transition:'opacity 0.2s, transform 0.2s',
      }}>
        Book with {member.user.name.split(' ')[0]} →
      </span>
    </button>
  );
}

const chip = {
  display:'inline-flex', alignItems:'center', gap:4,
  background:'var(--paper-muted)', color:'var(--ink-soft)',
  fontSize:'0.78rem', fontWeight:600,
  padding:'4px 10px', borderRadius:'var(--radius-full)',
  transition:'background 0.2s, color 0.2s',
};

/* ── Cursor styles ───────────────────────────────────── */
/* The dot is a small sparkle offset from the real cursor tip.
   The ring is a soft trailing halo — purely decorative.
   Neither hides the real OS cursor (cursor:none is removed). */
const cs = {
  dot: {
    position: 'fixed',
    top: 0, left: 0,
    /* small 4-pointed star / sparkle shape */
    width: 10, height: 10,
    borderRadius: '50%',
    background: 'var(--gold)',
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: 0,
    transition: 'opacity 0.2s',
    /* offset slightly so it sits next to the cursor tip, not on it */
    marginLeft: 12,
    marginTop: -4,
    boxShadow: '0 0 6px 2px rgba(200,155,60,0.7)',
    willChange: 'transform',
  },
  ring: {
    position: 'fixed',
    top: 0, left: 0,
    width: 40, height: 40,
    borderRadius: '50%',
    border: '1.5px solid rgba(122,32,54,0.45)',
    background: 'radial-gradient(circle, rgba(200,155,60,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 9997,
    opacity: 0,
    transition:
      'opacity 0.25s, width 0.22s cubic-bezier(0.22,0.68,0,1.2), height 0.22s cubic-bezier(0.22,0.68,0,1.2), border-color 0.2s, background 0.2s',
    willChange: 'transform',
  },
};

/* ── Page styles ─────────────────────────────────────── */
const ps = {
  page: {
    position:'relative',
    background:'linear-gradient(135deg,#f8f2ea 0%,#f2ead8 30%,#f5ede3 60%,#f8f3ec 100%)',
    backgroundSize:'400% 400%',
    animation:'detailBgShift 14s ease-in-out infinite',
  },
  spotlight: {
    position:'absolute', inset:0,
    pointerEvents:'none', zIndex:0,
  },
  heroWrap: { position:'relative', height:360, overflow:'hidden', background:'#1E1714' },
  heroImg:  { width:'100%', height:'100%', objectFit:'cover', opacity:0.82 },
  heroFallback: {
    width:'100%', height:'100%',
    background:'linear-gradient(135deg,#3A2820,#1E1714)',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  heroLetter: { fontFamily:'var(--font-display)', fontSize:'9rem', fontWeight:300, color:'rgba(200,155,60,0.4)', lineHeight:1 },
  heroGrad:   { position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(30,23,20,0.1) 0%,rgba(30,23,20,0.75) 100%)' },
  shimmer: {
    position:'absolute', bottom:0, left:0, right:0, height:3,
    background:'linear-gradient(90deg,transparent,rgba(200,155,60,0.9),transparent)',
    animation:'shimmerBar 3s ease-in-out infinite',
  },
  backBtn: {
    position:'absolute', top:20, left:24,
    background:'rgba(20,14,12,0.52)', backdropFilter:'blur(10px)',
    color:'#fff', border:'1px solid rgba(255,255,255,0.18)',
    borderRadius:'var(--radius)', display:'flex', alignItems:'center', gap:6,
    fontSize:'0.82rem', fontWeight:600, padding:'8px 16px',
  },
  heroContent: { position:'absolute', bottom:30, left:0, right:0, padding:'0 24px', maxWidth:1124, margin:'0 auto' },
  heroTitle:   { color:'#fff', fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:500, textShadow:'0 2px 16px rgba(0,0,0,0.5)', marginBottom:8 },
  heroMeta:    { display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.80)', fontSize:'0.9rem' },
  body: { maxWidth:1100, margin:'0 auto', padding:'40px 24px 80px', position:'relative', zIndex:1 },
  desc: { color:'var(--ink-soft)', maxWidth:640, lineHeight:1.75, fontSize:'0.96rem', marginBottom:0 },
  serviceGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 },
  staffGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 },
};
