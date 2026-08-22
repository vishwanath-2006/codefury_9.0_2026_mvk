import React, { useState, useEffect } from 'react';
import { PieChart, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNormalizedFinancialProfile } from '../../services/onboardingService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export default function PortfolioOverviewWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [normProfile, setNormProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (user?.id) {
        const data = await getNormalizedFinancialProfile(user.id);
        if (mounted) setNormProfile(data);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const isCompleted = Boolean(normProfile?.onboardingCompleted);
  const totalSavings = normProfile?.currentSavings ?? 0;

  const allocationItems = isCompleted && totalSavings > 0 ? [
    { name: 'Mutual Funds (SIP)', percentage: 55, value: totalSavings * 0.55, color: '#10B981' },
    { name: 'Direct Equity Stocks', percentage: 30, value: totalSavings * 0.30, color: '#3B82F6' },
    { name: 'Liquid & Fixed Reserve', percentage: 15, value: totalSavings * 0.15, color: '#6366F1' },
  ] : [];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-500" />
            Portfolio Asset Allocation
          </CardTitle>
          <CardDescription>
            {isCompleted ? 'Dynamic allocation derived from verified user savings' : 'Allocation locked — requires completed onboarding'}
          </CardDescription>
        </div>
        <button
          onClick={() => navigate('/portfolio')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Manage Asset Classes →
        </button>
      </CardHeader>

      <CardContent>
        {isCompleted && allocationItems.length > 0 ? (
          <>
            {/* Visual Allocation Segment Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-4 bg-slate-100 dark:bg-slate-800">
              {allocationItems.map((item, idx) => (
                <div
                  key={idx}
                  className="h-full transition-all duration-300"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  title={`${item.name}: ${item.percentage}%`}
                />
              ))}
            </div>

            {/* Legend & Breakdown List */}
            <div className="space-y-3">
              {allocationItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(item.value)}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 font-mono">
            {isCompleted ? 'No savings allocated yet.' : 'Onboarding pending — asset allocation locked.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
