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

  // Helper to format experience label
  const formatExperienceLabel = (exp) => {
    if (!exp) return 'Beginner — I\'m new to investing';
    const lower = String(exp).toLowerCase();
    if (lower.includes('beginner') || lower.includes('new')) return 'Beginner — I\'m new to investing';
    if (lower.includes('some')) return 'Some Experience — I\'ve been investing for a while';
    if (lower.includes('experienced')) return 'Experienced — I understand investing and manage my investments confidently';
    return exp;
  };

  // Persisted view data if profile completed, with zero-safe nullish coalescing
  const displayData = {
    age: finProfile?.age ?? 28,
    employmentStatus: finProfile?.employment_status || 'Employed',
    occupation: finProfile?.occupation || 'Software Engineer',
    dependents: finProfile?.dependents ?? 0,
    incomeStability: finProfile?.income_stability || 'Stable',
    monthlyIncome: finProfile?.monthly_income ?? 50000,
    otherIncome: finProfile?.other_income ?? 0,
    essentialExpenses: finProfile?.monthly_essential_expenses ?? 25000,
    discretionaryExpenses: finProfile?.monthly_discretionary_expenses ?? 10000,
    totalExpenses: finProfile?.monthly_expenses ?? 35000,
    currentSavings: finProfile?.current_savings ?? 150000,
    emergencyFund: finProfile?.emergency_fund ?? 100000,
    monthlySavings: finProfile?.monthly_savings ?? 15000,
    hasDebt: Boolean(finProfile?.has_debt),
    totalDebt: finProfile?.total_debt ?? 0,
    monthlyDebtPayments: finProfile?.monthly_debt_payments ?? 0,
    debtType: finProfile?.debt_type || 'N/A',
    goals: finProfile?.goals || [],
    hasInvestments: finProfile?.has_investments ?? true,
    investmentCategories: finProfile?.investment_categories || ['Mutual Funds', 'Stocks'],
    investmentExperience: formatExperienceLabel(finProfile?.investment_experience),
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

      {/* Profile Identity Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 font-extrabold flex items-center justify-center text-xl border border-emerald-500/30">
              {getInitials(fullName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{fullName || 'FinLabs User'}</h2>
                <Badge variant="brand" className="text-[10px]">Verified User</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || 'authenticated.user@finlabs.io'}</p>
            </div>
          </div>

          <Badge variant="neutral" className="text-xs font-mono">
            {finProfile?.onboarding_completed ? 'Onboarding Complete' : 'Profile Initialized'}
          </Badge>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name"
              required
            />
            <Input
              label="Email Address"
              icon={Mail}
              value={user?.email || ''}
              disabled
              className="opacity-70 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving}
              icon={Save}
            >
              {saving ? 'Saving Changes...' : 'Save Profile Name'}
            </Button>
          </div>
        </form>
      </Card>

      {/* SECTION 1: Personal Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            1. Personal Details
          </h3>
          <Button variant="outline" size="xs" icon={Edit} onClick={() => navigate('/onboarding?step=1')}>
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Age</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.age} Years</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Employment</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.employmentStatus}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Occupation</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.occupation}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Dependents</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.dependents}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 2: Income & Expenses */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            2. Income & Expenses
          </h3>
          <Button variant="outline" size="xs" icon={Edit} onClick={() => navigate('/onboarding?step=2')}>
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5 font-sans">Monthly Take-Home</span>
            <span className="font-bold text-emerald-500 text-sm">{formatINR(displayData.monthlyIncome)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5 font-sans">Other Income</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formatINR(displayData.otherIncome)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5 font-sans">Total Monthly Expenses</span>
            <span className="font-bold text-rose-500 text-sm">{formatINR(displayData.totalExpenses)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5 font-sans">Monthly Surplus</span>
            <span className="font-bold text-emerald-400 text-sm">{formatINR(monthlySurplus)}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 3: Savings & Emergency Reserve */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-500" />
            3. Savings & Emergency Reserve
          </h3>
          <Button variant="outline" size="xs" icon={Edit} onClick={() => navigate('/onboarding?step=2')}>
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5 font-sans">Total Liquid Savings</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formatINR(displayData.currentSavings)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5 font-sans">Emergency Reserve</span>
            <span className="font-bold text-emerald-500 text-sm">{formatINR(displayData.emergencyFund)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5 font-sans">Monthly Savings Target</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formatINR(displayData.monthlySavings)}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 4: Debt & Liabilities */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            4. Debt & Liabilities
          </h3>
          <Button variant="outline" size="xs" icon={Edit} onClick={() => navigate('/onboarding?step=2')}>
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Active Liabilities</span>
            <Badge variant={displayData.hasDebt ? 'warning' : 'brand'} className="text-[10px]">
              {displayData.hasDebt ? 'Yes (Active Debt)' : 'Debt Free 🎉'}
            </Badge>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Total Outstanding Debt</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatINR(displayData.totalDebt)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Monthly EMI Payments</span>
            <span className="font-mono font-bold text-rose-500">{formatINR(displayData.monthlyDebtPayments)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Primary Debt Type</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.debtType}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 5: Financial Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            5. Financial Goals ({displayData.goals.length})
          </h3>
          <Button variant="outline" size="xs" icon={Edit} onClick={() => navigate('/onboarding?step=3')}>
            Edit Goals
          </Button>
        </div>

        {displayData.goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {displayData.goals.map((g, idx) => (
              <div key={g.id || idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 dark:text-slate-100">{g.title}</span>
                  <Badge variant="brand" className="text-[10px]">{g.priority || 'Medium'} Priority</Badge>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Target: {formatINR(g.targetAmount)}</span>
                  <span className="text-emerald-500 font-bold">Saved: {formatINR(g.currentAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-mono">No specific financial goals added yet.</p>
        )}
      </Card>

      {/* SECTION 6: Investments & Experience */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" />
            6. Investments & Experience
          </h3>
          <Button variant="outline" size="xs" icon={Edit} onClick={() => navigate('/onboarding?step=3')}>
            Edit
          </Button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Active Investment Footprint</span>
            <div className="flex flex-wrap gap-1.5">
              {displayData.investmentCategories.map((cat) => (
                <Badge key={cat} variant="neutral" className="text-[10px]">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Investing Experience</span>
            <span className="font-bold text-emerald-500">{displayData.investmentExperience}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 7: Risk Profile & Insurance */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            7. Risk Profile & Insurance Safety
          </h3>
          <Button variant="outline" size="xs" icon={Edit} onClick={() => navigate('/onboarding?step=3')}>
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Risk Appetite</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.riskTolerance}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Investment Horizon</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{displayData.timeHorizon}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Health Insurance</span>
            <Badge variant={displayData.hasHealthInsurance ? 'brand' : 'neutral'} className="text-[10px]">
              {displayData.hasHealthInsurance ? 'Covered' : 'Not Covered'}
            </Badge>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Life / Term Insurance</span>
            <Badge variant={displayData.hasLifeInsurance ? 'brand' : 'neutral'} className="text-[10px]">
              {displayData.hasLifeInsurance ? 'Covered' : 'Not Covered'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
