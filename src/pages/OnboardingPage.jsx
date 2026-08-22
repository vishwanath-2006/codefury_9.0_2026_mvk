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
  Loader2,
  Smartphone,
  Send,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { getFinancialProfile, saveFinancialProfile, createEmptyOnboardingData } from '../services/onboardingService';

export default function OnboardingPage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { updateProfile, refreshOnboardingState, setIsOnboarded } = useOnboarding();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stepParam = parseInt(searchParams.get('step'), 10);

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const currentUserIdRef = useRef(user?.id);

  // Form State initialized to clean empty structure
  const [formData, setFormData] = useState(() => createEmptyOnboardingData(user, profile));

  useEffect(() => {
    if (stepParam >= 1 && stepParam <= 3) {
      setCurrentStep(stepParam);
    }
  }, [stepParam]);

  // Load existing profile strictly for the authenticated user, or present fresh blank form
  useEffect(() => {
    currentUserIdRef.current = user?.id;
    let isMounted = true;

    async function fetchUserData() {
      if (authLoading) return;

      if (!user?.id) {
        if (isMounted) {
          setFormData(createEmptyOnboardingData());
          setLoadingProfile(false);
        }
        return;
      }

      setLoadingProfile(true);
      try {
        const saved = await getFinancialProfile(user.id);

        if (!isMounted || currentUserIdRef.current !== user.id) return;

        if (saved && (saved.onboarding_completed || saved.onboardingCompleted || saved.monthly_income != null || saved.monthlyIncome != null)) {
          setFormData({
            ...createEmptyOnboardingData(user, profile),
            user_id: user.id,
            fullName: saved.full_name || saved.fullName || profile?.full_name || user?.user_metadata?.full_name || '',
            age: saved.age ? String(saved.age) : '',
            employmentStatus: saved.employment_status || saved.employmentStatus || 'Employed',
            occupation: saved.occupation || '',
            dependents: saved.dependents != null ? String(saved.dependents) : '0',
            incomeStability: saved.income_stability || saved.incomeStability || 'Stable',
            monthlyIncome: saved.monthly_income != null ? String(saved.monthly_income) : (saved.monthlyIncome || ''),
            otherIncome: saved.other_income != null ? String(saved.other_income) : (saved.otherIncome || '0'),
            monthlyEssentialExpenses: saved.monthly_essential_expenses != null ? String(saved.monthly_essential_expenses) : (saved.monthlyEssentialExpenses || ''),
            monthlyDiscretionaryExpenses: saved.monthly_discretionary_expenses != null ? String(saved.monthly_discretionary_expenses) : (saved.monthlyDiscretionaryExpenses || ''),
            currentSavings: saved.current_savings != null ? String(saved.current_savings) : (saved.currentSavings || ''),
            emergencyFund: saved.emergency_fund != null ? String(saved.emergency_fund) : (saved.emergencyFund || ''),
            hasDebt: Boolean(saved.has_debt ?? saved.hasDebt),
            totalDebt: saved.total_debt != null ? String(saved.total_debt) : (saved.totalDebt || '0'),
            monthlyDebtPayments: saved.monthly_debt_payments != null ? String(saved.monthly_debt_payments) : (saved.monthlyDebtPayments || '0'),
            debtType: saved.debt_type || saved.debtType || 'Home',
            investmentExperience: saved.investment_experience || saved.investmentExperience || 'beginner',
            hasHealthInsurance: Boolean(saved.has_health_insurance ?? saved.hasHealthInsurance ?? true),
            hasLifeInsurance: Boolean(saved.has_life_insurance ?? saved.hasLifeInsurance ?? true),
            timeHorizon: saved.time_horizon || saved.timeHorizon || '5–10 years',
            riskTolerance: saved.risk_tolerance || saved.riskTolerance || 'Moderate',
            goals: Array.isArray(saved.goals) ? saved.goals : []
          });
        } else {
          // Fresh, unpopulated form for a new user
          setFormData(createEmptyOnboardingData(user, profile));
        }
      } catch (err) {
        console.error('Error loading onboarding profile:', err);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, profile, authLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Goal Helpers
  const handleAddGoal = (presetTitle = 'Custom Goal') => {
    const newGoal = {
      id: `g_${Date.now()}`,
      title: presetTitle,
      targetAmount: '',
      currentAmount: '',
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
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id)
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const exists = prev.investmentCategories.includes(category);
      const updated = exists
        ? prev.investmentCategories.filter((c) => c !== category)
        : [...prev.investmentCategories, category];
      return { ...prev, investmentCategories: updated, hasInvestments: updated.length > 0 };
    });
  };

  // OTP Countdown Timer Effect
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = () => {
    setErrorMsg('');
    setOtpError('');
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number before requesting OTP.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setUserOtpInput('');
    setResendTimer(30);
  };

  const handleVerifyOtp = () => {
    setOtpError('');
    if (!userOtpInput || userOtpInput.trim() !== generatedOtp) {
      setOtpError('Invalid OTP code entered. Please check your SMS notification and enter the correct 4-digit code.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      phoneVerified: true
    }));
    setOtpSent(false);
    setUserOtpInput('');
  };

  // Step Navigations
  const handleNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setErrorMsg('Please enter your full name to personalize your dashboard.');
        return;
      }
      if (!formData.age || parseInt(formData.age, 10) < 18) {
        setErrorMsg('Please enter a valid age (18 or older).');
        return;
      }
      if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile phone number.');
        return;
      }
      if (!formData.phoneVerified) {
        setErrorMsg('Please verify your mobile phone number with OTP to proceed.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) {
        setErrorMsg('Please provide your monthly take-home income.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(3, prev + 1));
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Submission
  const handleSubmit = async () => {
    setErrorMsg('');
    setSaving(true);

    try {
      if (!user?.id) {
        throw new Error('You must be signed in to save your financial profile.');
      }

      await updateProfile(formData, user.id);
      setIsOnboarded(true);

      if (refreshProfile) {
        await refreshProfile();
      }
      if (refreshOnboardingState) {
        await refreshOnboardingState();
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding submission:', err);
      setErrorMsg(err.message || 'Failed to submit profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Live Calculations for Preview Sidebar
  const incomeNum = parseFloat(formData.monthlyIncome) || 0;
  const otherIncomeNum = parseFloat(formData.otherIncome) || 0;
  const totalIncomeCalc = incomeNum + otherIncomeNum;

  const essentialNum = parseFloat(formData.monthlyEssentialExpenses) || 0;
  const discretionaryNum = parseFloat(formData.monthlyDiscretionaryExpenses) || 0;
  const totalExpensesCalc = essentialNum + discretionaryNum;

  const debtPaymentNum = formData.hasDebt ? parseFloat(formData.monthlyDebtPayments) || 0 : 0;
  const monthlySavingsCalc = Math.max(0, totalIncomeCalc - totalExpensesCalc - debtPaymentNum);
  const savingsRatePctCalc = totalIncomeCalc > 0 ? Math.round((monthlySavingsCalc / totalIncomeCalc) * 100) : 0;

  const emiRatioCalc = totalIncomeCalc > 0 ? Math.round((debtPaymentNum / totalIncomeCalc) * 100) : 0;
  const emergencyNum = parseFloat(formData.emergencyFund) || 0;
  const emergencyMonthsCalc = totalExpensesCalc > 0 ? (emergencyNum / totalExpensesCalc).toFixed(1) : '0.0';

  if (loadingProfile) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Loading your profile questionnaire...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Personalized Financial Blueprint"
        subtitle="Set up your verified income, monthly expenses, active goals, and risk parameters to generate an accurate diagnostic index."
        tag="Onboarding Wizard"
      />

      {/* STEP PROGRESS BAR */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { step: 1, title: '1. Identity & Details', icon: User },
          { step: 2, title: '2. Cash Flow & Debt', icon: Wallet },
          { step: 3, title: '3. Goals & Risk Profile', icon: Target }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                isActive
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : isDone
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold block">{s.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isDone ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
          {errorMsg}
        </div>
      )}

      {/* MAIN TWO-COLUMN CONTENT: FORM + LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: IDENTITY & PERSONAL DETAILS */}
          {currentStep === 1 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  Personal Information & Background
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your demographic info shapes the baseline actuarial benchmarks for health scores.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="fullName"
                    placeholder="e.g. Vicky Vishwanath"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="age"
                    type="number"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>

                {/* MOBILE PHONE NUMBER WITH OTP VERIFICATION */}
                <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                      Mobile Phone Number (OTP Authentication) <span className="text-rose-500">*</span>
                    </label>

                    {formData.phoneVerified && (
                      <Badge variant="success" className="font-mono text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified via OTP
                      </Badge>
                    )}
                  </div>

                  {formData.phoneVerified ? (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                        <span>Mobile Verified: <strong>{formData.phone}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, phoneVerified: false }))}
                        className="text-[11px] text-slate-500 hover:text-rose-500 underline font-semibold"
                      >
                        Change Number
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            name="phone"
                            placeholder="Enter 10-digit Mobile Number"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          icon={Send}
                          onClick={handleSendOtp}
                          className="bg-emerald-500 hover:bg-emerald-600 font-bold text-xs shrink-0"
                        >
                          {otpSent ? 'Resend OTP' : 'Send OTP'}
                        </Button>
                      </div>

                      {/* SMS SIMULATED OTP TOAST NOTIFICATION (Top-Right Screen Toast) */}
                      {otpSent && (
                        <>
                          {/* Floating Realistic Top-Right Mobile SMS Notification */}
                          <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 text-white p-4 rounded-2xl border border-emerald-500/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-300">
                            <div className="flex items-start justify-between pb-1.5 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                                  💬
                                </div>
                                <span className="text-[11px] font-extrabold tracking-tight text-slate-200">SMS Notification • FinLabs Auth</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
                            </div>
                            <div className="pt-2 text-xs leading-relaxed space-y-1">
                              <p className="text-slate-300 font-medium">
                                Your FinLabs verification OTP for <strong>+91 {formData.phone}</strong> is:
                              </p>
                              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-center font-mono font-extrabold text-lg text-emerald-400 tracking-widest my-1">
                                {generatedOtp}
                              </div>
                              <p className="text-[10px] text-slate-400">Valid for 5 minutes. Do not share this OTP with anyone.</p>
                            </div>
                          </div>

                          {/* Clean Form OTP Verification Box */}
                          <div className="space-y-3 pt-1 animate-in fade-in">
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              An OTP has been sent to <strong>+91 {formData.phone}</strong>. Check your phone notifications.
                            </p>

                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="Enter 4-digit OTP"
                                value={userOtpInput}
                                onChange={(e) => setUserOtpInput(e.target.value)}
                                className="w-40 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-sm tracking-widest font-bold focus:border-emerald-500 focus:outline-none"
                              />
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                icon={ShieldCheck}
                                onClick={handleVerifyOtp}
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs"
                              >
                                Verify OTP
                              </Button>
                              {resendTimer > 0 && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Resend in {resendTimer}s
                                </span>
                              )}
                            </div>

                            {otpError && (
                              <p className="text-xs text-rose-500 font-semibold">{otpError}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Employment Status</label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Employed">Salaried / Corporate</option>
                    <option value="Self-Employed">Self-Employed / Business</option>
                    <option value="Freelancer">Freelancer / Consultant</option>
                    <option value="Student">Student / Academic</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Occupation</label>
                  <Input
                    name="occupation"
                    placeholder="e.g. Software Engineer"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Financial Dependents</label>
                  <Input
                    name="dependents"
                    type="number"
                    placeholder="0"
                    value={formData.dependents}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Income Stability</label>
                  <select
                    name="incomeStability"
                    value={formData.incomeStability}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Stable">High / Predictable (Salaried)</option>
                    <option value="Variable">Moderate / Variable</option>
                    <option value="Highly Variable">Volatile / Project-based</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: CASH FLOW, SAVINGS & DEBT */}
          {currentStep === 2 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  Monthly Cash Flow, Savings & Liabilities
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Accurate income and expenses ensure realistic investment allocation and debt ratio checks.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Monthly Take-Home Salary (₹) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      name="monthlyIncome"
                      type="number"
                      placeholder="e.g. 75000"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Other Monthly Inflow / Secondary (₹)
                    </label>
                    <Input
                      name="otherIncome"
                      type="number"
                      placeholder="e.g. 0"
                      value={formData.otherIncome}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Essential Monthly Expenses (₹) (Rent, Bills, Food)
                    </label>
                    <Input
                      name="monthlyEssentialExpenses"
                      type="number"
                      placeholder="e.g. 30000"
                      value={formData.monthlyEssentialExpenses}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Discretionary Spending (₹) (Shopping, Dining, Subs)
                    </label>
                    <Input
                      name="monthlyDiscretionaryExpenses"
                      type="number"
                      placeholder="e.g. 7069"
                      value={formData.monthlyDiscretionaryExpenses}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Current Bank Savings & Liquid Cash (₹)
                    </label>
                    <Input
                      name="currentSavings"
                      type="number"
                      placeholder="e.g. 150000"
                      value={formData.currentSavings}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Dedicated Emergency Fund Reserve (₹)
                    </label>
                    <Input
                      name="emergencyFund"
                      type="number"
                      placeholder="e.g. 100000"
                      value={formData.emergencyFund}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Debt Toggle */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Do you have active loans or credit obligations?</span>
                      <span className="text-[11px] text-slate-400">Home loan, car EMI, education loan, or personal loan.</span>
                    </div>
                    <input
                      type="checkbox"
                      name="hasDebt"
                      checked={formData.hasDebt}
                      onChange={handleChange}
                      className="w-4 h-4 rounded-md text-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {formData.hasDebt && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Loan Balance (₹)</label>
                        <Input
                          name="totalDebt"
                          type="number"
                          placeholder="e.g. 1500000"
                          value={formData.totalDebt}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Monthly EMI Outflow (₹)</label>
                        <Input
                          name="monthlyDebtPayments"
                          type="number"
                          placeholder="e.g. 15000"
                          value={formData.monthlyDebtPayments}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Loan Type</label>
                        <select
                          name="debtType"
                          value={formData.debtType}
                          onChange={handleChange}
                          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        >
                          <option value="Home">Home Loan</option>
                          <option value="Education">Education Loan</option>
                          <option value="Vehicle">Auto / Vehicle</option>
                          <option value="Personal">Personal Loan</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* STEP 3: GOALS, RISK TOLERANCE & PREFERENCES */}
          {currentStep === 3 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Financial Goals & Risk Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure active milestones to receive automated monthly SIP targets and tailored fund allocations.
                </p>
              </div>

              {/* Goals List */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Active Financial Goals</span>
                  <Button variant="outline" size="xs" onClick={() => handleAddGoal()}>
                    + Add Custom Goal
                  </Button>
                </div>

                {formData.goals.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                    <p className="text-slate-400">No specific goals added yet.</p>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="xs" onClick={() => handleAddGoal('Home Down Payment')}>
                        + Add Home Down Payment
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleAddGoal('Emergency Fund Buffer')}>
                        + Add Emergency Fund
                      </Button>
                    </div>
                  </div>
                ) : (
                  formData.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Goal Title</span>
                        <input
                          type="text"
                          value={goal.title}
                          onChange={(e) => handleUpdateGoal(goal.id, 'title', e.target.value)}
                          className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Target (₹)</span>
                        <input
                          type="number"
                          value={goal.targetAmount}
                          onChange={(e) => handleUpdateGoal(goal.id, 'targetAmount', e.target.value)}
                          className="w-full bg-transparent font-mono text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                          placeholder="e.g. 500000"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved (₹)</span>
                        <input
                          type="number"
                          value={goal.currentAmount}
                          onChange={(e) => handleUpdateGoal(goal.id, 'currentAmount', e.target.value)}
                          className="w-full bg-transparent font-mono text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                          placeholder="e.g. 50000"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <select
                          value={goal.deadline}
                          onChange={(e) => handleUpdateGoal(goal.id, 'deadline', e.target.value)}
                          className="bg-transparent text-xs font-mono text-slate-600 dark:text-slate-300"
                        >
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="2030">2030</option>
                        </select>
                        <button
                          onClick={() => handleRemoveGoal(goal.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Risk Tolerance & Investment Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Risk Tolerance Persona
                    </label>
                    <select
                      name="riskTolerance"
                      value={formData.riskTolerance}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="Conservative">Conservative (Capital preservation priority)</option>
                      <option value="Moderate">Moderate (Balanced equity & debt growth)</option>
                      <option value="Aggressive">Aggressive (High equity allocation, max growth)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target Investment Horizon
                    </label>
                    <select
                      name="timeHorizon"
                      value={formData.timeHorizon}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="1–3 years">Short Term (1–3 years)</option>
                      <option value="3–5 years">Medium Term (3–5 years)</option>
                      <option value="5–10 years">Long Term (5–10 years)</option>
                      <option value="10+ years">Very Long Term (10+ years)</option>
                    </select>
                  </div>
                </div>

                {/* Insurance Checkboxes */}
                <div className="grid grid-cols-2 gap-4 pt-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasHealthInsurance"
                      checked={formData.hasHealthInsurance}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Health Insurance Active</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasLifeInsurance"
                      checked={formData.hasLifeInsurance}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Term Life Insurance Active</span>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            {currentStep > 1 ? (
              <Button variant="outline" size="sm" icon={ArrowLeft} onClick={handlePrev}>
                Previous Step
              </Button>
            ) : <div />}

            {currentStep < 3 ? (
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" onClick={handleNext}>
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                disabled={saving}
                onClick={handleSubmit}
                className="bg-emerald-500 hover:bg-emerald-600 font-bold px-8 shadow-lg shadow-emerald-500/20"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Blueprint...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Blueprint & Unlock Dashboard
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* SIDEBAR: LIVE COMPUTED FINANCIAL SNAPSHOT */}
        <div className="space-y-4">
          <Card className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Blueprint Index</span>
              <Badge variant="brand" className="text-[10px] font-mono">
                {formData.riskTolerance}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Monthly Cash Inflow:</span>
                <span className="font-mono font-bold text-slate-100">
                  ₹{totalIncomeCalc.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Monthly Outflow:</span>
                <span className="font-mono font-bold text-slate-100">
                  ₹{(totalExpensesCalc + debtPaymentNum).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-emerald-400 font-bold">Monthly Savings Surplus:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{monthlySavingsCalc.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Savings Rate:</span>
                <span className="font-mono font-bold text-slate-100">{savingsRatePctCalc}%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Emergency Buffer:</span>
                <span className="font-mono font-bold text-slate-100">{emergencyMonthsCalc} Mos</span>
              </div>

              {formData.hasDebt && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Debt-to-Income (DTI):</span>
                  <span className="font-mono font-bold text-amber-400">{emiRatioCalc}%</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
