import { HEALTH_STATUS } from './constants';
import {
  calculateSavingsRateScore,
  calculateEmergencyFundScore,
  calculateDebtScore,
  calculateGoalScore,
  calculateDiversificationScore,
  calculateSafetyScore,
} from './calculators';

/**
 * Main Financial Health Engine Orchestrator
 * 
 * Takes financial profile data and returns an explainable, deterministic score (0-100)
 * along with data completeness and diagnostic breakdowns.
 */
export function calculateFinancialHealthScore(financialData = {}) {
  const {
    monthlyIncome,
    monthlyExpenses,
    monthlyEssentialExpenses,
    emergencyFund,
    monthlyDebtPayments,
    goals,
    portfolioAllocation,
    safetyData,
  } = financialData;

  // 1. Calculate Individual Component Scores
  const savingsRate = calculateSavingsRateScore(monthlyIncome, monthlyExpenses);
  const emergencyFundComp = calculateEmergencyFundScore(emergencyFund, monthlyEssentialExpenses, monthlyExpenses);
  const debtManagement = calculateDebtScore(monthlyDebtPayments, monthlyIncome);
  const goalReadiness = calculateGoalScore(goals);
  const diversification = calculateDiversificationScore(portfolioAllocation);
  const financialSafety = calculateSafetyScore(safetyData, emergencyFundComp.monthsCovered || 0);

  const components = {
    savingsRate,
    emergencyFund: emergencyFundComp,
    debtManagement,
    goalReadiness,
    diversification,
    financialSafety,
  };

  // 2. Data Completeness Calculation
  const componentKeys = Object.keys(components);
  const totalFactors = componentKeys.length; // 6 factors
  const availableComponents = componentKeys.filter((key) => components[key].isAvailable);
  const factorsEvaluated = availableComponents.length;

  const dataCompleteness = Math.round((factorsEvaluated / totalFactors) * 100);

  // 3. Overall Score Calculation & Safeguards
  let rawTotalScore = componentKeys.reduce((sum, key) => sum + (components[key].score || 0), 0);

  // Safeguard against NaN, Infinity, negative, or over 100
  if (isNaN(rawTotalScore) || !isFinite(rawTotalScore)) {
    rawTotalScore = 0;
  }
  const overallScore = Math.min(100, Math.max(0, Math.round(rawTotalScore)));

  // 4. Map Score to Status Label
  let status = HEALTH_STATUS.NEEDS_ATTENTION.label;
  if (overallScore >= HEALTH_STATUS.STRONG.min) {
    status = HEALTH_STATUS.STRONG.label;
  } else if (overallScore >= HEALTH_STATUS.GOOD.min) {
    status = HEALTH_STATUS.GOOD.label;
  } else if (overallScore >= HEALTH_STATUS.FAIR.min) {
    status = HEALTH_STATUS.FAIR.label;
  }

  // 5. Extract Strengths and Improvement Areas
  const strengths = [];
  const improvementAreas = [];

  componentKeys.forEach((key) => {
    const comp = components[key];
    if (!comp.isAvailable) return;

    if (comp.status === 'Excellent' || comp.status === 'Strong') {
      strengths.push({
        component: key,
        title: getComponentTitle(key),
        explanation: comp.explanation,
        score: comp.score,
        maxScore: comp.maxScore,
      });
    } else if (comp.status === 'Needs Attention' || comp.status === 'Moderate') {
      improvementAreas.push({
        component: key,
        title: getComponentTitle(key),
        explanation: comp.explanation,
        score: comp.score,
        maxScore: comp.maxScore,
      });
    }
  });

  return {
    overallScore,
    status,
    dataCompleteness,
    factorsEvaluated,
    totalFactors,
    components,
    strengths,
    improvementAreas,
  };
}

function getComponentTitle(key) {
  switch (key) {
    case 'savingsRate':
      return 'Savings Rate';
    case 'emergencyFund':
      return 'Emergency Reserve';
    case 'debtManagement':
      return 'Debt Management';
    case 'goalReadiness':
      return 'Goal Readiness';
    case 'diversification':
      return 'Investment Diversification';
    case 'financialSafety':
      return 'Financial Safety';
    default:
      return key;
  }
}
