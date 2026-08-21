import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Settings, Shield, Bell, Moon, Lock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-4xl mx-auto">
      <PageHeader
        title="Application Settings"
        subtitle="Manage security preferences, notification triggers, currency formats, and system integrations."
        tag="System"
      />

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-sm">Currency & Regional Format</h4>
            <p className="text-xs text-slate-400">Default reporting currency</p>
          </div>
          <Badge variant="neutral">INR (₹)</Badge>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-sm">Data Privacy Standards</h4>
            <p className="text-xs text-slate-400">Zero third-party financial data sharing</p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">Goal Progress Alerts</h4>
            <p className="text-xs text-slate-400">Receive monthly SIP compounding notifications</p>
          </div>
          <Badge variant="brand">Enabled</Badge>
        </div>
      </Card>
    </div>
  );
}
