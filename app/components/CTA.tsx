"use client";

import { ArrowRight } from "lucide-react";

const testimonials = [
  { quote: "I had a 6.8 CGPA. ProveIt got me a FAANG interview.", name: "Rohit S.",   college: "VIT Vellore" },
  { quote: "Finally something that shows I can actually code.",    name: "Ananya M.",  college: "NSIT Delhi" },
  { quote: "The ZK proof thing sounds scary but it just works.",   name: "Karan P.",   college: "BITS Pilani" },
];

export default function CTA() {
  return (
    <section style={{ background: 'var(--cream)', borderBottom: '2px solid var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>

        {/* Testimonials */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 64 }}>
          {testimonials.map(({ quote, name, college }) => (
            <div key={name} className="card-stamp">
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
                "{quote}"
              </p>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{name}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{college}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA box */}
        <div style={{ background: 'var(--ink)', padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Accent glow */}
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'var(--accent-glow)', borderRadius: '50%', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: 16 }}>
              Ready to prove it?
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 'clamp(32px,4vw,50px)', color: 'var(--cream)', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 16 }}>
              You're more skilled than<br />your CGPA shows.
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--cream-darker)', lineHeight: 1.7, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
              One assessment. One link. Let the proof speak for itself.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <a href="/signup" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Prove your skills <ArrowRight size={14} />
              </a>
              <a href="/leaderboard" className="btn" style={{ background: 'transparent', color: 'var(--cream-dark)', border: '2px solid #2a2a2a', borderRadius: 100 }}>
                See the leaderboard
              </a>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 20 }}>
              Free · No card required · Works at any college
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
