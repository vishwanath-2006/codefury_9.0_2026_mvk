/**
 * FinLabs Financial Health Engine - Constants & Scoring Config
 * 
 * Deterministic scoring model totaling 100 points across 6 financial components.
 */

export const HEALTH_STATUS = Object.freeze({
  NEEDS_ATTENTION: { label: 'Needs Attention', min: 0, max: 39, color: 'rose' },
  FAIR: { label: 'Fair', min: 40, max: 59, color: 'amber' },
  GOOD: { label: 'Good', min: 60, max: 79, color: 'emerald' },
  STRONG: { label: 'Strong', min: 80, max: 100, color: 'emerald' },
});

export const COMPONENT_MAX_SCORES = Object.freeze({
  SAVINGS_RATE: 20,
  EMERGENCY_FUND: 20,
  DEBT_MANAGEMENT: 20,
  GOAL_READINESS: 15,
  INVESTMENT_DIVERSIFICATION: 15,
  FINANCIAL_SAFETY: 10,
});

export const COMPONENT_STATUS = Object.freeze({
  EXCELLENT: 'Excellent',
  STRONG: 'Strong',
  GOOD: 'Good',
  MODERATE: 'Moderate',
  NEEDS_ATTENTION: 'Needs Attention',
  INSUFFICIENT_DATA: 'Insufficient Data',
});

/**
 * Deterministic Threshold Configuration
 */
export const THRESHOLDS = Object.freeze({
  SAVINGS_RATE: [
    { maxPct: 5, score: 2, status: COMPONENT_STATUS.NEEDS_ATTENTION },
    { maxPct: 10, score: 7, status: COMPONENT_STATUS.MODERATE },
    { maxPct: 20, score: 12, status: COMPONENT_STATUS.GOOD },
    { maxPct: 30, score: 16, status: COMPONENT_STATUS.STRONG },
    { maxPct: Infinity, score: 20, status: COMPONENT_STATUS.EXCELLENT },
  ],
  EMERGENCY_FUND_MONTHS: [
    { maxMonths: 1, score: 3, status: COMPONENT_STATUS.NEEDS_ATTENTION },
    { maxMonths: 2, score: 7, status: COMPONENT_STATUS.MODERATE },
    { maxMonths: 3, score: 11, status: COMPONENT_STATUS.GOOD },
    { maxMonths: 6, score: 16, status: COMPONENT_STATUS.STRONG },
    { maxMonths: Infinity, score: 20, status: COMPONENT_STATUS.EXCELLENT },
  ],
  DEBT_TO_INCOME_PCT: [
    { maxDti: 15, score: 20, status: COMPONENT_STATUS.EXCELLENT },
    { maxDti: 30, score: 16, status: COMPONENT_STATUS.STRONG },
    { maxDti: 45, score: 10, status: COMPONENT_STATUS.MODERATE },
    { maxDti: Infinity, score: 4, status: COMPONENT_STATUS.NEEDS_ATTENTION },
  ],
});
