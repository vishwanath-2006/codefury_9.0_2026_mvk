import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import SipCalculator from '../components/ui/SipCalculator';

export default function SipCalculatorPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="SIP & Wealth Simulator"
        subtitle="Calculate expected returns, inflation-adjusted wealth growth, and step-up SIP scenarios."
        tag="Calculators"
      />

      <div className="bg-white dark:bg-slate-950 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <SipCalculator initialExpectedRate={12} />
      </div>
    </div>
  );
}
