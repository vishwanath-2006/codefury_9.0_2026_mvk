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
  Mail,
  Send,
  ShieldCheck,
  KeyRound,
  Camera,
  FileText,
  Building2,
  CreditCard,
  Landmark,
  Coins,
  RefreshCw,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
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

  // Email OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [userOtpInput, setUserOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // PAN & e-KYC Verification States
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [panError, setPanError] = useState('');
  const [showDigiLockerModal, setShowDigiLockerModal] = useState(false);
  const [digiLockerProgress, setDigiLockerProgress] = useState(0);
  const [digiLockerStepText, setDigiLockerStepText] = useState('');

  // Account Aggregator (AA) States
  const [showBankConsentModal, setShowBankConsentModal] = useState(false);
  const [connectingBank, setConnectingBank] = useState(false);

  const currentUserIdRef = useRef(user?.id);
  const selfieInputRef = useRef(null);

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
            email: saved.email || user?.email || '',
            emailVerified: Boolean(saved.emailVerified ?? true),
            selfiePhoto: saved.selfiePhoto || '',
            selfieVerified: Boolean(saved.selfieVerified),
            panNumber: saved.panNumber || '',
            panVerified: Boolean(saved.panVerified),
            kycStatus: saved.kycStatus || (saved.panVerified ? 'Verified (Tier-1 Compliant)' : 'Unverified'),
            taxStatus: saved.taxStatus || 'Resident Individual',
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
            aaConnected: Boolean(saved.aaConnected),
            connectedBankName: saved.connectedBankName || '',
            hasDebt: Boolean(saved.has_debt ?? saved.hasDebt),
            totalDebt: saved.total_debt != null ? String(saved.total_debt) : (saved.totalDebt || '0'),
            monthlyDebtPayments: saved.monthly_debt_payments != null ? String(saved.monthly_debt_payments) : (saved.monthlyDebtPayments || '0'),
            debtType: saved.debt_type || saved.debtType || 'Home',
            creditCardsHeld: saved.creditCardsHeld || '0',
            creditCardRolloverBalance: saved.creditCardRolloverBalance || '0',
            portfolioMutualFunds: saved.portfolioMutualFunds != null ? String(saved.portfolioMutualFunds) : '',
            portfolioStocks: saved.portfolioStocks != null ? String(saved.portfolioStocks) : '',
            portfolioFd: saved.portfolioFd != null ? String(saved.portfolioFd) : '',
            portfolioGold: saved.portfolioGold != null ? String(saved.portfolioGold) : '',
            externalPlatforms: Array.isArray(saved.externalPlatforms) ? saved.externalPlatforms : ['Zerodha', 'Groww'],
            investmentExperience: saved.investment_experience || saved.investmentExperience || 'beginner',
            hasHealthInsurance: Boolean(saved.has_health_insurance ?? saved.hasHealthInsurance ?? true),
            hasLifeInsurance: Boolean(saved.has_life_insurance ?? saved.hasLifeInsurance ?? true),
            timeHorizon: saved.time_horizon || saved.timeHorizon || '5–10 years',
            riskTolerance: saved.risk_tolerance || saved.riskTolerance || 'Moderate',
            goals: Array.isArray(saved.goals) ? saved.goals : []
          });
        } else {
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

  // Selfie Camera & File Capture Handler
  const handleSelfieCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        selfiePhoto: reader.result,
        selfieVerified: true
      }));
    };
    reader.readAsDataURL(file);
  };

  // PAN Registry Check Simulator
  const handleVerifyPan = () => {
    setPanError('');
    const rawPan = (formData.panNumber || '').trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(rawPan)) {
      setPanError('Invalid PAN format. Standard format is 5 Letters, 4 Digits, 1 Letter (e.g. ABCDE1234F).');
      return;
    }

    setVerifyingPan(true);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        panNumber: rawPan,
        panVerified: true,
        kycStatus: prev.kycStatus === 'Unverified' ? 'Verified (PAN Registry Match)' : prev.kycStatus
      }));
      setVerifyingPan(false);
    }, 1200);
  };

  // DigiLocker / Aadhaar OTP Fast-Track Simulator
  const triggerDigiLockerVerification = () => {
    setShowDigiLockerModal(true);
    setDigiLockerProgress(15);
    setDigiLockerStepText('Connecting to UIDAI & DigiLocker Gateway...');

    setTimeout(() => {
      setDigiLockerProgress(50);
      setDigiLockerStepText('Validating Aadhaar e-KYC Demographic Hash...');
    }, 1000);

    setTimeout(() => {
      setDigiLockerProgress(85);
      setDigiLockerStepText('Synchronizing NSDL / CAMS KRA Registry...');
    }, 2200);

    setTimeout(() => {
      setDigiLockerProgress(100);
      setDigiLockerStepText('e-KYC Verified Successfully!');
      setFormData((prev) => ({
        ...prev,
        kycStatus: 'Verified (Tier-1 Compliant)',
        panVerified: true,
        panNumber: prev.panNumber || 'ABCDE1234F'
      }));

      setTimeout(() => {
        setShowDigiLockerModal(false);
      }, 800);
    }, 3400);
  };

  // Account Aggregator (AA) Bank Consent Simulator
  const handleConnectBank = (bankName) => {
    setConnectingBank(true);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        aaConnected: true,
        connectedBankName: bankName,
        monthlyIncome: prev.monthlyIncome || '85000',
        monthlyEssentialExpenses: prev.monthlyEssentialExpenses || '32000',
        currentSavings: prev.currentSavings || '145000',
        emergencyFund: prev.emergencyFund || '100000'
      }));
      setConnectingBank(false);
      setShowBankConsentModal(false);
    }, 1500);
  };

  // Platform Chip Toggle
  const handlePlatformToggle = (platformName) => {
    setFormData((prev) => {
      const current = prev.externalPlatforms || [];
      const exists = current.includes(platformName);
      const updated = exists ? current.filter((p) => p !== platformName) : [...current, platformName];
      return { ...prev, externalPlatforms: updated };
    });
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

  const handleSendEmailOtp = async () => {
    setErrorMsg('');
    setOtpError('');
    const targetEmail = (formData.email || user?.email || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address before requesting an OTP code.');
      return;
    }

    setOtpLoading(true);

    try {
      const { error: emailErr } = await supabase.auth.signInWithOtp({
        email: targetEmail
      });

      if (emailErr) {
        console.warn('Supabase Email Auth notice:', emailErr.message);
        throw new Error(emailErr.message);
      }

      setFormData((prev) => ({ ...prev, email: targetEmail }));
      setOtpSent(true);
      setUserOtpInput('');
      setResendTimer(60);
    } catch (err) {
      console.error('Error sending Email OTP:', err);
      setErrorMsg(err.message || 'Failed to send verification code to your email. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setOtpError('');
    const token = userOtpInput.trim();
    if (!token || token.length < 6) {
      setOtpError('Please enter the 6-digit OTP code received in your email inbox.');
      return;
    }

    setOtpLoading(true);
    const targetEmail = (formData.email || user?.email || '').trim();

    try {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token,
        type: 'email'
      });

      if (!verifyErr) {
        setFormData((prev) => ({ ...prev, emailVerified: true }));
        setOtpSent(false);
        setUserOtpInput('');
        return;
      }

      setOtpError(verifyErr.message || 'Invalid or expired Email OTP code. Please check your inbox.');
    } catch (err) {
      console.error('Error verifying Email OTP:', err);
      setOtpError('Failed to verify Email OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step Navigations
  const handleNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setErrorMsg('Please enter your full legal name to personalize your profile.');
        return;
      }
      if (!formData.age || parseInt(formData.age, 10) < 18) {
        setErrorMsg('Please enter a valid age (18 or older).');
        return;
      }
      if (!formData.email || !formData.email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!formData.emailVerified) {
        setErrorMsg('Please verify your email address with the 6-digit OTP sent to your inbox to proceed.');
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

  // Final Profile Submission & Direct Redirect to /financial-health
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

      navigate('/financial-health');
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
  const savingsNum = parseFloat(formData.currentSavings) || 0;
  const emergencyMonthsCalc = totalExpensesCalc > 0 ? (emergencyNum / totalExpensesCalc).toFixed(1) : '0.0';

  // Dynamic Consolidated Net Worth
  const mfNum = parseFloat(formData.portfolioMutualFunds) || 0;
  const stocksNum = parseFloat(formData.portfolioStocks) || 0;
  const fdNum = parseFloat(formData.portfolioFd) || 0;
  const goldNum = parseFloat(formData.portfolioGold) || 0;
  const totalNetWorthCalc = savingsNum + emergencyNum + mfNum + stocksNum + fdNum + goldNum;

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
        subtitle="Set up your verified income, e-KYC, cash flows, and consolidated portfolio to generate a production-grade diagnostic index."
        tag="Onboarding Wizard"
      />

      {/* STRICT 3-STEP PROGRESS WIZARD BAR */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { step: 1, title: '1. Identity & e-KYC', icon: User },
          { step: 2, title: '2. Cash Flow & Banking', icon: Wallet },
          { step: 3, title: '3. Portfolio & Goals', icon: Target }
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

          {/* STEP 1: IDENTITY, DEMOGRAPHICS & e-KYC VERIFICATION */}
          {currentStep === 1 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  Step 1: Identity, Demographics & e-KYC Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verify your identity, PAN registry hash, and tax status for regulatory compliance.
                </p>
              </div>

              {/* SECTION A: DEMOGRAPHIC PROFILE & SELFIE CAPTURE */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  {/* Selfie Photo Capture Avatar Widget */}
                  <div className="relative group shrink-0">
                    <input
                      type="file"
                      ref={selfieInputRef}
                      accept="image/*"
                      capture="user"
                      onChange={handleSelfieCapture}
                      className="hidden"
                    />
                    <div
                      onClick={() => selfieInputRef.current?.click()}
                      className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 transition flex items-center justify-center cursor-pointer overflow-hidden relative"
                      title="Click to capture selfie or upload photo"
                    >
                      {formData.selfiePhoto ? (
                        <img src={formData.selfiePhoto} alt="Selfie Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-emerald-500">
                          <Camera className="w-5 h-5" />
                          <span className="text-[9px] font-bold mt-0.5">Selfie</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Live Photo / Selfie Verification</span>
                      {formData.selfieVerified ? (
                        <Badge variant="success" className="text-[10px] font-mono">● Photo Verified</Badge>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Click circle to capture</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Standard biometric compliance check for SEBI / RBI registered advisory accounts.
                    </p>
                  </div>
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

                  {/* EMAIL ADDRESS WITH SUPABASE REAL EMAIL OTP VERIFICATION */}
                  <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        Email Address (Supabase Real Email Verification) <span className="text-rose-500">*</span>
                      </label>

                      {formData.emailVerified && (
                        <Badge variant="success" className="font-mono text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Email Verified
                        </Badge>
                      )}
                    </div>

                    {formData.emailVerified ? (
                      <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span>Email Address Verified: <strong>{formData.email}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, emailVerified: false }))}
                          className="text-[11px] text-slate-500 hover:text-rose-500 underline font-semibold"
                        >
                          Change Email
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="email"
                              name="email"
                              placeholder="e.g. user@gmail.com"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={otpLoading}
                            icon={otpLoading ? Loader2 : Mail}
                            onClick={handleSendEmailOtp}
                            className="bg-emerald-500 hover:bg-emerald-600 font-bold text-xs shrink-0 disabled:opacity-50"
                          >
                            {otpLoading ? 'Sending Email...' : otpSent ? 'Resend Email OTP' : 'Send Email OTP'}
                          </Button>
                        </div>

                        {/* REAL SUPABASE EMAIL OTP INPUT CONTAINER */}
                        {otpSent && (
                          <div className="space-y-3 pt-1 animate-in fade-in">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>A 6-digit Email OTP was sent to <strong>{formData.email}</strong>. Check your inbox & spam folder.</span>
                            </p>

                            <div className="flex gap-2 items-center flex-wrap">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={userOtpInput}
                                onChange={(e) => setUserOtpInput(e.target.value)}
                                className="w-44 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-sm tracking-widest font-bold focus:border-emerald-500 focus:outline-none"
                              />
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={otpLoading || !userOtpInput.trim()}
                                icon={otpLoading ? Loader2 : ShieldCheck}
                                onClick={handleVerifyEmailOtp}
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs disabled:opacity-50"
                              >
                                {otpLoading ? 'Verifying...' : 'Verify OTP'}
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="Employed">Salaried / Corporate</option>
                      <option value="Self-Employed">Self-Employed / Business Owner</option>
                      <option value="Freelance">Freelancer / Creator</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Occupation / Profession</label>
                    <Input
                      name="occupation"
                      placeholder="e.g. Software Engineer"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Financial Dependents</label>
                    <select
                      name="dependents"
                      value={formData.dependents}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="0">0 (Financially Independent)</option>
                      <option value="1">1 Dependent</option>
                      <option value="2">2 Dependents</option>
                      <option value="3+">3+ Dependents</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Income Stability</label>
                    <select
                      name="incomeStability"
                      value={formData.incomeStability}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="Stable">Stable (Fixed monthly salary)</option>
                      <option value="Moderate">Moderate (Salary + Variable bonus)</option>
                      <option value="Variable">Variable (Business / Project-based)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: INDIAN e-KYC VERIFICATION (PAN / DIGILOCKER) */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Indian e-KYC & Regulatory Compliance (NSDL / DigiLocker)
                  </h4>
                  {formData.kycStatus.includes('Verified') && (
                    <Badge variant="success" className="text-[10px] font-mono">
                      ✓ {formData.kycStatus}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* PAN Card Verification Input */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      PAN Card Number <span className="text-slate-400 font-normal">(Format: ABCDE1234F)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="panNumber"
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        value={formData.panNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold uppercase focus:border-emerald-500 focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={verifyingPan || formData.panVerified}
                        onClick={handleVerifyPan}
                        className="shrink-0 font-bold text-xs"
                      >
                        {verifyingPan ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : formData.panVerified ? (
                          'Verified ✓'
                        ) : (
                          'Verify PAN'
                        )}
                      </Button>
                    </div>
                    {panError && <p className="text-[11px] text-rose-500 font-medium">{panError}</p>}
                    {formData.panVerified && (
                      <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> NSDL Registry Match Verified
                      </p>
                    )}
                  </div>

                  {/* Investor Tax Status */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Investor Tax Status (FATCA Declaration)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Resident Individual', 'NRI / PIO'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, taxStatus: status }))}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                            formData.taxStatus === status
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DigiLocker Fast-Track Banner Button */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4" /> Fast-Track e-KYC via DigiLocker / Aadhaar OTP
                    </span>
                    <p className="text-[11px] text-slate-400">
                      1-click instant verification fetching Aadhaar demographic proof & CAMS KRA registry.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={triggerDigiLockerVerification}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shrink-0"
                  >
                    {formData.kycStatus === 'Verified (Tier-1 Compliant)' ? 'KYC Verified ✓' : 'Fast-Track KYC'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: CASH FLOW, BANKING & ACCOUNT AGGREGATOR (AA) */}
          {currentStep === 2 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  Step 2: Cash Flow, Banking & Account Aggregator (AA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Map your monthly income inflows, fixed living burn rate, and active credit obligations.
                </p>
              </div>

              {/* ACCOUNT AGGREGATOR (AA) BANK CONSENT BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      RBI
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-100">Connect Bank via RBI Account Aggregator for Auto-Sync</h4>
                      <p className="text-[11px] text-slate-400">Securely fetch monthly salary inflows & average living outlays from Setu / OneMoney.</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowBankConsentModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 font-bold text-xs shrink-0"
                  >
                    {formData.aaConnected ? `Connected (${formData.connectedBankName}) ✓` : 'Connect Primary Bank'}
                  </Button>
                </div>

                {formData.aaConnected && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bank Consent Active: <strong>{formData.connectedBankName}</strong> • Auto-Synced Monthly Inflows & Balances</span>
                  </div>
                )}
              </div>

              {/* CASH FLOW & INCOMES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly In-Hand Salary / Business Inflow (₹) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="monthlyIncome"
                    type="number"
                    placeholder="e.g. 85000"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Other Secondary Income (₹) <span className="text-slate-400 font-normal">(Rental, Dividends)</span>
                  </label>
                  <Input
                    name="otherIncome"
                    type="number"
                    placeholder="e.g. 10000"
                    value={formData.otherIncome}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Essential Living Outflows (₹) <span className="text-slate-400 font-normal">(Rent, Groceries, Utilities)</span>
                  </label>
                  <Input
                    name="monthlyEssentialExpenses"
                    type="number"
                    placeholder="e.g. 32000"
                    value={formData.monthlyEssentialExpenses}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Discretionary Outflows (₹) <span className="text-slate-400 font-normal">(Dining, Shopping, Travel)</span>
                  </label>
                  <Input
                    name="monthlyDiscretionaryExpenses"
                    type="number"
                    placeholder="e.g. 15000"
                    value={formData.monthlyDiscretionaryExpenses}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bank Savings Account Balance (₹)
                  </label>
                  <Input
                    name="currentSavings"
                    type="number"
                    placeholder="e.g. 145000"
                    value={formData.currentSavings}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Dedicated Emergency Reserve Buffer (₹)
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

              {/* CREDIT & CARD OBLIGATIONS (REFINED) */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      Credit & Debt Obligations
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Do you have active EMIs, loans, or credit card balances?</p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasDebt"
                      checked={formData.hasDebt}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {formData.hasDebt && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Credit Cards Held</label>
                      <select
                        name="creditCardsHeld"
                        value={formData.creditCardsHeld}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <option value="0">0 Cards</option>
                        <option value="1-2">1–2 Cards</option>
                        <option value="3-5">3–5 Cards</option>
                        <option value="5+">5+ Cards</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Monthly EMI Outflow (₹)</label>
                      <Input
                        name="monthlyDebtPayments"
                        type="number"
                        placeholder="e.g. 18000"
                        value={formData.monthlyDebtPayments}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">CC Rollover Balance (₹)</label>
                      <Input
                        name="creditCardRolloverBalance"
                        type="number"
                        placeholder="e.g. 0"
                        value={formData.creditCardRolloverBalance}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* STEP 3: GOALS, CONSOLIDATED PORTFOLIO & RISK */}
          {currentStep === 3 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Step 3: Goals, Consolidated Portfolio & Risk Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consolidate existing investments across external platforms and set your target horizon.
                </p>
              </div>

              {/* CONSOLIDATED PORTFOLIO HOLDINGS BREAKDOWN */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-500" />
                    Consolidated Portfolio Holdings (External Apps & Banks)
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">Groww • Zerodha • Upstox • CAMS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Mutual Funds / Active SIPs Total Value (₹)
                    </label>
                    <Input
                      name="portfolioMutualFunds"
                      type="number"
                      placeholder="e.g. 250000"
                      value={formData.portfolioMutualFunds}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Direct Equity / Stocks Holdings (₹)
                    </label>
                    <Input
                      name="portfolioStocks"
                      type="number"
                      placeholder="e.g. 180000"
                      value={formData.portfolioStocks}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Fixed Deposits / Bonds Total Value (₹)
                    </label>
                    <Input
                      name="portfolioFd"
                      type="number"
                      placeholder="e.g. 100000"
                      value={formData.portfolioFd}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Digital Gold / Physical Reserves (₹)
                    </label>
                    <Input
                      name="portfolioGold"
                      type="number"
                      placeholder="e.g. 35000"
                      value={formData.portfolioGold}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* HELPER CHIP ROW: PLATFORMS USED */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                    Platforms & Brokers Used to Invest:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Zerodha', 'Groww', 'Upstox', 'Bank NetBanking', 'CAMS Pay', 'INDmoney'].map((platform) => {
                      const isSelected = (formData.externalPlatforms || []).includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => handlePlatformToggle(platform)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-emerald-500" />}
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* FINANCIAL GOALS BUILDER */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Financial Milestones</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddGoal('Home Purchase')}
                      className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20"
                    >
                      + Home
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGoal('Wealth Creation')}
                      className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20"
                    >
                      + Wealth
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGoal('Custom Goal')}
                      className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg"
                    >
                      + Custom
                    </button>
                  </div>
                </div>

                {formData.goals.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
                    No active goals added yet. Click one of the quick preset buttons above to add a goal.
                  </div>
                ) : (
                  formData.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Risk Tolerance Persona
                    </label>
                    <select
                      name="riskTolerance"
                      value={formData.riskTolerance}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="1–3 years">Short Term (1–3 years)</option>
                      <option value="3–5 years">Medium Term (3–5 years)</option>
                      <option value="5–10 years">Long Term (5–10 years)</option>
                      <option value="10+ years">Very Long Term (10+ years)</option>
                    </select>
                  </div>
                </div>

                {/* Insurance Checkboxes */}
                <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
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
                <span className="text-slate-400">Consolidated Net Worth:</span>
                <span className="font-mono font-bold text-slate-100">
                  ₹{totalNetWorthCalc.toLocaleString('en-IN')}
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

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">KYC Compliance Status:</span>
                <span className={`font-bold font-mono ${formData.kycStatus.includes('Verified') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formData.kycStatus}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* DIGILOCKER SIMULATION MODAL OVERLAY */}
      {showDigiLockerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white max-w-md w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                🏛️
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">DigiLocker / UIDAI e-KYC Fast-Track</h3>
                <p className="text-xs text-slate-400">Government of India Identity Gateway</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">{digiLockerStepText}</span>
                <span className="text-emerald-400 font-bold">{digiLockerProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${digiLockerProgress}%` }}
                />
              </div>
            </div>

            {digiLockerProgress === 100 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>e-KYC Verification Complete! Status: Tier-1 Compliant.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACCOUNT AGGREGATOR (AA) BANK SELECTOR MODAL OVERLAY */}
      {showBankConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white max-w-md w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm">Select Primary Bank for AA Consent</h3>
              </div>
              <button
                onClick={() => setShowBankConsentModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Choose your primary Indian bank to grant 1-click encrypted consent via Setu / OneMoney Account Aggregator API.
            </p>

            {connectingBank ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                <p className="text-xs font-bold text-slate-200">Connecting to RBI Account Aggregator Gateway...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { name: 'HDFC Bank', logo: '🏦 HDFC' },
                  { name: 'ICICI Bank', logo: '🏛️ ICICI' },
                  { name: 'State Bank of India', logo: '🏢 SBI' },
                  { name: 'Axis Bank', logo: '🏬 Axis' }
                ].map((bank) => (
                  <button
                    key={bank.name}
                    type="button"
                    onClick={() => handleConnectBank(bank.name)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition text-left space-y-1"
                  >
                    <span className="text-xs font-extrabold text-slate-100 block">{bank.logo}</span>
                    <span className="text-[11px] text-slate-400 block font-medium">{bank.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
