import { supabase } from '../../lib/supabaseClient';
import { calculateFinancialHealthScore } from './engine';
import { getNormalizedFinancialProfile } from '../onboardingService';
import { mockTopGoals, mockPortfolioAllocation } from '../../mock/finlabsMockData';

/**
 * Data Access Adapter for Financial Health Engine.
 * Isolates data fetching and delegates to single source of truth resolver.
 */

/**
 * Retrieves normalized financial profile inputs for calculation engine.
 */
export async function getFinancialProfileInputs(userId) {
  const normProfile = await getNormalizedFinancialProfile(userId);

  return {
    monthlyIncome: normProfile.monthlyIncome,
    monthlyExpenses: normProfile.monthlyExpenses,
    monthlyEssentialExpenses: normProfile.monthlyEssentialExpenses,
    emergencyFund: normProfile.emergencyFund,
    monthlyDebtPayments: normProfile.monthlyDebtPayments,
    goals: normProfile.goals || mockTopGoals,
    portfolioAllocation: mockPortfolioAllocation,
    safetyData: {
      hasHealthInsurance: true,
      hasLifeInsurance: true,
    },
  };
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
