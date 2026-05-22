"use client";

const stats = [
  { value: "12K+", label: "Students verified", note: "across 500+ colleges" },
  { value: "38K+", label: "ZK proofs issued",  note: "tamper-proof, always" },
  { value: "91%",  label: "Placement rate",    note: "among active users" },
  { value: "0",    label: "Resumes rejected",  note: "for low CGPA, ever" },
];

export default function Stats() {
  return (
    <section style={{ background: 'var(--ink)', borderBottom: '2px solid var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, textAlign: 'center' }}>
        {stats.map(({ value, label, note }) => (
          <div key={label}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 40, color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>
              {value}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--cream-dark)', fontWeight: 600, marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {note}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
