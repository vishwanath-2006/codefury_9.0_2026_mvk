import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  getSavedOnboardingProfile,
  getFinancialProfile,
  saveFinancialProfile,
  createEmptyOnboardingData,
  getUserFinancialProfile
} from '../services/onboardingService';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [profileState, setProfileState] = useState(() => getSavedOnboardingProfile(user?.id));
  const [isOnboardedState, setIsOnboardedState] = useState(() => {
    return localStorage.getItem('finlabs_onboarding_completed') === 'true';
  });
  const currentUserIdRef = useRef(user?.id);

  // Sync state when user changes or auth finishes loading
  useEffect(() => {
    currentUserIdRef.current = user?.id;

    if (authLoading) {
      return;
    }

    if (!user?.id) {
      // User logged out or unauthenticated -> Reset state completely
      setProfileState({
        formData: createEmptyOnboardingData(),
        healthScore: null,
        riskProfile: null,
        completedAt: null,
      });
      setIsOnboardedState(false);
      return;
    }

    let isMounted = true;
    const activeUserId = user.id;

    async function loadActiveUserProfile() {
      // Clear previous user's profile state immediately before fetching new user
      setProfileState({
        formData: createEmptyOnboardingData(user, profile),
        healthScore: null,
        riskProfile: null,
        completedAt: null,
      });

      const loaded = await getFinancialProfile(activeUserId);

      // Prevent race conditions if user changed while request was in-flight
      if (!isMounted || currentUserIdRef.current !== activeUserId) return;

      const isCompleted = Boolean(
        loaded && (loaded.onboarding_completed || loaded.onboardingCompleted)
      );

      setIsOnboardedState(isCompleted);

      if (loaded && (isCompleted || loaded.monthly_income != null || loaded.monthlyIncome != null)) {
        setProfileState({
          formData: loaded,
          healthScore: null,
          riskProfile: loaded.risk_tolerance || loaded.riskTolerance || 'Moderate',
          completedAt: isCompleted ? new Date().toISOString() : null,
        });
      } else {
        // User has no saved profile -> Fresh state with completedAt = null
        setProfileState({
          formData: createEmptyOnboardingData(user, profile),
          healthScore: null,
          riskProfile: null,
          completedAt: null,
        });
      }
    }

    loadActiveUserProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id, profile, authLoading]);

  const setIsOnboarded = (value) => {
    if (value) {
      localStorage.setItem('finlabs_onboarding_completed', 'true');
    } else {
      localStorage.removeItem('finlabs_onboarding_completed');
      sessionStorage.removeItem('finlabs_entry_modal_dismissed');
    }
    setIsOnboardedState(Boolean(value));
  };

  const refreshOnboardingState = async () => {
    if (!user?.id) return;
    const loaded = await getFinancialProfile(user.id);
    const isCompleted = Boolean(
      loaded && (loaded.onboarding_completed || loaded.onboardingCompleted)
    );
    setIsOnboardedState(isCompleted);
    if (loaded && (isCompleted || loaded.monthly_income != null || loaded.monthlyIncome != null)) {
      setProfileState({
        formData: loaded,
        healthScore: null,
        riskProfile: loaded.risk_tolerance || loaded.riskTolerance || 'Moderate',
        completedAt: isCompleted ? new Date().toISOString() : null,
      });
    } else {
      setProfileState({
        formData: createEmptyOnboardingData(user, profile),
        healthScore: null,
        riskProfile: null,
        completedAt: null,
      });
    }
  };

  const updateProfile = async (formData, userId = null) => {
    const targetUserId = userId || user?.id;
    const result = await saveFinancialProfile(targetUserId, formData);
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

  const userProfile = getUserFinancialProfile(profileState.formData || createEmptyOnboardingData(user, profile));
  const isOnboarded = isOnboardedState || Boolean(profileState.completedAt);

  return (
    <OnboardingContext.Provider
      value={{
        formData: profileState.formData || createEmptyOnboardingData(user, profile),
        userProfile,
        healthScore: profileState.healthScore,
        riskProfile: profileState.riskProfile,
        completedAt: profileState.completedAt,
        isOnboarded,
        setIsOnboarded,
        updateProfile,
        completeOnboarding,
        resetToOverview,
        refreshOnboardingState,
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
