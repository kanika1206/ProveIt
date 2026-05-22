"use client";

const steps = [
  { num: "01", title: "Take a fresh assessment",         desc: "Pick DSA, System Design, or Aptitude. Questions are generated live by AI — no prep tricks work here.",                             aside: "45–60 minutes" },
  { num: "02", title: "Your score gets locked in",       desc: "The moment you submit, it's committed to a Poseidon hash. You can't retake to cherry-pick a better score.",                       aside: "Happens automatically" },
  { num: "03", title: "Generate a proof in your browser",desc: "A Groth16 ZK circuit runs locally on your device. Your actual score never touches our servers — we can't see it.",               aside: "Under 30 seconds" },
  { num: "04", title: "Share one link with employers",   desc: "Send /verify/your-proof-id to any recruiter. They see verified or not — no login, no account, no trust required from anyone.", aside: "Works forever, publicly" },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{ background: 'var(--ink)', borderBottom: '2px solid var(--cream-darker)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>

        {/* Header */}
        <div style={{ maxWidth: 520, marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: 12 }}>
            How it works
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 'clamp(28px,3.5vw,40px)', color: 'var(--cream)', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 12 }}>
            From test to verified proof — in under an hour.
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--cream-darker)', lineHeight: 1.7 }}>
            No complicated setup. No uploading documents. No waiting for approval.
          </p>
        </div>

        {/* Steps grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {steps.map(({ num, title, desc, aside }) => (
            <div
              key={num}
              style={{ background: '#141414', border: '1px solid #2a2a2a', padding: 28 }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 12, letterSpacing: '0.1em' }}>{num}</p>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 20, color: 'var(--cream)', marginBottom: 10, lineHeight: 1.25 }}>{title}</h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginBottom: 16 }}>{desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{aside}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
