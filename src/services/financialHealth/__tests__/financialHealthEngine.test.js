import { calculateFinancialHealthScore } from '../engine';

/**
 * Automated Unit Test Suite for Financial Health Engine
 */
export function runFinancialHealthEngineTests() {
  const results = [];

  const assert = (condition, testName, details = '') => {
    if (condition) {
      results.push({ name: testName, status: 'PASS', details });
    } else {
      results.push({ name: testName, status: 'FAIL', details });
      console.error(`[TEST FAIL] ${testName}: ${details}`);
    }
  };

  // CASE 1: Optimal Financial Profile (High Savings, Low Debt, 6+ Mo Emergency, Diversified)
  const case1Data = {
    monthlyIncome: 100000,
    monthlyExpenses: 60000,
    monthlyEssentialExpenses: 40000,
    emergencyFund: 250000, // 6.25 months
    monthlyDebtPayments: 10000, // 10% DTI
    goals: [
      { targetAmount: 500000, currentAmount: 400000 },
      { targetAmount: 2000000, currentAmount: 1600000 }
    ],
    portfolioAllocation: [
      { name: 'MF', percentage: 40 },
      { name: 'Equity', percentage: 35 },
      { name: 'Debt', percentage: 25 }
    ],
    safetyData: { hasHealthInsurance: true, hasLifeInsurance: true }
  };
  const res1 = calculateFinancialHealthScore(case1Data);
  assert(
    res1.overallScore >= 80 && res1.status === 'Strong' && res1.dataCompleteness === 100,
    'Case 1: Optimal Profile produces High Score (>=80, Strong)',
    `Score: ${res1.overallScore}, Status: ${res1.status}, Completeness: ${res1.dataCompleteness}%`
  );

  // CASE 2: Vulnerable Profile (Low Savings, High Debt, Zero Emergency)
  const case2Data = {
    monthlyIncome: 50000,
    monthlyExpenses: 48000, // 4% savings
    emergencyFund: 0,
    monthlyDebtPayments: 28000, // 56% DTI
    goals: [],
    portfolioAllocation: [],
    safetyData: { hasHealthInsurance: false, hasLifeInsurance: false }
  };
  const res2 = calculateFinancialHealthScore(case2Data);
  assert(
    res2.overallScore <= 35 && res2.status === 'Needs Attention',
    'Case 2: Vulnerable Profile produces Low Score (<=35, Needs Attention)',
    `Score: ${res2.overallScore}, Status: ${res2.status}`
  );

  // CASE 3: Missing Investment Data
  const case3Data = {
    monthlyIncome: 60000,
    monthlyExpenses: 40000,
    emergencyFund: 120000,
    monthlyDebtPayments: 5000,
    portfolioAllocation: null // Missing
  };
  const res3 = calculateFinancialHealthScore(case3Data);
  assert(
    res3.components.diversification.isAvailable === false &&
    res3.components.diversification.explanation.includes('Investment data not available'),
    'Case 3: Missing Investment Data marks Diversification as Unavailable',
    `IsAvailable: ${res3.components.diversification.isAvailable}, Explanation: "${res3.components.diversification.explanation}"`
  );

  // CASE 4: Zero Income (Division-by-Zero Safety)
  const case4Data = {
    monthlyIncome: 0,
    monthlyExpenses: 20000,
    monthlyDebtPayments: 5000
  };
  const res4 = calculateFinancialHealthScore(case4Data);
  assert(
    !isNaN(res4.overallScore) && isFinite(res4.overallScore) && res4.overallScore >= 0,
    'Case 4: Zero Income avoids division-by-zero errors safely',
    `Overall Score: ${res4.overallScore}`
  );

  // CASE 5: Negative & Invalid Inputs
  const case5Data = {
    monthlyIncome: -50000,
    monthlyExpenses: -20000,
    emergencyFund: -100000,
    monthlyDebtPayments: -5000
  };
  const res5 = calculateFinancialHealthScore(case5Data);
  assert(
    res5.overallScore >= 0 && res5.overallScore <= 100 && !isNaN(res5.overallScore),
    'Case 5: Negative inputs clamped between 0 and 100 without NaN',
    `Overall Score: ${res5.overallScore}`
  );

  // CASE 6: Incomplete Onboarding (2 of 6 factors provided)
  const case6Data = {
    monthlyIncome: 40000,
    monthlyExpenses: 30000,
    emergencyFund: 0
  };
  const res6 = calculateFinancialHealthScore(case6Data);
  assert(
    res6.factorsEvaluated === 2 && res6.dataCompleteness === 33,
    'Case 6: Incomplete Onboarding reports correct Data Completeness (33%)',
    `Evaluated: ${res6.factorsEvaluated}/6 (${res6.dataCompleteness}%)`
  );

  return results;
}
