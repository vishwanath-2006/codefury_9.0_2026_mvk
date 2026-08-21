import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  User,
  Mail,
  Check,
  Save,
  Wallet,
  PiggyBank,
  Activity,
  Target,
  PieChart,
  Shield,
  Edit3,
  Sparkles,
  ArrowRight,
  Edit
} from 'lucide-react';
import { getFinancialProfile } from '../services/onboardingService';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [finProfile, setFinProfile] = useState(null);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  useEffect(() => {
    async function loadFinData() {
      if (user?.id) {
        const data = await getFinancialProfile(user.id);
        if (data) setFinProfile(data);
      }
    }
    loadFinData();
  }, [user?.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);

    try {
      await updateProfile(fullName);
      setSuccessMsg('Profile name updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile name.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'FL';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Fallback view data if profile not fully completed yet
  const displayData = {
    age: finProfile?.age || 28,
    employmentStatus: finProfile?.employment_status || 'Employed',
    occupation: finProfile?.occupation || 'Software Engineer',
    dependents: finProfile?.dependents ?? 0,
    incomeStability: finProfile?.income_stability || 'Stable',
    monthlyIncome: finProfile?.monthly_income || 50000,
    otherIncome: finProfile?.other_income || 0,
    essentialExpenses: finProfile?.monthly_essential_expenses || 25000,
    discretionaryExpenses: finProfile?.monthly_discretionary_expenses || 10000,
    totalExpenses: finProfile?.monthly_expenses || 35000,
    currentSavings: finProfile?.current_savings || 150000,
    emergencyFund: finProfile?.emergency_fund || 100000,
    monthlySavings: finProfile?.monthly_savings || 15000,
    hasDebt: Boolean(finProfile?.has_debt),
    totalDebt: finProfile?.total_debt || 0,
    monthlyDebtPayments: finProfile?.monthly_debt_payments || 0,
    debtType: finProfile?.debt_type || 'N/A',
    goals: finProfile?.goals || [
      { title: 'Emergency Reserve Fund', targetAmount: 200000, currentAmount: 100000, deadline: '2026' },
      { title: 'Home Downpayment', targetAmount: 1000000, currentAmount: 300000, deadline: '2028' }
    ],
    hasInvestments: finProfile?.has_investments ?? true,
    investmentCategories: finProfile?.investment_categories || ['Mutual Funds', 'Stocks'],
    investmentExperience: finProfile?.investment_experience || 'Some experience',
    hasHealthInsurance: finProfile?.has_health_insurance ?? true,
    hasLifeInsurance: finProfile?.has_life_insurance ?? true,
    timeHorizon: finProfile?.time_horizon || '5–10 years',
    riskResponseFall20: finProfile?.risk_response_fall_20 || 'Hold',
    investmentPriority: finProfile?.investment_priority || 'Balanced growth',
    riskTolerance: finProfile?.risk_tolerance || 'Moderate'
  };

  const totalIncome = displayData.monthlyIncome + displayData.otherIncome;
  const monthlySurplus = totalIncome - displayData.totalExpenses;

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
      <PageHeader
        title="User Profile & Financial Identity"
        subtitle="Your complete authenticated identity and onboarded financial data baseline."
        tag="Account & Financial Profile"
      >
        <Button variant="primary" size="sm" icon={Edit3} onClick={() => navigate('/onboarding')}>
          Edit Full Onboarding Profile
        </Button>
      </PageHeader>

      {/* Account Header Identity Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 font-extrabold flex items-center justify-center text-xl shrink-0 border border-emerald-500/30 shadow-md">
              {getInitials(fullName)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{fullName || 'FinLabs User'}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="brand" className="text-[10px]">Verified Account</Badge>
                <Badge variant="neutral" className="text-[10px]">ID: {user?.id?.slice(0, 8)}...</Badge>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition shrink-0"
          >
            <span>Update Onboarding Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Name Update Form */}
        <form onSubmit={handleUpdate} className="mt-6 flex flex-col sm:flex-row items-end gap-3 max-w-xl">
          <div className="flex-1 w-full">
            <Input
              label="Full Name"
              type="text"
              required
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" size="md" disabled={saving} icon={Save} className="w-full sm:w-auto">
            {saving ? 'Saving...' : 'Save Name'}
          </Button>
        </form>

        {successMsg && (
          <p className="mt-2 text-xs font-semibold text-emerald-500 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {successMsg}
          </p>
        )}
      </Card>

      {/* SECTION 1: PERSONAL DETAILS */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            Personal Details
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=1')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Age</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{displayData.age} years</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Employment Status</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.employmentStatus}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Occupation / Industry</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.occupation}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Financial Dependents</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{displayData.dependents}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Income Stability</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.incomeStability}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 2: INCOME & EXPENSES */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Income & Expenses
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=2')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Monthly Income</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.monthlyIncome)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Other Income</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.otherIncome)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Essential Expenses</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.essentialExpenses)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Discretionary</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.discretionaryExpenses)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Total Expenses</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.totalExpenses)}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-emerald-500 block mb-0.5 font-bold">Monthly Surplus</span>
            <span className="font-extrabold font-mono text-emerald-500">{formatINR(monthlySurplus)}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 3: SAVINGS & EMERGENCY FUND */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-500" />
            Savings & Emergency Reserve
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=2')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Total Savings</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.currentSavings)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Emergency Reserve</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.emergencyFund)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Monthly Savings Target</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.monthlySavings)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Emergency Coverage</span>
            <span className="font-bold font-mono text-emerald-500">
              {displayData.essentialExpenses > 0 ? (displayData.emergencyFund / displayData.essentialExpenses).toFixed(1) : 0} Months
            </span>
          </div>
        </div>
      </Card>

      {/* SECTION 4: DEBT & LIABILITIES */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Debt & Liabilities
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=2')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Debt Status</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.hasDebt ? 'Active Loans' : 'No Debt'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Total Debt</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.totalDebt)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Monthly EMI / Payments</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(displayData.monthlyDebtPayments)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Primary Debt Type</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.debtType}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 5: FINANCIAL GOALS */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Financial Goals ({displayData.goals.length})
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=3')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {displayData.goals.map((g, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
              <div>
                <span className="font-bold block text-slate-900 dark:text-slate-100">{g.title}</span>
                <span className="text-[10px] text-slate-400">Target Year: {g.deadline}</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-emerald-500 block">{formatINR(g.currentAmount)}</span>
                <span className="text-[10px] text-slate-400">of {formatINR(g.targetAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 6: INVESTMENTS & DIVERSIFICATION */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Investments & Experience
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=3')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Active Investor</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.hasInvestments ? 'Yes' : 'Not yet'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Experience Level</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.investmentExperience}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-1">Categories</span>
            <div className="flex flex-wrap gap-1">
              {displayData.investmentCategories.map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 7: INSURANCE & SAFETY */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Insurance & Financial Safety
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=3')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <span>Health Insurance Coverage</span>
            <span className={`font-bold ${displayData.hasHealthInsurance ? 'text-emerald-500' : 'text-slate-400'}`}>
              {displayData.hasHealthInsurance ? 'Covered ✓' : 'Not Covered ✗'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <span>Term / Life Insurance Coverage</span>
            <span className={`font-bold ${displayData.hasLifeInsurance ? 'text-emerald-500' : 'text-slate-400'}`}>
              {displayData.hasLifeInsurance ? 'Covered ✓' : 'Not Covered ✗'}
            </span>
          </div>
        </div>
      </Card>

      {/* SECTION 8: RISK PROFILE */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Risk Profile & Time Horizon
          </h4>
          <button
            onClick={() => navigate('/onboarding?step=3')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Time Horizon</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.timeHorizon}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">20% Market Dip Reaction</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.riskResponseFall20}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Investment Priority</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.investmentPriority}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-400 block mb-0.5">Volatility Comfort</span>
            <span className="font-bold text-emerald-500">{displayData.riskTolerance}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
