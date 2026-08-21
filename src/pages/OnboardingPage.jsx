import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ArrowRight, CheckCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useOnboarding } from '../context/OnboardingContext';
import Button from '../components/ui/Button';

import OnboardingStep1 from '../components/onboarding/OnboardingStep1';
import OnboardingStep2 from '../components/onboarding/OnboardingStep2';
import OnboardingStep3 from '../components/onboarding/OnboardingStep3';
import OnboardingStep4 from '../components/onboarding/OnboardingStep4';
import OnboardingStep5 from '../components/onboarding/OnboardingStep5';
import OnboardingStep6 from '../components/onboarding/OnboardingStep6';
import OnboardingStep7 from '../components/onboarding/OnboardingStep7';
import OnboardingStep8 from '../components/onboarding/OnboardingStep8';
import SynthesisLoader from '../components/onboarding/SynthesisLoader';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { formData: savedFormData, updateProfile } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(savedFormData);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [calculatedHealth, setCalculatedHealth] = useState(74);
  const [calculatedRisk, setCalculatedRisk] = useState('Moderate');

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const stepTitles = [
    'Baseline Identity & Career',
    'Income & Cash Flow',
    'Expenses & Burn Rate',
    'Liabilities & Credit Profile',
    'Liquidity & Safety Net',
    'Investment Portfolio',
    'Behavioral Risk Profile',
    'Primary Goal & Launchpad',
  ];

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // Trigger calculation and synthesis loader
    const result = await updateProfile(formData);
    setCalculatedHealth(result.healthScore);
    setCalculatedRisk(result.riskProfile);
    setIsSynthesizing(true);
  };

  const handleSynthesisComplete = () => {
    setIsSynthesizing(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Smart<span className="text-emerald-500">Wealth AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Step {currentStep} of 8
            </span>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Wizard Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              {stepTitles[currentStep - 1]}
            </span>
            <span className="font-mono text-slate-500">{Math.round((currentStep / 8) * 100)}% Completed</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex gap-1">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-full flex-1 transition-all duration-300 rounded-full ${
                  idx + 1 <= currentStep ? 'bg-emerald-500' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Container for Current Step */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          {currentStep === 1 && <OnboardingStep1 data={formData} onChange={handleFieldChange} />}
          {currentStep === 2 && <OnboardingStep2 data={formData} onChange={handleFieldChange} />}
          {currentStep === 3 && <OnboardingStep3 data={formData} onChange={handleFieldChange} />}
          {currentStep === 4 && <OnboardingStep4 data={formData} onChange={handleFieldChange} />}
          {currentStep === 5 && <OnboardingStep5 data={formData} onChange={handleFieldChange} />}
          {currentStep === 6 && <OnboardingStep6 data={formData} onChange={handleFieldChange} />}
          {currentStep === 7 && <OnboardingStep7 data={formData} onChange={handleFieldChange} />}
          {currentStep === 8 && <OnboardingStep8 data={formData} onChange={handleFieldChange} />}

          {/* Action Navigation Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Back
            </Button>

            {currentStep < 8 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                icon={ArrowRight}
                iconPosition="right"
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={CheckCircle}
                iconPosition="right"
                className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 px-6"
              >
                Complete Onboarding & View Dashboard
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-900">
        SmartWealth AI — Bank-grade privacy & encryption standards
      </footer>

      {/* High-End Synthesis Micro-Animation Loader */}
      {isSynthesizing && (
        <SynthesisLoader
          healthScore={calculatedHealth}
          riskProfile={calculatedRisk}
          onComplete={handleSynthesisComplete}
        />
      )}
    </div>
  );
}
