import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingEntryModal from '../onboarding/OnboardingEntryModal';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOnboarded } = useOnboarding();
  const navigate = useNavigate();

  // Entry Modal Prompt State (Onboard vs Overview)
  const [showEntryModal, setShowEntryModal] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem('finlabs_onboarding_completed') === 'true';
    const isDismissedInSession = sessionStorage.getItem('finlabs_entry_modal_dismissed') === 'true';

    if (!isCompleted && !isDismissedInSession) {
      setShowEntryModal(true);
    }
  }, [isOnboarded]);

  const handleCloseModal = () => {
    sessionStorage.setItem('finlabs_entry_modal_dismissed', 'true');
    setShowEntryModal(false);
  };

  const handleStartOnboarding = () => {
    sessionStorage.setItem('finlabs_entry_modal_dismissed', 'true');
    setShowEntryModal(false);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Application Content Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Universal Onboarding Entry Modal Popup */}
      <OnboardingEntryModal
        isOpen={showEntryModal && !isOnboarded}
        onClose={handleCloseModal}
        onStartOnboarding={handleStartOnboarding}
      />
    </div>
  );
}
