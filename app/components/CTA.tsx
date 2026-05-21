"use client";

import { ArrowRight } from "lucide-react";

const testimonials = [
  { quote: "I had a 6.8 CGPA. ProveIt got me a FAANG interview.", name: "Rohit S.", college: "VIT Vellore" },
  { quote: "Finally something that shows I can actually code.", name: "Ananya M.", college: "NSIT Delhi" },
  { quote: "The ZK proof thing sounds scary but it just works.", name: "Karan P.", college: "BITS Pilani" },
];

export default function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">

      {/* Testimonials */}
      <div className="grid md:grid-cols-3 gap-4 mb-16">
        {testimonials.map(({ quote, name, college }) => (
          <div key={name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <p className="text-[15px] text-gray-700 leading-relaxed mb-5">"{quote}"</p>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">{name}</p>
              <p className="text-[12px] text-gray-400">{college}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA block */}
      <div className="bg-gray-950 rounded-3xl px-10 py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-[36px] md:text-[44px] font-bold text-white leading-tight tracking-tight mb-4">
            You're more skilled than<br />your CGPA shows.
          </h2>
          <p className="text-[16px] text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto">
            One assessment. One link. Let the proof speak for itself.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white text-[15px] font-semibold px-7 py-3.5 rounded-xl transition-colors"
            >
              Prove your skills <ArrowRight size={16} />
            </a>
            <a
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-[15px] text-gray-400 hover:text-white px-7 py-3.5 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
            >
              See the leaderboard
            </a>
          </div>
          <p className="text-[12px] text-gray-600 mt-6">Free. No card required. Works at any college.</p>
        </div>
      </div>
    </section>
  );
}
