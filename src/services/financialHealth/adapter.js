import { supabase } from '../../lib/supabaseClient';
import { calculateFinancialHealthScore } from './engine';
import { mockTopGoals, mockPortfolioAllocation } from '../../mock/finlabsMockData';

/**
 * Data Access Adapter for Financial Health Engine.
 * Isolates data fetching so future onboarding module updates do not break calculations.
 */

// Authoritative baseline fallback profile aligned with FinLabs onboarding schema
export const mockFinancialProfile = Object.freeze({
  monthlyIncome: 50000,
  monthlyExpenses: 35000,
  monthlyEssentialExpenses: 25000,
  emergencyFund: 100000,
  monthlyDebtPayments: 0,
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
      const monthlyIncome = Number(data.monthly_income) || 50000;
      const monthlyEssential = Number(data.monthly_essential_expenses) || 25000;
      const monthlyDiscretionary = Number(data.monthly_discretionary_expenses) || 10000;
      const monthlyExpenses = Number(data.monthly_expenses) || (monthlyEssential + monthlyDiscretionary);
      const emergencyFund = Number(data.emergency_fund) || 100000;
      const monthlyDebtPayments = Number(data.monthly_debt_payments) || 0;

      return {
        monthlyIncome,
        monthlyExpenses,
        monthlyEssentialExpenses: monthlyEssential,
        emergencyFund,
        monthlyDebtPayments,
        goals: data.goals || mockTopGoals,
        portfolioAllocation: data.portfolio_allocation || mockPortfolioAllocation,
        safetyData: {
          hasHealthInsurance: data.has_health_insurance ?? true,
          hasLifeInsurance: data.has_life_insurance ?? true,
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
