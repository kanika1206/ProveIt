"use client";

const steps = [
  {
    num: "01",
    title: "Take a fresh assessment",
    desc: "Pick your domain — DSA, System Design, or Aptitude. You get questions nobody has seen before, generated live by AI. No prep tricks work here.",
    aside: "Takes about 45–60 minutes",
  },
  {
    num: "02",
    title: "Your score gets locked in",
    desc: "The moment you submit, your result is committed to a Poseidon hash. You can't retake it to get a better score to share — the commitment is final.",
    aside: "Happens automatically",
  },
  {
    num: "03",
    title: "Generate a proof in your browser",
    desc: "A ZK circuit runs locally on your device to prove you cleared a threshold. Your actual score never touches our servers. We literally can't see it.",
    aside: "Under 30 seconds",
  },
  {
    num: "04",
    title: "Share one link with employers",
    desc: "Send /verify/your-proof-id to any recruiter. They click it, they see verified or not — no login, no account, no trust required from anyone.",
    aside: "Works forever, publicly",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-gray-950 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl mb-14">
          <p className="text-[13px] font-semibold text-teal-400 uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-[34px] font-bold text-white leading-tight mb-4">
            From test to verified proof — in under an hour.
          </h2>
          <p className="text-[16px] text-gray-400 leading-relaxed">
            No complicated setup. No uploading documents. No waiting for approval.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {steps.map(({ num, title, desc, aside }) => (
            <div
              key={num}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-teal-800 transition-colors"
            >
              <span className="text-[13px] font-bold text-teal-500 mb-4 block">{num}</span>
              <h3 className="text-[18px] font-semibold text-white mb-3 leading-snug">{title}</h3>
              <p className="text-[14px] text-gray-400 leading-relaxed mb-5">{desc}</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span className="text-[12px] text-gray-500">{aside}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
