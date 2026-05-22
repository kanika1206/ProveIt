"use client";

import { Lock, Bot, Link2, BarChart2, Medal, Code2 } from "lucide-react";

const features = [
  { icon: Lock,     tag: "Privacy",   title: "Your score stays with you",       desc: "ZK proofs mean employers only see if you passed a threshold — not your actual score. Math guarantees it, not a promise." },
  { icon: Bot,      tag: "Integrity", title: "Questions nobody's seen before",  desc: "Fresh questions every session from Groq LLaMA. No question bank to screenshot, no Telegram group that ruins it." },
  { icon: Link2,    tag: "Trust",     title: "Results that can't be faked",     desc: "Every result is SHA-256 chained the moment you submit. Any employer verifies the full chain — no middleman needed." },
  { icon: BarChart2,tag: "Intel",     title: "Know what companies are testing", desc: "Anonymous signals from 500+ colleges tell you what companies are hiring and what they actually care about." },
  { icon: Medal,    tag: "Fairness",  title: "Compete on skill, not pedigree",  desc: "Rankings are purely on verified performance. A tier-3 student who can code beats a tier-1 who can't." },
  { icon: Code2,    tag: "Safety",    title: "Code that runs safely",           desc: "OS-level sandbox — 5s CPU cap, 256MB memory, zero disk writes. No cheating, no server crashes." },
];

export default function Features() {
  return (
    <section id="features" style={{ background: 'var(--cream)', borderBottom: '2px solid var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>

        {/* Header */}
        <div style={{ maxWidth: 560, marginBottom: 48 }}>
          <p className="label-section" style={{ marginBottom: 12 }}>What makes us different</p>
          <h2 className="heading-editorial" style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 12 }}>
            Built for students tired of being <em>filtered out.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Every feature exists because the current system is broken in a specific, fixable way.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: '2px solid var(--ink)' }}>
          {features.map(({ icon: Icon, tag, title, desc }, i) => (
            <div
              key={title}
              className="card-hover"
              style={{
                background: 'var(--paper)',
                padding: 28,
                borderRight: (i+1) % 3 !== 0 ? '2px solid var(--ink)' : 'none',
                borderBottom: i < 3 ? '2px solid var(--ink)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: 'var(--cream)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>{tag}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 17, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
