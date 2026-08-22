import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Database,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Save,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { formData, updateProfile, resetToOverview } = useOnboarding();
  const [activeTab, setActiveTab] = useState('profile');

  // Success Feedback Toast State
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form States
  const [fullName, setFullName] = useState(formData.fullName || profile?.full_name || 'Manoj');
  const [occupation, setOccupation] = useState(formData.occupation || 'Software Engineer');
  const [cityTier, setCityTier] = useState(formData.cityTier || 'Tier 1 Metro');
  const [phone, setPhone] = useState('+91 98765 43210');

  // Security States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notification States
  const [digestFreq, setDigestFreq] = useState('weekly');
  const [emergencyAlert, setEmergencyAlert] = useState(true);
  const [debtAlert, setDebtAlert] = useState(true);
  const [rebalanceAlert, setRebalanceAlert] = useState(true);

  // Engine Preferences States
  const [cagrRate, setCagrRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [targetRunwayMonths, setTargetRunwayMonths] = useState(6);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      ...formData,
      fullName,
      occupation,
      cityTier
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `finlabs_financial_profile_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Identity', icon: User },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
    { id: 'engine', label: 'Engine Preferences', icon: Sliders },
    { id: 'privacy', label: 'Data & Privacy', icon: Database },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto py-2">
      <PageHeader
        title="Enterprise Settings Center"
        subtitle="Manage account credentials, security standards, notification triggers, and financial engine calculation models."
        tag="System Controls"
      />

      {/* SAVE SUCCESS BANNER */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Settings changes saved successfully and synced with your persistent baseline!</span>
        </div>
      )}

      {/* HORIZONTAL TAB SELECTOR */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto custom-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/5 border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & IDENTITY */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Profile & Identity Details
              </CardTitle>
              <CardDescription>Personal identification credentials and demographic markers</CardDescription>
            </div>
            <Badge variant="success" className="font-mono text-xs">
              ● Supabase Verified
            </Badge>
          </CardHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'milanakn87@gmail.com'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">City Tier / Location</label>
                <select
                  value={cityTier}
                  onChange={(e) => setCityTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Tier 1 Metro">Tier 1 Metro (Mumbai, BLR, NCR)</option>
                  <option value="Tier 2 City">Tier 2 City (Pune, Ahmedabad, Jaipur)</option>
                  <option value="Tier 3 / Regional">Tier 3 / Regional Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Reporting Currency</label>
                <input
                  type="text"
                  disabled
                  value="INR (₹) — Indian Rupee"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="md" icon={Save} className="bg-emerald-500 hover:bg-emerald-600 font-bold">
                Save Profile Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: SECURITY & AUTHENTICATION */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Two-Factor Authentication (2FA)
                </CardTitle>
                <CardDescription>Add an extra layer of biometric security to your financial data</CardDescription>
              </div>
              <Badge variant={twoFactorEnabled ? 'success' : 'warning'} className="font-mono text-xs">
                {twoFactorEnabled ? '● 2FA Active' : 'Disabled'}
              </Badge>
            </CardHeader>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Authenticator App (TOTP)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use Google Authenticator or Authy for secure single-use codes</p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  twoFactorEnabled
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}
              </button>
            </div>
          </Card>

          {/* ACTIVE SESSIONS */}
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Laptop className="w-5 h-5 text-emerald-500" />
                Active Sessions & Connected Devices
              </CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">Chrome on Windows 11 (Current Device)</h5>
                    <p className="text-[10px] text-slate-400 font-mono">IP: 103.45.12.98 · Active Now</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Current Session</Badge>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">FinLabs iOS App</h5>
                    <p className="text-[10px] text-slate-400 font-mono">iPhone 15 Pro · 2 hours ago</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold text-rose-500 hover:underline">Revoke</button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS & ALERTS */}
      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Financial Warning Alerts & Triggers
            </CardTitle>
            <CardDescription>Configure automated thresholds for health, debt, and portfolio warnings</CardDescription>
          </CardHeader>

          <div className="space-y-4 text-xs font-semibold">
            {/* Alert 1: Emergency Buffer */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Emergency Buffer Alert</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Notify immediately if liquid reserve runway drops below 3 months</p>
              </div>
              <input
                type="checkbox"
                checked={emergencyAlert}
                onChange={(e) => setEmergencyAlert(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Alert 2: Debt Ratio */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">High Debt-to-Income (DTI) Warning</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Trigger amber warning if total monthly loan EMIs exceed 30% of income</p>
              </div>
              <input
                type="checkbox"
                checked={debtAlert}
                onChange={(e) => setDebtAlert(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Alert 3: Rebalancing Alert */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Portfolio Rebalancing Trigger</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Alert if actual equity allocation deviates &gt; 20% from PRQ target</p>
              </div>
              <input
                type="checkbox"
                checked={rebalanceAlert}
                onChange={(e) => setRebalanceAlert(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: ENGINE PREFERENCES */}
      {activeTab === 'engine' && (
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              Financial Calculation Model Preferences
            </CardTitle>
            <CardDescription>Adjust baseline returns, inflation models, and target runway parameters</CardDescription>
          </CardHeader>

          <div className="space-y-5 text-xs font-semibold">
            {/* Preference 1: CAGR Rate */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-900 dark:text-slate-100">Default CAGR Compounding Rate</label>
                <span className="font-mono font-extrabold text-emerald-500 text-sm">{cagrRate}% Annual</span>
              </div>
              <input
                type="range"
                min="8"
                max="18"
                value={cagrRate}
                onChange={(e) => setCagrRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-slate-400">Used for forward wealth projections in SIP & Goal Simulators.</p>
            </div>

            {/* Preference 2: Inflation Rate */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-900 dark:text-slate-100">Expected Inflation Rate Adjustment</label>
                <span className="font-mono font-extrabold text-indigo-500 text-sm">{inflationRate}% Annual</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[10px] text-slate-400">Adjusts target corpus calculations for future goal purchasing power.</p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: DATA & PRIVACY */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  Supabase Cloud Persistence Sync
                </CardTitle>
                <CardDescription>Backend URL: https://laqhsduhrnneutijqdaw.supabase.co</CardDescription>
              </div>
              <Badge variant="success">Active Sync</Badge>
            </CardHeader>

            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Your financial profile, questionnaire data, and calculated health metrics are fully encrypted and synchronized in real time.
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Export Complete Financial Record</h5>
                <p className="text-[10px] text-slate-400">Download your raw questionnaire data in JSON format</p>
              </div>
              <Button variant="outline" size="sm" icon={Download} onClick={handleExportData} className="font-bold">
                Export JSON
              </Button>
            </div>
          </Card>

          {/* DANGER ZONE */}
          <Card className="p-6 border-rose-500/30 bg-rose-500/5 space-y-4">
            <h4 className="font-extrabold text-sm text-rose-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Reset Local Baseline
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Clear your local baseline state to restart the 3-step questionnaire from scratch.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={resetToOverview}
              className="border-rose-500/40 text-rose-500 hover:bg-rose-500/10 font-bold"
            >
              Reset Onboarding Baseline
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
