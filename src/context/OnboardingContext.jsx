import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSavedOnboardingProfile, saveOnboardingProfile, initialOnboardingData } from '../services/onboardingService';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [profileState, setProfileState] = useState(() => getSavedOnboardingProfile());

  useEffect(() => {
    // Reload state if updated elsewhere
    const loaded = getSavedOnboardingProfile();
    setProfileState(loaded);
  }, []);

  const updateProfile = async (formData) => {
    const result = await saveOnboardingProfile(formData);
    setProfileState(result);
    return result;
  };

  return (
    <OnboardingContext.Provider
      value={{
        formData: profileState.formData || initialOnboardingData,
        healthScore: profileState.healthScore ?? 74,
        riskProfile: profileState.riskProfile || 'Moderate',
        completedAt: profileState.completedAt,
        updateProfile,
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
