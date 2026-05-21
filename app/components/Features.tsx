"use client";

import { Lock, Bot, BarChart2, Link2, Medal, Code2 } from "lucide-react";

const features = [
  {
    icon: Lock,
    tag: "Privacy",
    title: "Your score stays with you",
    desc: "We use zero-knowledge proofs so employers only see whether you passed a threshold — not your actual score. Math guarantees it, not a promise.",
  },
  {
    icon: Bot,
    tag: "Integrity",
    title: "Questions nobody's seen before",
    desc: "Every assessment pulls fresh questions from an AI — no question bank to screenshot, no Telegram group that ruins it. Each test is genuinely unique.",
  },
  {
    icon: Link2,
    tag: "Trust",
    title: "Results that can't be faked",
    desc: "Every result gets SHA-256 chained the moment you submit. Any employer can verify the full chain themselves — no middleman, no trust required.",
  },
  {
    icon: BarChart2,
    tag: "Intel",
    title: "Know what companies are testing",
    desc: "Anonymous signals from 500+ colleges tell you which companies are hiring, what rounds they're running, and what skills they actually care about.",
  },
  {
    icon: Medal,
    tag: "Fairness",
    title: "Compete on skill, not pedigree",
    desc: "Rankings are built on verified performance only. A tier-3 college student who can code beats a tier-1 student who can't. Simple as that.",
  },
  {
    icon: Code2,
    tag: "Safety",
    title: "Code that runs, safely",
    desc: "Submissions run in an OS-level sandbox — 5s CPU cap, 256MB memory, zero disk writes. No cheating, no server crashes, no funny business.",
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-xl mb-14">
        <p className="text-[13px] font-semibold text-teal-600 uppercase tracking-widest mb-3">
          What makes us different
        </p>
        <h2 className="text-[34px] font-bold text-gray-900 leading-tight mb-4">
          Built for students who are tired of being filtered out before they get a chance.
        </h2>
        <p className="text-[16px] text-gray-500 leading-relaxed">
          Every feature exists because the current system is broken in a specific, fixable way.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
        {features.map(({ icon: Icon, tag, title, desc }) => (
          <div
            key={title}
            className="bg-white p-7 hover:bg-teal-50/40 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                <Icon size={18} className="text-gray-600 group-hover:text-teal-600 transition-colors" />
              </div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{tag}</span>
            </div>
            <h3 className="text-[16px] font-semibold text-gray-900 mb-2 leading-snug">{title}</h3>
            <p className="text-[14px] text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
