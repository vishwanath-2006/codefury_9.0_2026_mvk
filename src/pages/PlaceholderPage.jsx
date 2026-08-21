import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { Clock, ArrowLeft } from 'lucide-react';
import { modulePlaceholders } from '../mock/finlabsMockData';

export default function PlaceholderPage() {
  const location = useLocation();
  // Strip leading slash
  const pathKey = location.pathname.substring(1);

  const info = modulePlaceholders[pathKey] || {
    title: "Module In Development",
    subtitle: "This specialized financial tool is being prepared for upcoming platform releases.",
    moduleTag: "Upcoming",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title={info.title}
        subtitle={info.subtitle}
        tag={info.moduleTag}
      />

      <EmptyState
        icon={Clock}
        title="Coming in the next development phase."
        description="We are building this module to connect directly with your financial health score, calculation engines, and suitability intelligence."
      />

      <div className="flex justify-center pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Overview Dashboard
        </Link>
      </div>
    </div>
  );
}
