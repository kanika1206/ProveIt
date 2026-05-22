"use client";

import { useState } from "react";
import { ShieldCheck, Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Rankings", href: "/leaderboard" },
  { label: "Placement Intel", href: "/intel" },
  { label: "For Employers", href: "#employers" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar sticky top-0 z-50">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="#ffffff" />
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Prove<span style={{ color: 'var(--accent)' }}>It</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="btn btn-ghost" style={{ fontSize: 13 }}>
              {label}
            </a>
          ))}
        </div>

        {/* Desktop right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/login" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Sign in
          </a>
          <a href="/signup" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 20px' }}>
            Try for free →
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} color="var(--ink)" /> : <Menu size={20} color="var(--ink)" />}
        </button>

      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', background: '#ffffff', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--text-secondary)', padding: '10px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none' }}>
              {label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 8, paddingTop: 16 }}>
            <a href="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>Sign in</a>
            <a href="/signup" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>Try for free</a>
          </div>
        </div>
      )}
    </nav>
  );
}
