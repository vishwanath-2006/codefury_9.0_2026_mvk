import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import MarketDashboardPage from './pages/MarketDashboardPage';
import DashboardPage from './pages/DashboardPage';
import FinancialHealthPage from './pages/FinancialHealthPage';
import OnboardingPage from './pages/OnboardingPage';

import ExpensesPage from './pages/ExpensesPage';
import GoalsPage from './pages/GoalsPage';
import PortfolioPage from './pages/PortfolioPage';
import MutualFundsPage from './pages/MutualFundsPage';
import StocksPage from './pages/StocksPage';
import IposPage from './pages/IposPage';
import SipCalculatorPage from './pages/SipCalculatorPage';
import InvestmentComparisonPage from './pages/InvestmentComparisonPage';
import SuitabilityPage from './pages/SuitabilityPage';
import AiPage from './pages/AiPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Authentication Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected Application Shell Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Main Dashboard (Market Analysis Landing View) */}
                <Route path="/dashboard" element={<MarketDashboardPage />} />

                {/* Personal Finance Sub-routes */}
                <Route path="/overview" element={<DashboardPage />} />
                <Route path="/financial-health" element={<FinancialHealthPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />

                {/* Investments Sub-routes */}
                <Route path="/investments/mutual-funds" element={<MutualFundsPage />} />
                <Route path="/investments/stocks" element={<StocksPage />} />
                <Route path="/investments/ipos" element={<IposPage />} />

                {/* Tools & Intelligence Sub-routes */}
                <Route path="/tools/sip-calculator" element={<SipCalculatorPage />} />
                <Route path="/tools/investment-comparison" element={<InvestmentComparisonPage />} />
                <Route path="/tools/suitability" element={<SuitabilityPage />} />

                {/* AI Assistant Sub-route */}
                <Route path="/ai" element={<AiPage />} />

                {/* Account & System Sub-routes */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
