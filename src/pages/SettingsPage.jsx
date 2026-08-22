import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Moon,
  Sun,
  Lock,
  Smartphone,
  Laptop,
  Save,
  CheckCircle2,
  AlertCircle,
  SmartphoneNfc,
  Eye,
  RefreshCw,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { formData, updateProfile, resetToOverview } = useOnboarding();
  const { theme, setTheme } = useTheme();

  // Save Success State
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 1. Profile States
  const [fullName, setFullName] = useState(formData.fullName || profile?.full_name || 'Manoj Kumar');
  const [phone, setPhone] = useState('+91 98765 43210');
  const email = user?.email || 'milanakn87@gmail.com';

  // 2. Appearance & Theme States
  const [compactLayout, setCompactLayout] = useState(false);
  const [currency, setCurrency] = useState('INR');

  // 3. Security & Login States
  const [twoFactor, setTwoFactor] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  // 4. Notification States
  const [emailDigest, setEmailDigest] = useState('weekly');
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [priceMovementAlerts, setPriceMovementAlerts] = useState(true);
  const [orderConfirmationAlerts, setOrderConfirmationAlerts] = useState(true);

  // 5. Investment & App Preferences
  const [defaultPage, setDefaultPage] = useState('/dashboard');
  const [orderConfirmPopup, setOrderConfirmPopup] = useState(true);
  const [riskWarningPopup, setRiskWarningPopup] = useState(true);

  // Theme Switcher Handler
  const handleThemeChange = (mode) => {
    setTheme(mode);
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      ...formData,
      fullName
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Save Password Handler
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPassSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPassSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto py-2 pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage your personal profile, security details, app themes, and notifications in one simple vertical view."
        tag="Account Settings"
      />

      {/* SAVE FEEDBACK BANNER */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Your settings have been saved successfully!</span>
        </div>
      )}

      {/* SECTION 1: PROFILE & ACCOUNT DETAILS */}
      <Card className="p-6 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold">Profile & Account</CardTitle>
              <CardDescription>Your personal details and identity verification status</CardDescription>
            </div>
          </div>
          <Badge variant="success" className="font-semibold text-xs px-2.5 py-1">
            ● KYC Verified
          </Badge>
        </CardHeader>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Mobile Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 Phone Number"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Primary Account Type</label>
              <input
                type="text"
                disabled
                value="Individual Resident Investor"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md" icon={Save} className="bg-emerald-500 hover:bg-emerald-600 font-bold">
              Save Profile Details
            </Button>
          </div>
        </form>
      </Card>

      {/* SECTION 2: APP THEME & DISPLAY PREFERENCES */}
      <Card className="p-6 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold">App Appearance & Theme</CardTitle>
            <CardDescription>Customize colors, dark mode, and interface display density</CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-5 text-xs font-semibold">
          {/* Theme Selector */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-2 font-bold">Color Theme</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Light Theme</h4>
                  <p className="text-[11px] text-slate-400 font-normal">Clean bright background</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Dark Theme</h4>
                  <p className="text-[11px] text-slate-400 font-normal">Sleek dark interface</p>
                </div>
              </button>
            </div>
          </div>

          {/* Currency Display */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Reporting Currency</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Currency symbol used across market charts & portfolio</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:border-emerald-500"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* SECTION 3: SECURITY & LOGIN */}
      <Card className="p-6 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold">Security & Login</CardTitle>
            <CardDescription>Password management, two-factor authentication, and connected devices</CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-6 text-xs font-semibold">
          {/* Two Factor Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA)</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Ask for an OTP / Authenticator code on login</p>
            </div>
            <button
              type="button"
              onClick={() => setTwoFactor(!twoFactor)}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                twoFactor
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {twoFactor ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              Change Password
            </h4>

            {passSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                Password updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="outline" size="sm" className="font-bold">
                Update Password
              </Button>
            </div>
          </form>

          {/* Active Devices */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Logged-in Devices</h4>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Windows PC — Chrome Web Browser</p>
                  <p className="text-[10px] text-slate-400">Current Session · Active Now</p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 4: NOTIFICATIONS & ALERTS */}
      <Card className="p-6 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold">Notifications & Alerts</CardTitle>
            <CardDescription>Choose how and when you receive market updates & investment emails</CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-4 text-xs font-semibold">
          {/* Notification Option 1 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Email Digest Summary</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Receive periodic financial summary reports via email</p>
            </div>
            <select
              value={emailDigest}
              onChange={(e) => setEmailDigest(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:border-emerald-500"
            >
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Digest</option>
              <option value="monthly">Monthly Report</option>
              <option value="none">Disabled</option>
            </select>
          </div>

          {/* Notification Option 2 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Market Price Alerts</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Get notified when stock / mutual fund prices change drastically</p>
            </div>
            <input
              type="checkbox"
              checked={marketAlerts}
              onChange={(e) => setMarketAlerts(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
            />
          </div>

          {/* Notification Option 3 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">SIP & Investment Due Reminders</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Remind me 3 days before upcoming monthly SIP debits</p>
            </div>
            <input
              type="checkbox"
              checked={orderConfirmationAlerts}
              onChange={(e) => setOrderConfirmationAlerts(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
            />
          </div>
        </div>
      </Card>

      {/* SECTION 5: TRADING & INVESTMENT PREFERENCES */}
      <Card className="p-6 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold">Investment Preferences</CardTitle>
            <CardDescription>Default landing view, trade prompts, and risk safety confirmation popups</CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-4 text-xs font-semibold">
          {/* Preference 1 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Default Home View</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">First page shown when you launch the app</p>
            </div>
            <select
              value={defaultPage}
              onChange={(e) => setDefaultPage(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:border-emerald-500"
            >
              <option value="/dashboard">Market Dashboard</option>
              <option value="/overview">Personal Finance Overview</option>
              <option value="/portfolio">My Portfolio</option>
            </select>
          </div>

          {/* Preference 2 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Order Confirmation Popup</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Show confirmation popups before placing buy / sell orders</p>
            </div>
            <input
              type="checkbox"
              checked={orderConfirmPopup}
              onChange={(e) => setOrderConfirmPopup(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
            />
          </div>

          {/* Preference 3 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Risk Disclosure Warnings</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Display SEBI / Market volatility disclaimers when investing</p>
            </div>
            <input
              type="checkbox"
              checked={riskWarningPopup}
              onChange={(e) => setRiskWarningPopup(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
