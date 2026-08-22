import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSavedOnboardingProfile, saveOnboardingProfile, initialOnboardingData, getUserFinancialProfile } from '../services/onboardingService';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [profileState, setProfileState] = useState(() => getSavedOnboardingProfile());
  const [isOnboarded, setIsOnboardedState] = useState(() => {
    return localStorage.getItem('finlabs_onboarding_completed') === 'true';
  });

  useEffect(() => {
    // Sync onboarding completion state
    const completed = localStorage.getItem('finlabs_onboarding_completed') === 'true';
    setIsOnboardedState(completed);
  }, []);

  const setIsOnboarded = (value) => {
    if (value) {
      localStorage.setItem('finlabs_onboarding_completed', 'true');
    } else {
      localStorage.removeItem('finlabs_onboarding_completed');
      sessionStorage.removeItem('finlabs_entry_modal_dismissed');
    }
    setIsOnboardedState(Boolean(value));
  };

  const updateProfile = async (formData) => {
    const result = await saveOnboardingProfile(formData);
    localStorage.setItem('finlabs_onboarding_completed', 'true');
    setIsOnboardedState(true);
    setProfileState(result);
    return result;
  };

  const completeOnboarding = async (formData) => {
    return await updateProfile(formData);
  };

  const resetToOverview = () => {
    localStorage.removeItem('finlabs_onboarding_completed');
    sessionStorage.removeItem('finlabs_entry_modal_dismissed');
    setIsOnboardedState(false);
  };

  const userProfile = getUserFinancialProfile(profileState.formData || initialOnboardingData);

  return (
    <OnboardingContext.Provider
      value={{
        formData: profileState.formData || initialOnboardingData,
        userProfile,
        healthScore: profileState.healthScore ?? 74,
        riskProfile: profileState.riskProfile || userProfile.riskProfileLabel || 'Moderate',
        completedAt: profileState.completedAt,
        isOnboarded,
        setIsOnboarded,
        updateProfile,
        completeOnboarding,
        resetToOverview,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
