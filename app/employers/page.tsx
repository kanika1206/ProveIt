"use client";

import { ArrowRight, ShieldCheck, BarChart2, Link2, Users, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Cryptographically verified",
    desc: "Every proof is mathematically guaranteed. No fake certificates, no inflated scores — just verifiable truth.",
  },
  {
    icon: Link2,
    title: "One-click verification",
    desc: "Candidates share a link. You click it. You see verified or not. No login, no account, no integration needed.",
  },
  {
    icon: BarChart2,
    title: "Percentile rankings",
    desc: "See exactly where a candidate ranks among 12,000+ verified students — by domain, topic, and difficulty.",
  },
  {
    icon: Users,
    title: "Sourced from 500+ colleges",
    desc: "Access talent from tier-1 and tier-3 colleges alike. Skills are verified equally regardless of institution.",
  },
  {
    icon: Zap,
    title: "No resume filtering needed",
    desc: "Stop filtering by CGPA and college name. Filter by actual, verified skill — find hidden gems faster.",
  },
  {
    icon: Lock,
    title: "Privacy-preserving by design",
    desc: "Candidates prove they cleared your threshold without revealing their exact score. Consent-first, always.",
  },
];

const steps = [
  { num: "01", title: "Post a skill threshold", desc: "Tell us what percentile or score you require for a role. We generate a shareable verification link." },
  { num: "02", title: "Candidates prove their skills", desc: "Students take a fresh AI-generated assessment and generate a ZK proof — takes under an hour." },
  { num: "03", title: "You verify in one click", desc: "Open the link they share. See ✓ or ✗ instantly. No spreadsheets, no manual screening." },
  { num: "04", title: "Interview with confidence", desc: "Every candidate you talk to has already proved they meet your bar — cryptographically." },
];

const faqs = [
  { q: "Do I need to create an account to verify a proof?", a: "No. Any employer can verify a proof at /verify/[proofId] without creating an account. It's fully public and free." },
  { q: "Can candidates fake their proof?", a: "No. Proofs are generated using Groth16 zero-knowledge circuits and committed to a SHA-256 chain. Mathematically impossible to fake." },
  { q: "What skills can I test for?", a: "Currently DSA, System Design, and Aptitude. More domains coming soon based on employer demand." },
  { q: "Is there a cost for employers?", a: "Verification is free forever. Bulk API access and ATS integrations are available on the Pro plan." },
];

export default function EmployersPage() {
  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{ borderBottom: "1px solid var(--border)", background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: 16 }}>
              For Employers
            </p>
            <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "clamp(36px,4.5vw,54px)", color: "var(--ink)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20 }}>
              Hire on skill.<br />
              <span style={{ color: "var(--accent)" }}>Not on paper.</span>
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 32, maxWidth: 420 }}>
              ProveIt gives you cryptographically verified skill proofs for every candidate — so you spend zero time on unqualified applicants.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="/signup"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, padding: "11px 22px", borderRadius: 10, textDecoration: "none", border: "none" }}
              >
                Get started free <ArrowRight size={14} />
              </a>
              <a
                href="#how"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "var(--ink)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, padding: "11px 22px", borderRadius: 10, textDecoration: "none", border: "1.5px solid var(--border)" }}
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Verification mockup */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(13,158,120,0.06)", borderRadius: 16, transform: "rotate(-2deg) scale(0.97)" }} />
            <div style={{ position: "relative", background: "#ffffff", border: "1.5px solid var(--border)", borderRadius: 12, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8 }}>
                Employer verification
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 20 }}>
                /verify/zk-a3f9c2d1
              </p>

              {[
                { label: "Candidate", value: "Anonymous #4821" },
                { label: "Domain", value: "DSA · Advanced" },
                { label: "Threshold", value: "Top 15%" },
                { label: "Result", value: "✓ Passed", accent: true },
                { label: "Proof issued", value: "22 May 2026" },
                { label: "Chain verified", value: "Block #38,291" },
              ].map(({ label, value, accent }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: accent ? "var(--accent)" : "var(--ink)" }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(13,158,120,0.07)", borderRadius: 8, border: "1px solid rgba(13,158,120,0.2)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, margin: 0 }}>
                  🔒 Cryptographically verified · Cannot be faked
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, textAlign: "center" }}>
          {[
            { value: "12K+", label: "Verified candidates", note: "ready to interview" },
            { value: "< 1hr", label: "Time to verify", note: "per candidate" },
            { value: "500+", label: "Colleges covered", note: "tier 1 through tier 3" },
            { value: "0", label: "Fake proofs", note: "mathematically impossible" },
          ].map(({ value, label, note }) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: 38, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6 }}>{value}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#cbd5e1", fontWeight: 600, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ maxWidth: 520, marginBottom: 48 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: 12 }}>
              Why employers choose ProveIt
            </p>
            <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "clamp(28px,3.5vw,40px)", color: "var(--ink)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Stop screening.<br />
              <span style={{ color: "var(--accent)" }}>Start hiring.</span>
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Every feature is designed to get you from job posting to confident interview faster.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "#ffffff", border: "1.5px solid var(--border)", borderRadius: 12, padding: 24, transition: "box-shadow 0.2s", cursor: "default" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(13,158,120,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={18} color="var(--accent)" />
                </div>
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ maxWidth: 520, marginBottom: 48 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: 12 }}>
              How it works for employers
            </p>
            <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "clamp(28px,3.5vw,40px)", color: "var(--ink)", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              From job posting to<br />
              <span style={{ color: "var(--accent)" }}>verified shortlist.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {steps.map(({ num, title, desc }) => (
              <div key={num} style={{ background: "#ffffff", border: "1.5px solid var(--border)", borderRadius: 12, padding: 28 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 12, letterSpacing: "0.1em" }}>{num}</p>
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: 12, textAlign: "center" }}>
            FAQ
          </p>
          <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "clamp(28px,3.5vw,40px)", color: "var(--ink)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 48, textAlign: "center" }}>
            Common questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {faqs.map(({ q, a }) => (
              <div key={q} style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 8 }}>{q}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ background: "#0f172a", borderRadius: 20, padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 200, background: "rgba(13,158,120,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--accent)", marginBottom: 16 }}>
                Start today
              </p>
              <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "clamp(28px,4vw,46px)", color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Your next hire is already verified.
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "#94a3b8", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 32px" }}>
                Browse 12,000+ verified candidates or post a threshold and let them come to you.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="/signup"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}
                >
                  Get started free <ArrowRight size={15} />
                </a>
                <a
                  href="mailto:employers@proveit.app"
                  style={{ display: "inline-flex", alignItems: "center", background: "transparent", color: "#94a3b8", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, padding: "12px 28px", borderRadius: 10, textDecoration: "none", border: "1px solid #334155" }}
                >
                  Talk to us
                </a>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 20 }}>
                Free · No credit card · Verify unlimited proofs
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
