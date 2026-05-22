"use client";

// NOTE: Your layout.tsx already has a footer.
// Only use this if you want to REPLACE layout.tsx footer with this one.
// If layout.tsx footer is fine, DELETE this file and remove Footer from page.tsx.

const links = {
  Platform:  ["Dashboard", "Assessments", "ZK Proof vault", "Leaderboard", "Placement intel"],
  Employers: ["Verify a proof", "API access", "Bulk verification", "Pricing"],
  Resources: ["How ZK works", "GitHub", "API docs", "Changelog"],
  Company:   ["About", "Blog", "Open source", "Contact"],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--cream-dark)', borderTop: '2px solid var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 32px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 32, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>
              Prove<span style={{ color: 'var(--accent)' }}>It</span>
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 160 }}>
              Skill verification that no one can fake or dispute.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 14 }}>
                {group}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {items.map(item => (
                  <li key={item} style={{ padding: '4px 0' }}>
                    <a href="#" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            © {new Date().getFullYear()} ProveIt · MIT License
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Built with Next.js · FastAPI · snarkjs · Groq
          </span>
        </div>

      </div>
    </footer>
  );
}
