import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturePreview from '../components/landing/FeaturePreview';
import HowItWorks from '../components/landing/HowItWorks';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      <LandingNavbar />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturePreview />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
