"use client";

import { ShieldCheck } from "lucide-react";

const links = {
  Platform: ["Dashboard", "Assessments", "ZK Proof vault", "Leaderboard", "Placement intel"],
  Employers: ["Verify a proof", "API access", "Bulk verification", "Pricing"],
  Resources: ["How ZK proofs work", "GitHub", "API docs", "Changelog"],
  Company: ["About", "Blog", "Open source", "Contact us"],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <span className="font-bold text-[16px] text-gray-900">
                Prove<span className="text-teal-600">It</span>
              </span>
            </div>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-[160px]">
              Skill verification that no one can fake or dispute.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-[13px] font-semibold text-gray-800 mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-gray-400">
          <span>© {new Date().getFullYear()} ProveIt · MIT License</span>
          <span>Built with Next.js, FastAPI, snarkjs, and Groq</span>
        </div>
      </div>
    </footer>
  );
}
