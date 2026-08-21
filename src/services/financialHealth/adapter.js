import { supabase } from '../../lib/supabaseClient';
import { calculateFinancialHealthScore } from './engine';
import { mockUserSummary, mockTopGoals, mockPortfolioAllocation } from '../../mock/finlabsMockData';

/**
 * Data Access Adapter for Financial Health Engine.
 * Isolates data fetching so future onboarding module updates do not break calculations.
 */

// Isolated dev fallback profile (used if user has not completed onboarding)
export const mockFinancialProfile = Object.freeze({
  monthlyIncome: 40000,
  monthlyExpenses: 32000,
  monthlyEssentialExpenses: 24000,
  emergencyFund: 144000,
  monthlyDebtPayments: 4800,
  goals: mockTopGoals,
  portfolioAllocation: mockPortfolioAllocation,
  safetyData: {
    hasHealthInsurance: true,
    hasLifeInsurance: true,
  },
});

/**
 * Retrieves financial profile inputs for calculation engine.
 */
export async function getFinancialProfileInputs(userId) {
  if (!userId) {
    return mockFinancialProfile;
  }

  try {
    // Attempt to query Supabase onboarding/financial profile table if created
    const { data, error } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return {
        monthlyIncome: data.monthly_income,
        monthlyExpenses: data.monthly_expenses,
        monthlyEssentialExpenses: data.monthly_essential_expenses,
        emergencyFund: data.emergency_fund,
        monthlyDebtPayments: data.monthly_debt_payments,
        goals: data.goals || [],
        portfolioAllocation: data.portfolio_allocation || [],
        safetyData: {
          hasHealthInsurance: data.has_health_insurance || false,
          hasLifeInsurance: data.has_life_insurance || false,
        },
      };
    }
  } catch (err) {
    console.info('Using adapter fallback profile for user:', userId);
  }

  return mockFinancialProfile;
}

/**
 * Computes and returns the complete Financial Health Diagnostic for a user.
 */
export async function getFinancialHealthDiagnostic(userId) {
  const inputs = await getFinancialProfileInputs(userId);
  return calculateFinancialHealthScore(inputs);
}

/**
 * Persists calculated score to Supabase financial_health_scores table if available.
 */
export async function saveFinancialHealthScore(userId, diagnostic) {
  if (!userId || !diagnostic) return null;

  try {
    const record = {
      user_id: userId,
      overall_score: diagnostic.overallScore,
      savings_score: diagnostic.components.savingsRate.score,
      emergency_fund_score: diagnostic.components.emergencyFund.score,
      debt_score: diagnostic.components.debtManagement.score,
      goal_score: diagnostic.components.goalReadiness.score,
      diversification_score: diagnostic.components.diversification.score,
      financial_safety_score: diagnostic.components.financialSafety.score,
      data_completeness: diagnostic.dataCompleteness,
      calculated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('financial_health_scores')
      .upsert(record, { onConflict: 'user_id' })
      .select()
      .single();

    if (error && error.code !== '42P01') {
      console.warn('Persist score notice:', error.message);
    }
    return data;
  } catch (err) {
    console.info('Skipped saving score to database (table may not exist yet).');
    return null;
  }
}
