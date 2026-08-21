import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturePreview from '../components/landing/FeaturePreview';
import HowItWorks from '../components/landing/HowItWorks';
import FaqSection from '../components/landing/FaqSection';
import Footer from '../components/landing/Footer';
import CursorGlow from '../components/ui/CursorGlow';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200 relative">
      {/* Interactive Cursor Spotlight Follower */}
      <CursorGlow />

      <LandingNavbar />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturePreview />
        <HowItWorks />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
