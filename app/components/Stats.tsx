"use client";

const stats = [
  { value: "12K+", label: "Students verified", note: "across 500+ colleges" },
  { value: "38K+", label: "ZK proofs issued", note: "tamper-proof, always" },
  { value: "91%", label: "Placement rate", note: "among active users" },
  { value: "0", label: "Resumes rejected", note: "for low CGPA, ever" },
];

export default function Stats() {
  return (
    <section className="bg-gray-950 py-14 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, label, note }) => (
          <div key={label} className="text-center">
            <div className="text-[36px] font-bold text-white mb-1 tracking-tight">{value}</div>
            <div className="text-[14px] text-gray-300 font-medium mb-0.5">{label}</div>
            <div className="text-[12px] text-gray-500">{note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
