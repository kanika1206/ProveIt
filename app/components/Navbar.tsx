"use client";

import { useState } from "react";
import { ShieldCheck, Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Rankings", href: "/leaderboard" },
  { label: "Placement Intel", href: "/intel" },
  { label: "For Employers", href: "/employers" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-200">
            <ShieldCheck size={17} className="text-white" />
          </div>
          <span className="font-bold text-[18px] text-gray-900 tracking-tight">
            Prove<span className="text-teal-600">It</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 text-[14px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </a>
          <a
            href="/signup"
            className="px-4 py-2 rounded-xl bg-gray-900 text-[14px] text-white font-medium hover:bg-gray-700 transition-colors"
          >
            Try for free →
          </a>
        </div>

        <button
          className="md:hidden p-1.5 rounded-lg text-gray-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-5 flex flex-col gap-1">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="py-2.5 text-[15px] text-gray-600 hover:text-gray-900 border-b border-gray-50">
              {label}
            </a>
          ))}
          <div className="flex gap-2 pt-4">
            <a href="/login" className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700">Sign in</a>
            <a href="/signup" className="flex-1 text-center py-2.5 rounded-xl bg-gray-900 text-[14px] text-white font-medium">Try for free</a>
          </div>
        </div>
      )}
    </nav>
  );
}
