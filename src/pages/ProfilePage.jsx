import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Check, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-4xl mx-auto">
      <PageHeader
        title="User Profile & Investor Identity"
        subtitle="Manage personal baseline details, authenticated identity, and profile preferences."
        tag="Account"
      />

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
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

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdate} className="mt-6 space-y-4 max-w-md">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            required
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Authenticated Email (Read Only)"
            type="email"
            disabled
            icon={Mail}
            value={user?.email || ''}
            className="opacity-70 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={saving}
            icon={Save}
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="text-slate-400 block mb-1">Account Created</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Session'}
            </span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="text-slate-400 block mb-1">Authentication Method</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Supabase Secure Email Auth</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
