import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingEntryModal from '../onboarding/OnboardingEntryModal';
import FloatingAiWidget from '../common/FloatingAiWidget';
import FloatingBottomDock from './FloatingBottomDock';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const { isOnboarded } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  // Entry Modal Prompt State (Onboard vs Overview)
  const [showEntryModal, setShowEntryModal] = useState(false);

  useEffect(() => {
    // Automatically trigger pop-up notification modal every time an un-onboarded user lands or navigates
    if (!isOnboarded && location.pathname !== '/onboarding') {
      setShowEntryModal(true);
    } else {
      setShowEntryModal(false);
    }
  }, [isOnboarded, location.pathname]);

  const handleCloseModal = () => {
    setShowEntryModal(false);
  };

  const handleStartOnboarding = () => {
    setShowEntryModal(false);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Invisible Screen Left Edge Hover Trigger for Desktop Sidebar */}
      <div
        onMouseEnter={() => setIsSidebarHovered(true)}
        className="hidden lg:block fixed left-0 top-0 bottom-0 w-4 z-40 cursor-pointer"
        title="Hover cursor here to open navigation sidebar"
      />

      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isHovered={isSidebarHovered}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      />

      {/* Main Application Content Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0 transition-all duration-300">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          <Outlet />
        </main>
      </div>

      {/* Floating FinLabs AI Robot Widget */}
      <FloatingAiWidget />

      {/* Floating Glassmorphism Quick-Access Bottom Dock */}
      <FloatingBottomDock />

      {/* Universal Onboarding Entry Modal Popup */}
      <OnboardingEntryModal
        isOpen={showEntryModal && !isOnboarded}
        onClose={handleCloseModal}
        onStartOnboarding={handleStartOnboarding}
      />
    </div>
  );
}
