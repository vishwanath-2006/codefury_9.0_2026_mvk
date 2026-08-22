import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import SipCalculator from '../components/ui/SipCalculator';

export default function SipCalculatorPage() {
  const { userProfile } = useOnboarding();

  const initialSurplus = userProfile.primaryGoal.monthlyCommitmentAmount || userProfile.netMonthlySurplus || 15000;
  const initialTenure = userProfile.primaryGoal.timeframeYears || 5;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="SIP & Wealth Simulator"
        subtitle="Calculate expected returns, inflation-adjusted wealth growth, and step-up SIP scenarios."
        tag="Calculators"
      />

      <div className="bg-white dark:bg-slate-950 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <SipCalculator
          initialMonthlyInvestment={initialSurplus}
          initialExpectedRate={12}
          initialTenureYears={initialTenure}
        />
      </div>
    </div>
  );
}
