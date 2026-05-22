"use client";

const layers = [
  { area: "Skill verification", color: 'var(--accent-light)',          border: 'var(--accent-dim)',    text: 'var(--accent)',   dot: 'var(--accent)',   items: ["snarkjs (Groth16)", "Poseidon Hash", "BN128 circuit"] },
  { area: "Ledger & integrity", color: 'rgba(45,90,142,0.08)',         border: 'rgba(45,90,142,0.25)', text: 'var(--info)',     dot: 'var(--info)',     items: ["SHA-256 chain", "SQLAlchemy async", "PostgreSQL 15"] },
  { area: "AI & questions",     color: 'rgba(109,40,217,0.07)',        border: 'rgba(109,40,217,0.2)', text: '#6d28d9',         dot: '#6d28d9',         items: ["Groq LLaMA-3.3-70B", "Redis cache", "Fallback seed bank"] },
  { area: "Privacy & intel",    color: 'rgba(193,125,16,0.08)',        border: 'rgba(193,125,16,0.25)',text: 'var(--warning)',  dot: 'var(--warning)',  items: ["Laplace DP (ε=1.0)", "P2P Gossip protocol", "FedAvg + Trimmed Mean"] },
  { area: "Frontend",           color: 'var(--cream-dark)',            border: 'var(--border-light)',  text: 'var(--text-secondary)', dot: 'var(--text-muted)', items: ["Next.js 14 App Router", "Tailwind CSS", "Framer Motion"] },
  { area: "Security",           color: 'rgba(200,75,47,0.06)',         border: 'rgba(200,75,47,0.2)',  text: 'var(--danger)',   dot: 'var(--danger)',   items: ["resource.setrlimit", "JWT + bcrypt", "python-jose"] },
];

export default function TechStack() {
  return (
    <section style={{ background: 'var(--paper)', borderBottom: '2px solid var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>

        <div style={{ maxWidth: 520, marginBottom: 48 }}>
          <p className="label-section" style={{ marginBottom: 12 }}>Under the hood</p>
          <h2 className="heading-editorial" style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 12 }}>
            Not a CRUD app wrapped in <em>AI branding.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Every layer is a real CS concept solving a real problem.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {layers.map(({ area, color, border, text, dot, items }) => (
            <div key={area} style={{ background: color, border: `1px solid ${border}`, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: text }}>{area}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {items.map(item => (
                  <li key={item} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', padding: '3px 0', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
