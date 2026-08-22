import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import {
  User,
  Wallet,
  PiggyBank,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Target,
  Trash2,
  Sparkles,
  PieChart,
  Activity,
  Lock,
  Check,
  Camera,
  Upload
} from 'lucide-react';
import { getFinancialProfile, saveFinancialProfile } from '../services/onboardingService';

export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const { updateProfile, completeOnboarding, setIsOnboarded } = useOnboarding();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stepParam = parseInt(searchParams.get('step'), 10);

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (stepParam >= 1 && stepParam <= 3) {
      setCurrentStep(stepParam);
    }
  }, [stepParam]);

  // Form State preserving all fields
  const [formData, setFormData] = useState({
    // Step 1: About You & Avatar
    profilePhoto: profile?.avatar_url || user?.user_metadata?.avatar_url || '',
    fullName: profile?.full_name || user?.user_metadata?.full_name || '',
    age: '28',
    employmentStatus: 'Employed',
    occupation: 'Software Engineer',
    dependents: '0',
    incomeStability: 'Stable',

    // Step 2: Money Snapshot & Debt
    monthlyIncome: '75000',
    otherIncome: '0',
    monthlyEssentialExpenses: '30000',
    monthlyDiscretionaryExpenses: '15000',
    currentSavings: '150000',
    emergencyFund: '150000',
    monthlySavings: '20000',
    hasDebt: false,
    totalDebt: '0',
    monthlyDebtPayments: '0',
    debtType: 'Home',

    // Step 3: Goals, Portfolio Breakdown & Risk
    goals: [
      { id: 'g1', title: 'Emergency Reserve Fund', targetAmount: 200000, currentAmount: 100000, deadline: '2026', priority: 'High' },
      { id: 'g2', title: 'Home Down Payment', targetAmount: 1500000, currentAmount: 450000, deadline: '2028', priority: 'Medium' }
    ],
    hasInvestments: true,
    portfolioMutualFunds: '175000',
    portfolioStocks: '105000',
    portfolioFDs: '35000',
    portfolioGold: '35000',
    investmentCategories: ['Mutual Funds', 'Stocks'],
    investmentExperience: 'Some Experience',
    hasHealthInsurance: true,
    hasLifeInsurance: true,
    hasEmergencyFund: true,
    timeHorizon: '5–10 years',
    riskResponseFall20: 'Hold',
    investmentPriority: 'Balanced growth',
    riskTolerance: 'Moderate'
  });

  useEffect(() => {
    async function loadExisting() {
      if (user?.id) {
        const existing = await getFinancialProfile(user.id);
        if (existing) {
          setFormData((prev) => ({
            ...prev,
            profilePhoto: existing.profile_photo || prev.profilePhoto,
            fullName: existing.full_name || prev.fullName,
            age: existing.age ? String(existing.age) : prev.age,
            employmentStatus: existing.employment_status || prev.employmentStatus,
            occupation: existing.occupation || prev.occupation,
            dependents: existing.dependents ? String(existing.dependents) : prev.dependents,
            monthlyIncome: existing.monthly_income ? String(existing.monthly_income) : prev.monthlyIncome,
            otherIncome: existing.other_income ? String(existing.other_income) : prev.otherIncome,
            incomeStability: existing.income_stability || prev.incomeStability,
            monthlyEssentialExpenses: existing.monthly_essential_expenses ? String(existing.monthly_essential_expenses) : prev.monthlyEssentialExpenses,
            monthlyDiscretionaryExpenses: existing.monthly_discretionary_expenses ? String(existing.monthly_discretionary_expenses) : prev.monthlyDiscretionaryExpenses,
            currentSavings: existing.current_savings ? String(existing.current_savings) : prev.currentSavings,
            emergencyFund: existing.emergency_fund ? String(existing.emergency_fund) : prev.emergencyFund,
            monthlySavings: existing.monthly_savings ? String(existing.monthlySavings) : prev.monthlySavings,
            hasDebt: Boolean(existing.has_debt),
            totalDebt: existing.total_debt ? String(existing.total_debt) : prev.totalDebt,
            monthlyDebtPayments: existing.monthly_debt_payments ? String(existing.monthly_debt_payments) : prev.monthlyDebtPayments,
            debtType: existing.debt_type || prev.debtType,
            goals: existing.goals?.length ? existing.goals : prev.goals,
            hasInvestments: Boolean(existing.has_investments),
            portfolioMutualFunds: existing.portfolio_mutual_funds ? String(existing.portfolio_mutual_funds) : prev.portfolioMutualFunds,
            portfolioStocks: existing.portfolio_stocks ? String(existing.portfolio_stocks) : prev.portfolioStocks,
            portfolioFDs: existing.portfolio_fds ? String(existing.portfolio_fds) : prev.portfolioFDs,
            portfolioGold: existing.portfolio_gold ? String(existing.portfolio_gold) : prev.portfolioGold,
            investmentCategories: existing.investment_categories?.length ? existing.investment_categories : prev.investmentCategories,
            investmentExperience: existing.investment_experience || prev.investmentExperience,
            hasHealthInsurance: Boolean(existing.has_health_insurance),
            hasLifeInsurance: Boolean(existing.has_life_insurance),
            hasEmergencyFund: Boolean(existing.has_emergency_fund),
            timeHorizon: existing.time_horizon || prev.timeHorizon,
            riskResponseFall20: existing.risk_response_fall_20 || prev.riskResponseFall20,
            investmentPriority: existing.investment_priority || prev.investmentPriority,
            riskTolerance: existing.risk_tolerance || prev.riskTolerance
          }));
        }
      }
    }
    loadExisting();
  }, [user?.id]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Avatar Photo Handler
  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculations
  const totalIncome = (Number(formData.monthlyIncome) || 0) + (Number(formData.otherIncome) || 0);
  const totalExpenses = (Number(formData.monthlyEssentialExpenses) || 0) + (Number(formData.monthlyDiscretionaryExpenses) || 0);
  const monthlyEmis = formData.hasDebt ? (Number(formData.monthlyDebtPayments) || 0) : 0;
  const monthlySurplus = Math.max(0, totalIncome - totalExpenses - monthlyEmis);

  const portfolioSum = (Number(formData.portfolioMutualFunds) || 0) +
                       (Number(formData.portfolioStocks) || 0) +
                       (Number(formData.portfolioFDs) || 0) +
                       (Number(formData.portfolioGold) || 0);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Goal Helpers
  const handleAddGoal = (presetTitle = 'Custom Goal') => {
    const newGoal = {
      id: `g_${Date.now()}`,
      title: presetTitle,
      targetAmount: 500000,
      currentAmount: 50000,
      deadline: '2027',
      priority: 'Medium'
    };
    setFormData((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const handleUpdateGoal = (id, field, val) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, [field]: val } : g))
    }));
  };

  const handleRemoveGoal = (id) => {
    setFormData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  };

  // Category Helpers
  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.investmentCategories.includes(cat);
      const updated = exists
        ? prev.investmentCategories.filter((c) => c !== cat)
        : [...prev.investmentCategories, cat];
      return { ...prev, investmentCategories: updated };
    });
  };

  // Validation
  const validateStep1 = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name.';
    if (!formData.age || Number(formData.age) < 18) return 'Please enter a valid age (18+).';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.monthlyIncome || Number(formData.monthlyIncome) <= 0) {
      return 'Please enter a valid monthly take-home income.';
    }
    if (formData.hasDebt && (!formData.monthlyDebtPayments || Number(formData.monthlyDebtPayments) < 0)) {
      return 'Please enter monthly EMI / debt payment amount.';
    }
    return null;
  };

  const handleNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    setSynthesizing(true);
    setSynthesisProgress(15);

    setTimeout(() => setSynthesisProgress(50), 300);
    setTimeout(() => setSynthesisProgress(85), 750);
    setTimeout(() => setSynthesisProgress(100), 1100);

    try {
      const finalPayload = {
        ...formData,
        monthlyDebtPayments: formData.hasDebt ? formData.monthlyDebtPayments : '0',
        totalDebt: formData.hasDebt ? formData.totalDebt : '0',
        totalInvestmentValue: portfolioSum > 0 ? String(portfolioSum) : '350000'
      };

      await completeOnboarding(finalPayload);

      setTimeout(() => {
        setSynthesizing(false);
        navigate('/financial-health', { replace: true });
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save financial profile.');
      setSynthesizing(false);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150 py-4">
      {/* Header Banner */}
      <PageHeader
        title="Interactive Financial Onboarding"
        subtitle="3-step guided questionnaire to compute your Financial Health Score & Risk Profile baseline."
        tag="Baseline Setup"
      />

      {/* Security Privacy Callout */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong>100% Private:</strong> FinLabs will <strong>NEVER</strong> ask for bank passwords, UPI PINs, card PINs, OTPs, or credentials.
          </span>
        </div>
        <Badge variant="brand" className="text-[10px] shrink-0">Encrypted Session</Badge>
      </div>

      {/* Progress Step Bar & Dots Indicator */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5 text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Step {currentStep} of 3
          </span>
          <span className="text-slate-400 font-mono font-semibold">
            {currentStep === 1 && '👤 Identity & Photo Avatar'}
            {currentStep === 2 && '💰 Cash Flow & Debt EMIs'}
            {currentStep === 3 && '🎯 Goals & Portfolio Allocation Grid'}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-3">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
          <span className={currentStep >= 1 ? 'text-emerald-500 cursor-pointer' : 'cursor-pointer'} onClick={() => setCurrentStep(1)}>● Step 1 (Identity)</span>
          <span className="text-slate-300 dark:text-slate-700">───────</span>
          <span className={currentStep >= 2 ? 'text-emerald-500 cursor-pointer' : 'cursor-pointer'} onClick={() => setCurrentStep(2)}>{currentStep >= 2 ? '●' : '○'} Step 2 (Cash Flow)</span>
          <span className="text-slate-300 dark:text-slate-700">───────</span>
          <span className={currentStep >= 3 ? 'text-emerald-500 cursor-pointer' : 'cursor-pointer'} onClick={() => setCurrentStep(3)}>{currentStep >= 3 ? '●' : '○'} Step 3 (Portfolio & Risk)</span>
        </div>
      </Card>

      {/* Main Wizard Form Card */}
      <Card className="p-6 md:p-8 shadow-xl">
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* =========================================================================
            STEP 1 — 👤 IDENTITY, PHOTO AVATAR & DEMOGRAPHICS
           ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Step 1: Baseline Identity & Profile Photo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set up your personal avatar and baseline career demographics.
              </p>
            </div>

            {/* Avatar Photo Capture Header Trigger */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt="Profile Avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/30 flex items-center justify-center text-2xl font-extrabold shadow-sm">
                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'FL'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition"
                  title="Take Photo or Upload Avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>Profile Photo / Verification Avatar</span>
                  <Badge variant="brand" className="text-[9px]">Optional</Badge>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload an avatar or take a live camera snapshot. Updates top-right navbar instantly.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Choose File / Take Snapshot</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Alex Dev"
              />

              <Input
                label="Age"
                type="number"
                required
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="28"
              />
            </div>

            {/* Employment Status Selectable Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Employment Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'Employed', label: '💼 Employed (Salaried)' },
                  { id: 'Self-Employed', label: '💻 Self-Employed' },
                  { id: 'Business', label: '🏢 Business Owner' },
                  { id: 'Student', label: '🎓 Student' },
                  { id: 'Retired', label: '🏖️ Retired' },
                ].map((item) => {
                  const active = formData.employmentStatus === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleChange('employmentStatus', item.id)}
                      className={`p-3 rounded-xl text-xs font-bold transition border text-left flex items-center justify-between ${
                        active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-extrabold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Occupation / Industry"
                type="text"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                placeholder="Software Engineer, Finance, Healthcare..."
              />

              {/* Dependents Stepper / Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Financial Dependents</label>
                <div className="flex gap-2">
                  {['0', '1', '2', '3', '4+'].map((dep) => {
                    const active = formData.dependents === dep;
                    return (
                      <button
                        key={dep}
                        type="button"
                        onClick={() => handleChange('dependents', dep)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border ${
                          active
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {dep}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Income Stability Selectable Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Income Stability</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'Stable', label: '🔒 Stable (Fixed Monthly Salary)', desc: 'Consistent paycheck every month' },
                  { id: 'Mostly stable', label: '⚖️ Mostly Stable (Salary + Bonus)', desc: 'Fixed base plus performance bonus' },
                  { id: 'Variable', label: '📊 Variable (Freelance / Commission)', desc: 'Floats based on projects or clients' },
                  { id: 'Highly variable', label: '🌊 Highly Variable (Business / Seasonal)', desc: 'High seasonal fluctuations' },
                ].map((item) => {
                  const active = formData.incomeStability === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleChange('incomeStability', item.id)}
                      className={`p-3.5 rounded-xl text-xs font-bold transition border text-left ${
                        active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-extrabold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span>{item.label}</span>
                        {active && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2 — 💰 MONEY SNAPSHOT, DEBT & EMIs
           ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                Step 2: Monthly Cash Flow & Debt Commitments
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your monthly inflows, living expenses, and loan EMI obligations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Take-Home Income (₹)"
                type="number"
                required
                min="0"
                value={formData.monthlyIncome}
                onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                placeholder="75000"
              />

              <Input
                label="Other Monthly Income (₹)"
                type="number"
                min="0"
                value={formData.otherIncome}
                onChange={(e) => handleChange('otherIncome', e.target.value)}
                placeholder="0"
              />

              <Input
                label="Essential Monthly Expenses (₹)"
                type="number"
                min="0"
                value={formData.monthlyEssentialExpenses}
                onChange={(e) => handleChange('monthlyEssentialExpenses', e.target.value)}
                placeholder="30000 (Rent, Groceries, Bills)"
              />

              <Input
                label="Discretionary / Lifestyle Expenses (₹)"
                type="number"
                min="0"
                value={formData.monthlyDiscretionaryExpenses}
                onChange={(e) => handleChange('monthlyDiscretionaryExpenses', e.target.value)}
                placeholder="15000 (Dining, Subscriptions)"
              />
            </div>

            {/* ESTIMATED MONTHLY SURPLUS INSIGHT CARD */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs mb-2 border-b border-slate-800 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Your Estimated Monthly Net Surplus
                </span>
                <Badge variant={monthlySurplus > 0 ? 'success' : 'warning'} className="text-[10px]">
                  {monthlySurplus > 0 ? 'Positive Margin' : 'Surplus Alert'}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans block">Income</span>
                  <span className="font-bold text-white">{formatINR(totalIncome)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans block">Expenses</span>
                  <span className="font-bold text-white">{formatINR(totalExpenses)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans block">Loan EMIs</span>
                  <span className="font-bold text-amber-400">{formatINR(monthlyEmis)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-sans font-bold block">Net Surplus</span>
                  <span className="font-extrabold text-sm text-emerald-400">
                    {formatINR(monthlySurplus)}/mo
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-6" />

            {/* Savings & Emergency Buffer */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-500" />
                Savings & Emergency Cushion
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Current Total Savings (₹)"
                  type="number"
                  min="0"
                  value={formData.currentSavings}
                  onChange={(e) => handleChange('currentSavings', e.target.value)}
                  placeholder="150000"
                />

                <Input
                  label="Emergency Buffer (₹)"
                  type="number"
                  min="0"
                  value={formData.emergencyFund}
                  onChange={(e) => handleChange('emergencyFund', e.target.value)}
                  placeholder="150000"
                />

                <Input
                  label="Monthly Savings Target (₹)"
                  type="number"
                  min="0"
                  value={formData.monthlySavings}
                  onChange={(e) => handleChange('monthlySavings', e.target.value)}
                  placeholder="20000"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-6" />

            {/* Refined Conditional Debt / Loan EMIs Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Do you currently have active debt or loan EMIs?</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('hasDebt', false);
                    handleChange('totalDebt', '0');
                    handleChange('monthlyDebtPayments', '0');
                  }}
                  className={`p-3.5 rounded-xl text-xs font-bold transition border flex items-center justify-between ${
                    formData.hasDebt === false
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🟢 No Debt ("Zero active loans")</span>
                  {formData.hasDebt === false && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('hasDebt', true)}
                  className={`p-3.5 rounded-xl text-xs font-bold transition border flex items-center justify-between ${
                    formData.hasDebt === true
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🔴 Yes, I Have Debt ("Active loans / EMIs")</span>
                  {formData.hasDebt === true && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              </div>

              {/* Refined Conditional Debt Fields */}
              {formData.hasDebt && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 animate-in fade-in">
                  <Input
                    label="Total Monthly EMI Outflow (₹)"
                    type="number"
                    min="0"
                    required
                    value={formData.monthlyDebtPayments}
                    onChange={(e) => handleChange('monthlyDebtPayments', e.target.value)}
                    placeholder="12000"
                  />

                  <Input
                    label="Total Outstanding Debt (₹)"
                    type="number"
                    min="0"
                    value={formData.totalDebt}
                    onChange={(e) => handleChange('totalDebt', e.target.value)}
                    placeholder="500000"
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Debt Type</label>
                    <select
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100"
                      value={formData.debtType}
                      onChange={(e) => handleChange('debtType', e.target.value)}
                    >
                      <option value="Home">Home Loan</option>
                      <option value="Education">Education Loan</option>
                      <option value="Vehicle">Vehicle Loan</option>
                      <option value="Personal">Personal Loan</option>
                      <option value="Credit Card">Credit Card Debt</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3 — 🎯 GOALS, PORTFOLIO ASSET BREAKDOWN & RISK BASELINE
           ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Step 3: Goals, Portfolio Allocation & Risk Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your target milestones, active portfolio breakdown, and risk tolerance.
              </p>
            </div>

            {/* Goals Interactive Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Add Active Financial Goals</label>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {[
                  { title: 'Home', icon: '🏠' },
                  { title: 'Vehicle', icon: '🚗' },
                  { title: 'Travel', icon: '✈️' },
                  { title: 'Education', icon: '🎓' },
                  { title: 'Emergency Reserve', icon: '🛡️' },
                  { title: 'Retirement', icon: '💰' },
                  { title: 'Custom Goal', icon: '＋' },
                ].map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleAddGoal(preset.title)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-500 transition font-bold"
                  >
                    {preset.icon} {preset.title}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {formData.goals.map((g) => (
                  <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        className="font-bold text-sm bg-transparent border-b border-transparent focus:border-emerald-500 text-slate-900 dark:text-slate-100 focus:outline-none"
                        value={g.title}
                        onChange={(e) => handleUpdateGoal(g.id, 'title', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(g.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <Input
                        label="Target Amount (₹)"
                        type="number"
                        value={g.targetAmount}
                        onChange={(e) => handleUpdateGoal(g.id, 'targetAmount', Number(e.target.value))}
                      />
                      <Input
                        label="Current Saved (₹)"
                        type="number"
                        value={g.currentAmount}
                        onChange={(e) => handleUpdateGoal(g.id, 'currentAmount', Number(e.target.value))}
                      />
                      <Input
                        label="Target Year"
                        type="text"
                        value={g.deadline}
                        onChange={(e) => handleUpdateGoal(g.id, 'deadline', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-6" />

            {/* Investments & Portfolio Breakdown Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Do you currently have active investments?</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleChange('hasInvestments', true)}
                  className={`p-3.5 rounded-xl text-xs font-bold transition border flex items-center justify-between ${
                    formData.hasInvestments === true
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>📈 Yes ("I actively invest")</span>
                  {formData.hasInvestments === true && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('hasInvestments', false)}
                  className={`p-3.5 rounded-xl text-xs font-bold transition border flex items-center justify-between ${
                    formData.hasInvestments === false
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🛑 Not yet ("I haven't started investing yet")</span>
                  {formData.hasInvestments === false && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              </div>

              {/* 4-Field Portfolio Breakdown Grid */}
              {formData.hasInvestments && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 space-y-4 animate-in fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
                      <PieChart className="w-4 h-4 text-emerald-500" />
                      Active Portfolio Asset Breakdown (Current Capital Deployment)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enter the current valuation of your deployed assets. Feeds directly into your `/portfolio` workspace.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input
                      label="Mutual Funds / SIPs (₹)"
                      type="number"
                      min="0"
                      value={formData.portfolioMutualFunds}
                      onChange={(e) => handleChange('portfolioMutualFunds', e.target.value)}
                      placeholder="175000"
                    />

                    <Input
                      label="Direct Stocks / Equity (₹)"
                      type="number"
                      min="0"
                      value={formData.portfolioStocks}
                      onChange={(e) => handleChange('portfolioStocks', e.target.value)}
                      placeholder="105000"
                    />

                    <Input
                      label="Fixed Deposits / Bonds (₹)"
                      type="number"
                      min="0"
                      value={formData.portfolioFDs}
                      onChange={(e) => handleChange('portfolioFDs', e.target.value)}
                      placeholder="35000"
                    />

                    <Input
                      label="Gold / Sovereign Assets (₹)"
                      type="number"
                      min="0"
                      value={formData.portfolioGold}
                      onChange={(e) => handleChange('portfolioGold', e.target.value)}
                      placeholder="35000"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-sans font-bold">Total Portfolio Net Worth:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">{formatINR(portfolioSum)}</span>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-6" />

            {/* Risk Baseline & Horizon */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Risk Baseline & Time Horizon
              </h3>

              <div className="space-y-4 text-xs">
                {/* Time Horizon */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    How long do you plan to keep your investments?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '<1 year', label: '⏱️ Less than 1 yr' },
                      { id: '1–3 years', label: '🗓️ 1–3 years' },
                      { id: '3–5 years', label: '🚀 3–5 years' },
                      { id: '5–10 years', label: '💎 5–10 years' },
                    ].map((item) => {
                      const active = formData.timeHorizon === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleChange('timeHorizon', item.id)}
                          className={`p-2.5 rounded-xl font-bold border transition text-center ${
                            active
                              ? 'bg-emerald-500 text-white border-emerald-500 font-extrabold'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 20% Drop Response */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Imagine your investment falls 20%. What would you most likely do?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'Invest more', label: '🚀 Buy more — I see it as an opportunity' },
                      { id: 'Hold', label: '🤝 Hold — I\'ll wait for recovery' },
                      { id: 'Sell some', label: '❓ I\'m not sure — I\'d want guidance' },
                      { id: 'Sell immediately', label: '🛑 Sell — I don\'t want further losses' },
                    ].map((item) => {
                      const active = formData.riskResponseFall20 === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleChange('riskResponseFall20', item.id)}
                          className={`p-3 rounded-xl font-bold border transition text-left ${
                            active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 font-extrabold'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Volatility Comfort Selector */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    How comfortable are you when your investments go up and down?
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'Low', label: '😌 Very Low' },
                      { id: 'Low', label: '🙂 Low' },
                      { id: 'Moderate', label: '😐 Moderate' },
                      { id: 'High', label: '😎 High' },
                      { id: 'High', label: '🚀 Very High' },
                    ].map((item, idx) => {
                      const active = formData.riskTolerance === item.id;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleChange('riskTolerance', item.id)}
                          className={`py-2 rounded-xl text-xs font-bold border transition text-center ${
                            active
                              ? 'bg-emerald-500 text-white border-emerald-500 font-extrabold'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-6" />

            {/* Financial Safety Toggle Cards */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Financial Safety & Insurance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => handleChange('hasHealthInsurance', !formData.hasHealthInsurance)}
                  className={`p-3.5 rounded-xl border font-bold transition flex items-center justify-between ${
                    formData.hasHealthInsurance
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>🩺 Health Insurance Coverage</span>
                  {formData.hasHealthInsurance ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="text-slate-400 text-[10px]">No</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('hasLifeInsurance', !formData.hasLifeInsurance)}
                  className={`p-3.5 rounded-xl border font-bold transition flex items-center justify-between ${
                    formData.hasLifeInsurance
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>🛡️ Term / Life Insurance Coverage</span>
                  {formData.hasLifeInsurance ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="text-slate-400 text-[10px]">No</span>}
                </button>
              </div>
            </div>

            {/* COMPACT SUMMARY REVIEW BLOCK */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-3 mt-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  You're ready to build your profile!
                </h4>
                <Badge variant="brand" className="text-[10px]">3-Step Onboarding Complete</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Income</span>
                  <span className="font-bold text-white">{formatINR(totalIncome)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Expenses</span>
                  <span className="font-bold text-white">{formatINR(totalExpenses)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Loan EMIs</span>
                  <span className="font-bold text-amber-400">{formatINR(monthlyEmis)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Portfolio</span>
                  <span className="font-bold text-emerald-400">{formatINR(portfolioSum)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Active Goals</span>
                  <span className="font-bold text-emerald-400">{formData.goals.length} selected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={ArrowLeft}
              onClick={handleBack}
            >
              ← Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={handleNext}
            >
              Continue →
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={saving}
              icon={Check}
              iconPosition="right"
              onClick={handleSubmit}
              className="shadow-lg shadow-emerald-500/25 text-sm font-extrabold"
            >
              {saving ? 'Saving Profile Changes...' : 'Save & Build Profile →'}
            </Button>
          )}
        </div>
      </Card>

      {/* HIGH-END SYNTHESIS LOADING OVERLAY */}
      {synthesizing && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-5 shadow-2xl shadow-emerald-500/20 animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">
            Synthesizing Your Financial Clarity Engine...
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            Parsing 3-step profile inputs, computing Debt-to-Income ratios, and building your personalized Financial Health Index.
          </p>

          <div className="w-full max-w-md h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700 shadow-inner">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 shadow-md shadow-emerald-500/50"
              style={{ width: `${synthesisProgress}%` }}
            />
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400 mt-3">
            {synthesisProgress}% Complete
          </span>
        </div>
      )}
    </div>
  );
}
