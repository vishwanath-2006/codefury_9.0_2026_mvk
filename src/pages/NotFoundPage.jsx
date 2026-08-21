import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <EmptyState
          icon={HelpCircle}
          title="Page Not Found (404)"
          description="The requested page route does not exist in FinLabs."
        />
        <div className="text-center mt-6">
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            ← Back to FinLabs Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
