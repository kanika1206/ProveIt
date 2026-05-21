"use client";

import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">

        {/* Left — copy */}
        <div>
          {/* Social proof */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex -space-x-2">
              {["#f87171","#34d399","#60a5fa","#a78bfa"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <span className="text-[13px] text-gray-500">
              <span className="font-medium text-gray-800">2,400+ students</span> verified their skills this week
            </span>
          </div>

          <h1 className="text-[42px] md:text-[52px] font-bold leading-[1.1] tracking-tight text-gray-950 mb-6">
            Your CGPA is<br />
            <span className="relative inline-block">
              <span className="relative z-10">not your story.</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-teal-100 -z-0 rounded" />
            </span>
          </h1>

          <p className="text-[17px] text-gray-500 leading-[1.75] mb-8 max-w-md">
            ProveIt lets you show employers what you can actually do — with
            cryptographic proof, not just a number on a transcript.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-[15px] font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Start for free <ArrowRight size={15} />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 text-[15px] text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              See how it works
            </a>
          </div>

          <div className="flex flex-wrap gap-5 text-[13px] text-gray-400">
            <span>✓ No credit card needed</span>
            <span>✓ Free forever plan</span>
            <span>✓ Works for all colleges</span>
          </div>
        </div>

        {/* Right — proof card mockup */}
        <div className="relative hidden md:block">
          {/* Background blob */}
          <div className="absolute inset-0 bg-teal-50 rounded-3xl -rotate-2 scale-95" />

          <div className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[12px] text-gray-400 mb-0.5">Skill verification</p>
                <p className="text-[15px] font-semibold text-gray-900">DSA · Advanced</p>
              </div>
              <span className="text-[12px] font-medium bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100">
                Verified ✓
              </span>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "Percentile rank", value: "Top 8%", bar: 92 },
                { label: "Problem solving", value: "94 / 100", bar: 94 },
                { label: "Time efficiency", value: "87 / 100", bar: 87 },
              ].map(({ label, value, bar }) => (
                <div key={label}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 bg-teal-500 rounded-full"
                      style={{ width: `${bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[12px] text-gray-400">
              <span>🔒 ZK proof · score hidden</span>
              <span className="text-teal-600 font-medium cursor-pointer hover:underline">Share proof →</span>
            </div>
          </div>

          {/* Floating review */}
          <div className="absolute -bottom-4 -left-6 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 w-52">
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              "Got shortlisted at 3 companies without even sharing my CGPA."
            </p>
            <p className="text-[10px] text-gray-400 mt-1">— Priya, NIT Trichy</p>
          </div>
        </div>

      </div>
    </section>
  );
}
