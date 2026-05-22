"use client";

import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import TechStack from "./components/TechStack";
import CTA from "./components/CTA";

// Navbar + Footer already in layout.tsx — do NOT add here
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <TechStack />
      <CTA />
    </div>
  );
}
