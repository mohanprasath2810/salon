import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/client';

/* ── Keyframes injected once ─────────────────────────── */
const PAGE_CSS = `
  @keyframes floatUp {
    0%   { transform:translateY(0) translateX(0) scale(1); opacity:0; }
    10%  { opacity:1; }
    50%  { transform:translateY(-45vh) translateX(18px) scale(1.1); opacity:0.8; }
    90%  { opacity:0.4; }
    100% { transform:translateY(-100vh) translateX(-10px) scale(0.8); opacity:0; }
  }
  @keyframes orbFloat1 {
    0%,100%{transform:translate(0,0) scale(1);}
    33%{transform:translate(30px,-25px) scale(1.05);}
    66%{transform:translate(-20px,15px) scale(0.97);}
  }
  @keyframes orbFloat2 {
    0%,100%{transform:translate(0,0) scale(1);}
    40%{transform:translate(-35px,20px) scale(1.06);}
    70%{transform:translate(18px,-15px) scale(0.95);}
  }
  @keyframes orbFloat3 {
    0%,100%{transform:translate(0,0) scale(1);}
    50%{transform:translate(22px,28px) scale(1.08);}
  }
  @keyframes ringPulse2 {
    0%,100%{opacity:0.9;transform:scale(1);}
    50%{opacity:0.3;transform:scale(1.08);}
  }
  @keyframes streakFade {
    0%,100%{opacity:0.6;}
    50%{opacity:0.15;}
  }
  @keyframes sheenMove {
    0%{transform:translateX(-120%) rotate(-30deg);}
    100%{transform:translateX(220%) rotate(-30deg);}
  }
  @keyframes bgShift {
    0%,100%{background-position:0% 50%;}
    50%{background-position:100% 50%;}
  }
  @keyframes cardGlow {
    0%,100%{box-shadow:0 4px 24px rgba(122,32,54,0.18),0 1px 4px rgba(0,0,0,0.08);}
    50%{box-shadow:0 8px 40px rgba(122,32,54,0.32),0 1px 4px rgba(0,0,0,0.08);}
  }
  .salon-grid-section {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg,#f7f0e8 0%,#f0e8dc 25%,#efe6d8 50%,#f5ede3 75%,#f7f0e8 100%);
    background-size: 400% 400%;
    animation: bgShift 12s ease-in-out infinite;
    padding: 52px 0 80px;
  }
  .salon-grid-section::before {
    content:'';
    position:absolute;
    inset:0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 30%, rgba(200,155,60,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 50% 35% at 80% 70%, rgba(122,32,54,0.10) 0%, transparent 55%),
      radial-gradient(ellipse 40% 30% at 50% 10%, rgba(95,113,87,0.08) 0%, transparent 50%);
    pointer-events:none;
    z-index:0;
  }
  .salon-grid-section > * { position:relative; z-index:1; }

  .gloss-card {
    position:relative;
    overflow:hidden;
    transition: transform 0.3s cubic-bezier(0.22,0.68,0,1.2),
                box-shadow 0.3s ease;
  }
  .gloss-card::before {
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%);
    opacity:0;
    transition:opacity 0.3s;
    pointer-events:none;
    z-index:2;
    border-radius:inherit;
  }
  .gloss-card:hover::before { opacity:1; }
  .gloss-card:hover {
    transform:translateY(-8px) scale(1.01);
    box-shadow:0 16px 48px rgba(122,32,54,0.22), 0 4px 12px rgba(0,0,0,0.08);
  }
  .gloss-card:hover .card-img { transform:scale(1.09); }
  .card-img {
    transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
    width:100%; height:100%; object-fit:cover; display:block;
  }

  /* Spotlight cursor effect on results section */
  .results-spotlight {
    pointer-events:none;
    position:fixed;
    inset:0;
    z-index:0;
    transition:background 0.05s linear;
  }
`;

/* ── Particles ───────────────────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  size:   4 + (i % 5) * 3,
  left:   3 + (i * 37 + 11) % 94,
  delay: -(i * 1.3) % 14,
  dur:    8 + (i % 4) * 3,
  isGold: i % 3 !== 0,
}));

/* ── Icons ───────────────────────────────────────────── */
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function MapPinIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function StarIcon({ filled }) {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function Stars({ count }) {
  const filled = Math.min(5, Math.max(0, Math.round(count / 4)));
  return (
    <span style={{ display:'inline-flex', gap:2, color:'var(--gold)' }}>
      {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < filled} />)}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius:16, overflow:'hidden', background:'#fff', boxShadow:'0 2px 12px rgba(30,23,20,0.07)' }}>
      <div className="skeleton" style={{ height:180 }} />
      <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:10 }}>
        <div className="skeleton skeleton-title" style={{ width:'60%' }} />
        <div className="skeleton skeleton-text"  style={{ width:'40%' }} />
        <div className="skeleton skeleton-text"  style={{ width:'28%' }} />
      </div>
    </div>
  );
}

/* ── 3D Hero ─────────────────────────────────────────── */
function Hero3D({ children }) {
  const heroRef  = useRef(null);
  const innerRef = useRef(null);
  const orbsRef  = useRef(null);
  const ringsRef = useRef(null);
  const rafRef   = useRef(null);
  const tilt     = useRef({ x:0, y:0, tx:0, ty:0 });

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      tilt.current.tx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -10;
      tilt.current.ty = ((e.clientX - r.left - r.width/2)  / (r.width/2))  *  10;
    };
    const onLeave = () => { tilt.current.tx = 0; tilt.current.ty = 0; };
    const loop = () => {
      const t = tilt.current;
      t.x += (t.tx - t.x) * 0.08;
      t.y += (t.ty - t.y) * 0.08;
      if (innerRef.current) innerRef.current.style.transform = `rotateX(${t.x}deg) rotateY(${t.y}deg)`;
      if (orbsRef.current)  orbsRef.current.style.transform  = `translateX(${t.y*14}px) translateY(${t.x*-10}px)`;
      if (ringsRef.current) ringsRef.current.style.transform = `translateX(${t.y*7}px) translateY(${t.x*-5}px)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section ref={heroRef} style={hero.shell}>
      {/* Particles */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {PARTICLES.map((p, i) => (
          <div key={i} aria-hidden="true" style={{
            position:'absolute',
            bottom:`-${p.size+10}px`, left:`${p.left}%`,
            width:p.size, height:p.size, borderRadius:'50%',
            background: p.isGold ? `rgba(200,155,60,${0.25+(i%3)*0.12})` : `rgba(122,32,54,${0.18+(i%3)*0.10})`,
            boxShadow: p.isGold ? `0 0 ${p.size*2}px rgba(200,155,60,0.5)` : `0 0 ${p.size*2}px rgba(122,32,54,0.4)`,
            animation:`floatUp ${p.dur}s ${p.delay}s linear infinite`,
          }} />
        ))}
      </div>

      {/* 3D layers */}
      <div style={{ position:'absolute', inset:0, perspective:'900px', pointerEvents:'none' }}>
        <div ref={innerRef} style={{ width:'100%', height:'100%', position:'relative', transformStyle:'preserve-3d', willChange:'transform' }}>
          <div ref={orbsRef} style={{ position:'absolute', inset:0, pointerEvents:'none', willChange:'transform' }}>
            {[
              { w:500,h:500,top:-180,right:-120, bg:'radial-gradient(circle,rgba(200,155,60,0.35) 0%,transparent 65%)', anim:'orbFloat1 9s ease-in-out infinite' },
              { w:380,h:380,bottom:-120,left:'-5%', bg:'radial-gradient(circle,rgba(122,32,54,0.28) 0%,transparent 65%)', anim:'orbFloat2 11s ease-in-out infinite' },
              { w:240,h:240,top:'15%',left:'38%', bg:'radial-gradient(circle,rgba(95,113,87,0.20) 0%,transparent 65%)', anim:'orbFloat3 7s ease-in-out infinite' },
              { w:180,h:180,bottom:'5%',right:'22%', bg:'radial-gradient(circle,rgba(200,155,60,0.22) 0%,transparent 65%)', anim:'orbFloat1 13s 3s ease-in-out infinite' },
            ].map((o,i) => (
              <div key={i} aria-hidden="true" style={{ position:'absolute', borderRadius:'50%', filter:'blur(60px)', willChange:'transform',
                width:o.w, height:o.h, top:o.top, right:o.right, bottom:o.bottom, left:o.left,
                background:o.bg, animation:o.anim }} />
            ))}
          </div>
          <div ref={ringsRef} style={{ position:'absolute', inset:0, pointerEvents:'none', willChange:'transform' }}>
            {[
              { w:320,h:320,top:-40,right:60, c:'rgba(200,155,60,0.30)', a:'ringPulse2 5s ease-in-out infinite' },
              { w:220,h:220,bottom:10,left:'8%', c:'rgba(122,32,54,0.22)', a:'ringPulse2 7s 2s ease-in-out infinite' },
              { w:140,h:140,top:'35%',right:'14%', c:'rgba(200,155,60,0.25)', a:'ringPulse2 6s 1s ease-in-out infinite' },
            ].map((r,i) => (
              <div key={i} aria-hidden="true" style={{ position:'absolute', borderRadius:'50%', border:`1.5px solid ${r.c}`, willChange:'transform,opacity',
                width:r.w, height:r.h, top:r.top, right:r.right, bottom:r.bottom, left:r.left, animation:r.a }} />
            ))}
            <div aria-hidden="true" style={{ position:'absolute', top:0, left:'32%', width:1, height:'140%', background:'linear-gradient(to bottom,transparent,rgba(200,155,60,0.18) 40%,transparent)', transform:'rotate(20deg)', transformOrigin:'top center', animation:'streakFade 4s ease-in-out infinite' }} />
            <div aria-hidden="true" style={{ position:'absolute', top:0, left:'68%', width:1, height:'140%', background:'linear-gradient(to bottom,transparent,rgba(122,32,54,0.12) 50%,transparent)', transform:'rotate(-15deg)', transformOrigin:'top center', animation:'streakFade 5s 2s ease-in-out infinite' }} />
          </div>
          <div aria-hidden="true" style={{ position:'absolute', inset:0, background:'linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.04) 50%,transparent 70%)', animation:'sheenMove 6s ease-in-out infinite', pointerEvents:'none' }} />
        </div>
      </div>

      <div style={{ position:'relative', zIndex:10 }}>{children}</div>
    </section>
  );
}

const hero = {
  shell: {
    position:'relative', overflow:'hidden', minHeight:'520px',
    background:'linear-gradient(145deg,#2A1F1B 0%,#3D2416 30%,#4A2820 60%,#2E1A10 100%)',
    borderBottom:'1px solid rgba(200,155,60,0.2)',
    padding:'90px 0 68px', userSelect:'none',
  },
};

/* ── Main page ───────────────────────────────────────── */
export default function DiscoverPage() {
  const [salons, setSalons]   = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const spotRef               = useRef(null);

  useEffect(() => { loadSalons(); }, []);

  async function loadSalons(q) {
    setLoading(true); setError('');
    try { const d = await api.getSalons(q); setSalons(d.salons); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  /* Spotlight follows mouse over the results section */
  function onResultsMouseMove(e) {
    if (!spotRef.current) return;
    spotRef.current.style.background =
      `radial-gradient(500px circle at ${e.clientX}px ${e.clientY}px,
        rgba(200,155,60,0.09) 0%,
        rgba(122,32,54,0.06) 30%,
        transparent 65%)`;
  }

  return (
    <div>
      <style>{PAGE_CSS}</style>

      {/* ── Hero ── */}
      <Hero3D>
        <div className="container">
          <div style={s.eyebrowWrap}>
            <span style={s.eyebrowDot} /><span style={s.eyebrowText}>The salon finder</span><span style={s.eyebrowDot} />
          </div>
          <h1 style={s.heroTitle}>Your perfect look,<br /><em style={s.heroEm}>just around the corner.</em></h1>
          <p style={s.heroSub}>Browse local salons, pick your stylist, and lock in a time — all in under a minute.</p>

          <form onSubmit={(e) => { e.preventDefault(); loadSalons(search); }} style={s.searchForm} role="search">
            <div style={s.searchWrap}>
              <span style={s.searchIcon} aria-hidden="true"><SearchIcon /></span>
              <input
                placeholder="Search by salon name or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={s.searchInput}
                aria-label="Search salons"
              />
              {search && <button type="button" onClick={() => { setSearch(''); loadSalons(''); }} style={s.clearBtn} aria-label="Clear">✕</button>}
            </div>
            <button type="submit" style={s.searchBtn}>Search</button>
          </form>

          <div style={s.pillRow}>
            {[['✂️','Expert Stylists'],['📅','Instant Booking'],['⭐','Top-rated Salons']].map(([e,l]) => (
              <div key={l} style={s.pill}><span style={s.pillEmoji}>{e}</span><span style={s.pillLabel}>{l}</span></div>
            ))}
          </div>
        </div>
      </Hero3D>

      {/* ── Results ── */}
      <div className="salon-grid-section" onMouseMove={onResultsMouseMove}>
        {/* fixed spotlight layer */}
        <div ref={spotRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, transition:'background 0.05s' }} aria-hidden="true" />

        <div className="container" style={{ position:'relative', zIndex:1 }}>
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && salons.length > 0 && (
            <div style={s.resultsHeader}>
              <h2 style={s.resultsTitle}>{search ? `Results for "${search}"` : 'All salons'}</h2>
              <span style={s.resultCount}>{salons.length} found</span>
            </div>
          )}

          {loading ? (
            <div style={s.grid}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : salons.length === 0 ? (
            <div className="empty-state fade-in">
              <div className="empty-state-icon"><SearchIcon /></div>
              <h3>No salons found</h3>
              <p>Try a different search term, or <button onClick={() => { setSearch(''); loadSalons(''); }} style={{ color:'var(--wine)', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontSize:'inherit' }}>browse all</button>.</p>
            </div>
          ) : (
            <div style={s.grid} className="fade-in-stagger">
              {salons.map((salon) => <SalonCard key={salon.id} salon={salon} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Salon card with 3D tilt ─────────────────────────── */
function SalonCard({ salon }) {
  const cardRef     = useRef(null);
  const reviewCount = salon._count?.reviews ?? 0;

  function onMouseMove(e) {
    const el = cardRef.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = ((e.clientX - r.left) / r.width  - 0.5) * 12;
    const y  = ((e.clientY - r.top)  / r.height - 0.5) * -12;
    el.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-8px) scale(1.01)`;
  }
  function onMouseLeave() {
    const el = cardRef.current; if (!el) return;
    el.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)';
  }

  /* random accent colour per card from a warm palette */
  const accents = ['#7A2036','#C89B3C','#5F7157','#8B4513','#7A5C2E'];
  const accent  = accents[salon.name.charCodeAt(0) % accents.length];

  return (
    <Link
      ref={cardRef}
      to={`/salons/${salon.id}`}
      className="gloss-card"
      style={{
        ...s.card,
        '--card-accent': accent,
        borderTop: `3px solid ${accent}`,
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.25s cubic-bezier(0.22,0.68,0,1.2)',
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Image */}
      <div style={s.imgWrap}>
        {salon.imageUrl
          ? <img src={salon.imageUrl} alt={salon.name} className="card-img" />
          : (
            <div style={{ ...s.imgFallback, background:`linear-gradient(135deg, ${accent}22, ${accent}44)` }}>
              <span style={{ ...s.imgLetter, color: accent }}>{salon.name[0]}</span>
            </div>
          )}
        <div style={s.imgOverlay} />
        {reviewCount > 0 && (
          <div style={s.reviewBadge}>
            <StarIcon filled /><span>{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
          </div>
        )}
        {/* accent glow on image bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${accent}88, transparent)` }} />
      </div>

      {/* Body */}
      <div style={s.cardBody}>
        <h3 style={s.cardTitle}>{salon.name}</h3>
        <div style={s.cardMeta}><MapPinIcon /><span>{salon.city}</span></div>
        {reviewCount > 0 && <div style={{ marginTop:4 }}><Stars count={reviewCount} /></div>}
        <div style={s.cardFooter}>
          <span style={{ ...s.bookCta, color: accent }}>Book now →</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Styles ────────────────────────────────────────────── */
const s = {
  eyebrowWrap: { display:'inline-flex', alignItems:'center', gap:10, marginBottom:20 },
  eyebrowDot:  { display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--gold)', opacity:0.8 },
  eyebrowText: { fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(200,155,60,0.9)' },
  heroTitle:   { fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:500, lineHeight:1.1, maxWidth:560, marginBottom:18, color:'#fff', textShadow:'0 2px 24px rgba(0,0,0,0.4)' },
  heroEm:      { fontStyle:'italic', color:'rgba(200,155,60,0.95)' },
  heroSub:     { color:'rgba(255,255,255,0.68)', fontSize:'clamp(0.92rem,2vw,1.05rem)', maxWidth:460, lineHeight:1.7, marginBottom:32 },
  searchForm:  { display:'flex', gap:10, maxWidth:540, marginBottom:36 },
  searchWrap:  { flex:1, position:'relative', display:'flex', alignItems:'center' },
  searchIcon:  { position:'absolute', left:14, color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', pointerEvents:'none' },
  searchInput: { width:'100%', padding:'13px 40px 13px 44px', borderRadius:'var(--radius-md)', border:'1.5px solid rgba(200,155,60,0.35)', background:'rgba(255,255,255,0.10)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', fontSize:'0.95rem', color:'#fff', boxShadow:'0 4px 24px rgba(0,0,0,0.25)', outline:'none' },
  clearBtn:    { position:'absolute', right:12, background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'0.85rem', padding:'2px 4px', borderRadius:4, lineHeight:1 },
  searchBtn:   { flexShrink:0, borderRadius:'var(--radius-md)', background:'var(--gold)', color:'#1E1714', fontWeight:700, border:'none', padding:'13px 24px', fontSize:'0.92rem', cursor:'pointer', boxShadow:'0 4px 20px rgba(200,155,60,0.45)' },
  pillRow:     { display:'flex', gap:12, flexWrap:'wrap' },
  pill:        { display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'var(--radius-full)', padding:'8px 16px', boxShadow:'0 2px 12px rgba(0,0,0,0.2)' },
  pillEmoji:   { fontSize:'1rem', lineHeight:1 },
  pillLabel:   { fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.88)' },

  resultsHeader: { display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:8 },
  resultsTitle:  { fontFamily:'var(--font-display)', fontSize:'1.45rem', fontWeight:500, color:'var(--ink)' },
  resultCount:   { fontSize:'0.82rem', color:'var(--ink-soft)', fontWeight:600, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)', padding:'4px 12px', borderRadius:'var(--radius-full)', border:'1px solid var(--line)' },
  grid: {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',
    gap:24,
  },

  card: {
    background:'rgba(255,255,255,0.92)',
    backdropFilter:'blur(8px)',
    WebkitBackdropFilter:'blur(8px)',
    borderRadius:16,
    overflow:'hidden',
    textDecoration:'none',
    color:'var(--ink)',
    display:'flex',
    flexDirection:'column',
    boxShadow:'0 4px 20px rgba(30,23,20,0.09)',
    border:'1px solid rgba(255,255,255,0.8)',
  },
  imgWrap:    { height:188, position:'relative', overflow:'hidden' },
  imgFallback:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' },
  imgLetter:  { fontFamily:'var(--font-display)', fontSize:'4rem', fontWeight:500, lineHeight:1 },
  imgOverlay: { position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 50%,rgba(30,23,20,0.28) 100%)' },
  reviewBadge:{ position:'absolute', bottom:12, left:12, background:'rgba(20,14,12,0.65)', backdropFilter:'blur(8px)', color:'#fff', borderRadius:'var(--radius-full)', padding:'4px 10px', fontSize:'0.72rem', fontWeight:600, display:'flex', alignItems:'center', gap:5 },
  cardBody:   { padding:'18px 20px 20px', flex:1, display:'flex', flexDirection:'column', gap:6 },
  cardTitle:  { fontSize:'1.08rem', fontWeight:700, fontFamily:'var(--font-display)' },
  cardMeta:   { display:'flex', alignItems:'center', gap:5, color:'var(--ink-soft)', fontSize:'0.85rem' },
  cardFooter: { marginTop:'auto', paddingTop:14 },
  bookCta:    { fontSize:'0.82rem', fontWeight:700, letterSpacing:'0.03em' },
};
