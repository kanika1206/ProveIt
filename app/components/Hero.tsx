"use client";

import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section style={{ background: 'var(--paper)', borderBottom: '2px solid var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

        {/* LEFT */}
        <div>
          {/* Label */}
          <p className="label-section" style={{ marginBottom: 20 }}>
            ProveIt 2.0 · AI Skill Platform
          </p>

          {/* Social proof */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--cream)', border: '1px solid var(--border-light)', padding: '6px 12px', marginBottom: 28 }}>
            <div style={{ display: 'flex' }}>
              {["#C84B2F","#2D3B1F","#C17D10","#2D5A8E"].map((c,i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid var(--paper)', marginLeft: i === 0 ? 0 : -6 }} />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <strong style={{ color: 'var(--ink)' }}>2,400+ students</strong> verified this week
            </span>
          </div>

          {/* Headline */}
          <h1 className="heading-editorial" style={{ fontSize: 'clamp(36px,4.5vw,56px)', marginBottom: 20 }}>
            Your CGPA is<br /><em>not your story.</em>
          </h1>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 28, maxWidth: 420 }}>
            ProveIt lets you show employers what you can actually do — with
            cryptographic proof, not just a number on a transcript.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <a href="/signup" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Start for free <ArrowRight size={14} />
            </a>
            <a href="#how" className="btn btn-secondary">
              See how it works
            </a>
          </div>

          <div style={{ display: 'flex', gap: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            <span>✓ No card needed</span>
            <span>✓ Free forever</span>
            <span>✓ Any college</span>
          </div>
        </div>

        {/* RIGHT — proof card */}
        <div style={{ position: 'relative' }}>
          {/* Offset shadow bg */}
          <div style={{ position: 'absolute', inset: 0, background: 'var(--cream-darker)', transform: 'rotate(-2deg) scale(0.97)' }} />

          <div className="card-stamp" style={{ position: 'relative' }}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <p className="label-section" style={{ marginBottom: 4 }}>Skill verification</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>DSA · Advanced</p>
              </div>
              <span className="badge badge-success">Verified ✓</span>
            </div>

            {/* Bars */}
            {[
              { label: 'Percentile rank', value: 'Top 8%', pct: 92 },
              { label: 'Problem solving', value: '94/100', pct: 94 },
              { label: 'Time efficiency', value: '87/100', pct: 87 },
            ].map(({ label, value, pct }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{value}</span>
                </div>
                <div style={{ height: 4, background: 'var(--cream-darker)' }}>
                  <div style={{ width: `${pct}%`, height: 4, background: 'var(--accent)' }} />
                </div>
              </div>
            ))}

            <div className="divider-dashed" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔒 Score hidden</span>
              <a href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Share proof →</a>
            </div>
          </div>

          {/* Floating review */}
          <div className="card-stamp" style={{ position: 'absolute', bottom: -20, left: -24, width: 200, padding: '12px 14px' }}>
            <div style={{ color: 'var(--warning)', fontSize: 11, marginBottom: 6 }}>★★★★★</div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 6 }}>
              "Got shortlisted at 3 companies without sharing my CGPA."
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>— Priya, NIT Trichy</p>
          </div>
        </div>

      </div>
    </section>
  );
}
