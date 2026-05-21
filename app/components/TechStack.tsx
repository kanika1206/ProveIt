"use client";

const layers = [
  {
    area: "Skill verification",
    color: "bg-teal-50 border-teal-100 text-teal-700",
    dot: "bg-teal-500",
    items: ["snarkjs (Groth16)", "Poseidon Hash", "BN128 circuit"],
  },
  {
    area: "Ledger & integrity",
    color: "bg-blue-50 border-blue-100 text-blue-700",
    dot: "bg-blue-500",
    items: ["SHA-256 chain", "SQLAlchemy async", "PostgreSQL 15"],
  },
  {
    area: "AI & questions",
    color: "bg-violet-50 border-violet-100 text-violet-700",
    dot: "bg-violet-500",
    items: ["Groq LLaMA-3.3-70B", "Redis cache", "Fallback seed bank"],
  },
  {
    area: "Privacy & intel",
    color: "bg-amber-50 border-amber-100 text-amber-700",
    dot: "bg-amber-500",
    items: ["Laplace DP (ε=1.0)", "P2P Gossip protocol", "FedAvg + Trimmed Mean"],
  },
  {
    area: "Frontend",
    color: "bg-gray-50 border-gray-200 text-gray-600",
    dot: "bg-gray-500",
    items: ["Next.js 14 App Router", "Tailwind CSS", "Framer Motion"],
  },
  {
    area: "Security",
    color: "bg-rose-50 border-rose-100 text-rose-700",
    dot: "bg-rose-500",
    items: ["resource.setrlimit", "JWT + bcrypt", "python-jose"],
  },
];

export default function TechStack() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-xl mb-14">
        <p className="text-[13px] font-semibold text-teal-600 uppercase tracking-widest mb-3">
          Under the hood
        </p>
        <h2 className="text-[34px] font-bold text-gray-900 leading-tight mb-4">
          Not a CRUD app wrapped in AI branding.
        </h2>
        <p className="text-[16px] text-gray-500 leading-relaxed">
          Every layer is a real CS concept solving a real problem. Here's what's actually running.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {layers.map(({ area, color, dot, items }) => (
          <div key={area} className={`border rounded-xl p-5 ${color}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[13px] font-semibold">{area}</span>
            </div>
            <ul className="space-y-1.5">
              {items.map((item) => (
                <li key={item} className="text-[13px] opacity-80">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
