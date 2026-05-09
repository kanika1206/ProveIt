'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

/* ── Live Ledger Ticker ───────────────────────────────────── */
function LiveTicker() {
  const pool = ['a3f2b91c','e4d70f28','c8912ab3','f1e3047d','9bc56a14','de820c91','4f71b3e8','b72a1d94']
  const [idx, setIdx]   = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false)
      setTimeout(() => { setIdx(i => (i + 1) % pool.length); setShow(true) }, 200)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-mono)', fontSize:11 }}>
      <span style={{
        width:6, height:6, borderRadius:'50%', background:'var(--green)', flexShrink:0,
        boxShadow:'0 0 8px var(--green)', animation:'pulsedot 2s ease-in-out infinite',
      }}/>
      <span style={{ color:'var(--cream-mute)', letterSpacing:'0.1em' }}>LIVE LEDGER</span>
      <span style={{ color:'var(--amber-bright)', opacity: show ? 1 : 0, transition:'opacity .2s', letterSpacing:'0.05em' }}>
        {pool[idx]}...
      </span>
      <span style={{ color:'var(--green)', opacity: show ? 1 : 0, transition:'opacity .2s' }}>✓</span>
    </div>
  )
}

/* ── Floating Credential Card ─────────────────────────────── */
function CredCard() {
  return (
    <div style={{
      width: 218,
      background: 'var(--ink-3)',
      border: '1px solid var(--border-bright)',
      borderRadius: 2,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 28px 72px rgba(0,0,0,.65), 0 0 0 1px rgba(242,232,208,.05)',
      animation: 'floatcard 6s ease-in-out infinite',
    }}>
      {/* top gradient bar */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:2,
        background:'linear-gradient(90deg, var(--rust), var(--amber))',
      }}/>

      {/* header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--cream-mute)', textTransform:'uppercase' }}>
          CREDENTIAL NO. 88157
        </span>
        <span style={{
          background:'rgba(192,66,10,.15)', color:'var(--rust-bright)',
          border:'1px solid rgba(192,66,10,.3)',
          fontFamily:'var(--font-mono)', fontSize:8, fontWeight:600,
          letterSpacing:'.08em', textTransform:'uppercase',
          padding:'2px 7px', borderRadius:1,
        }}>VERIFIED</span>
      </div>

      {/* track label */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--cream-mute)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>
        TRACK · ALGORITHMS
      </div>

      {/* title */}
      <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, lineHeight:1.3, color:'var(--parchment)', marginBottom:16 }}>
        Dynamic Programming,<br/>Gold Seal
      </p>

      {/* dashed rule */}
      <div style={{ borderTop:'1px dashed rgba(242,232,208,.14)', marginBottom:14 }}/>

      {/* stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {[{ v:'94', l:'SCORE' }, { v:'Top 3%', l:'RANK · ✓ JAN' }].map(s => (
          <div key={s.l}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:22, color:'var(--parchment)', lineHeight:1 }}>{s.v}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--cream-mute)', letterSpacing:'0.12em', marginTop:3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* hash */}
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:9, color:'var(--amber-bright)',
        background:'rgba(212,146,26,.07)', border:'1px dashed rgba(212,146,26,.2)',
        padding:'4px 8px', marginBottom:14, letterSpacing:'0.05em',
      }}>
        zk:a3f2b91c...e4d7
      </div>

      {/* footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--cream-mute)' }}>
          Verified by ProveIt Registry
        </span>
        <div style={{
          width:30, height:30, border:'2px solid var(--green)',
          borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          transform:'rotate(-10deg)', opacity:.85,
        }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--green)', fontWeight:700 }}>✓ ZK</span>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes pulsedot { 0%,100%{opacity:1;box-shadow:0 0 8px var(--green)} 50%{opacity:.35;box-shadow:0 0 3px var(--green)} }
        @keyframes floatcard { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-12px) rotate(-0.5deg)} }
        @keyframes faderise  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fr { opacity:0; animation:faderise .65s ease-out forwards; }
        .d1{animation-delay:.04s} .d2{animation-delay:.14s} .d3{animation-delay:.26s}
        .d4{animation-delay:.40s} .d5{animation-delay:.56s}
        .btn-arena:hover { background:var(--rust-bright) !important; box-shadow:0 0 28px rgba(192,66,10,.4); }
        .btn-hall:hover  { border-color:var(--parchment) !important; background:rgba(242,232,208,.04) !important; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px' }}>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section style={{
  minHeight:'auto',
  display:'grid', gridTemplateColumns:'1fr auto',
  gap:52, alignItems:'center',
  padding:'48px 0 32px',
}}>

          {/* LEFT */}
          <div>
            {/* vol label */}
            <div className="fr d1" style={{
              fontFamily:'var(--font-mono)', fontSize:10,
              letterSpacing:'0.2em', color:'var(--cream-mute)',
              textTransform:'uppercase',
              border:'1px solid var(--border)',
              display:'inline-block', padding:'4px 12px', marginBottom:32,
            }}>
              VOL. I · ISSUE 01 · EST. 2026
            </div>

            {/* headline */}
            <h1 className="fr d2" style={{
              fontFamily:'var(--font-display)', fontWeight:900,
              fontSize:'clamp(46px, 6.5vw, 80px)',
              lineHeight:1.02, letterSpacing:'-0.03em',
              color:'var(--parchment)', marginBottom:8,
            }}>
              Your code,
            </h1>
            <h1 className="fr d2" style={{
              fontFamily:'var(--font-display)', fontStyle:'italic', fontWeight:900,
              fontSize:'clamp(46px, 6.5vw, 80px)',
              lineHeight:1.02, letterSpacing:'-0.03em',
              color:'var(--rust-bright)', marginBottom:32,
            }}>
              notarised.
            </h1>

            {/* tagline */}
            <p className="fr d3" style={{
              fontFamily:'var(--font-body)', fontSize:20,
              color:'var(--cream-dim)', lineHeight:1.65,
              maxWidth:460, marginBottom:10,
            }}>
              ProveIt is a workshop for engineers — solve demanding problems,
              and every correct answer becomes a stamped, signed, tamper-proof
              credential in your personal ledger.
            </p>
            <p className="fr d3" style={{
              fontFamily:'var(--font-body)', fontStyle:'italic',
              fontSize:16, color:'var(--cream-mute)', marginBottom:40,
            }}>
              No bots. No inflated résumés. Just proof.
            </p>

            {/* CTAs */}
            <div className="fr d4" style={{ display:'flex', gap:12, marginBottom:52 }}>
              <Link href="/signup" className="btn-arena" style={{
                fontFamily:'var(--font-mono)', fontSize:13, padding:'12px 26px',
                background:'var(--rust)', color:'var(--parchment)',
                border:'1px solid var(--rust-bright)', borderRadius:2,
                cursor:'pointer', letterSpacing:'0.05em', transition:'all .15s',
                textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6,
              }}>
                Open the arena →
              </Link>
              <Link href="/leaderboard" className="btn-hall" style={{
                fontFamily:'var(--font-mono)', fontSize:13, padding:'12px 26px',
                background:'transparent', color:'var(--parchment)',
                border:'1px solid var(--border-bright)', borderRadius:2,
                cursor:'pointer', letterSpacing:'0.05em', transition:'all .15s',
                textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6,
              }}>
                See the hall of fame ↗
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:18, paddingTop:20 }}>
            <CredCard />
            <div style={{
              border:'1px dashed rgba(242,232,208,.13)',
              padding:'10px 16px', width:218,
            }}>
              <LiveTicker />
            </div>
          </div>

        </section>

        {/* ── THIN RULE + FOOTER ─────────────────────────────── */}
        <div style={{
          borderTop:'1px solid var(--border)',
          paddingTop:22, paddingBottom:16,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.15em', color:'var(--cream-mute)', textTransform:'uppercase' }}>
            ProveIt — A Skill Ledger · Est. 2026
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.12em', color:'var(--cream-mute)', textTransform:'uppercase' }}>
            Zero-Knowledge · Tamper-Proof · Yours
          </span>
        </div>

      </div>
    </>
  )
}