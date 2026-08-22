/**
 * FINLABS AI — STAGE 3 PHASE 3: MUTUAL FUND INTELLIGENCE MODULE
 * Executes inside Deno Edge Function with in-memory caching & deterministic scheme ranking.
 */

interface RawMasterScheme {
  schemeCode: number;
  schemeName: string;
  isinGrowth?: string | null;
  isinDivReinvestment?: string | null;
}

export interface EnrichedScheme {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  isDirect: boolean;
  isGrowth: boolean;
  nav: string | null;
  cagr1Yr: string | null;
  cagr3Yr: string | null;
  risk: string;
}

// Simple in-memory cache for Deno Edge Function instance
let masterSchemesCache: RawMasterScheme[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Fetches or returns cached master list of ~37,779 schemes from api.mfapi.in
 */
export async function getMasterSchemes(): Promise<RawMasterScheme[]> {
  const now = Date.now();
  if (masterSchemesCache && masterSchemesCache.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return masterSchemesCache;
  }

  try {
    const res = await fetch("https://api.mfapi.in/mf");
    if (!res.ok) throw new Error("Failed to fetch master schemes from MFAPI");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      masterSchemesCache = data;
      cacheTimestamp = now;
      return data;
    }
    return [];
  } catch (err) {
    console.error("Error fetching master schemes in Edge Function:", err);
    return masterSchemesCache || [];
  }
}

/**
 * Parses date string in "DD-MM-YYYY" format to Date.
 */
function parseMFDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(NaN);
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
}

/**
 * Finds closest historical NAV to target date.
 */
function findClosestNAV(dataArray: any[], targetDate: Date) {
  if (!dataArray || dataArray.length === 0) return null;
  let closestItem = dataArray[0];
  let minDiff = Infinity;
  const targetTime = targetDate.getTime();

  for (let i = 0; i < dataArray.length; i++) {
    const itemDate = parseMFDate(dataArray[i].date);
    if (isNaN(itemDate.getTime())) continue;

    const diff = Math.abs(itemDate.getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestItem = dataArray[i];
    }
  }

  if (minDiff > 30 * 24 * 60 * 60 * 1000) return null;
  return closestItem;
}

/**
 * Fetches live scheme details and computes real historical CAGR returns.
 */
export async function fetchSchemeReturns(schemeCode: number): Promise<{ nav: string | null; cagr1Yr: string | null; cagr3Yr: string | null }> {
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!res.ok) return { nav: null, cagr1Yr: null, cagr3Yr: null };
    const schemeData = await res.json();

    const data = schemeData?.data;
    if (!Array.isArray(data) || data.length === 0) {
      return { nav: null, cagr1Yr: null, cagr3Yr: null };
    }

    const sorted = [...data].sort((a, b) => parseMFDate(b.date).getTime() - parseMFDate(a.date).getTime());
    const latestItem = sorted[0];
    const latestNavNum = Number(latestItem?.nav);
    const latestDate = parseMFDate(latestItem?.date);

    if (isNaN(latestNavNum) || isNaN(latestDate.getTime())) {
      return { nav: null, cagr1Yr: null, cagr3Yr: null };
    }

    const nav = `₹${latestNavNum.toFixed(2)}`;

    // 1 Year CAGR
    const date1YrAgo = new Date(latestDate);
    date1YrAgo.setFullYear(date1YrAgo.getFullYear() - 1);
    const item1YrAgo = findClosestNAV(sorted, date1YrAgo);
    const nav1YrAgo = item1YrAgo ? Number(item1YrAgo.nav) : null;
    let cagr1Yr: string | null = null;
    if (nav1YrAgo && nav1YrAgo > 0) {
      cagr1Yr = `${(((latestNavNum - nav1YrAgo) / nav1YrAgo) * 100).toFixed(2)}%`;
    }

    // 3 Year CAGR
    const date3YrAgo = new Date(latestDate);
    date3YrAgo.setFullYear(date3YrAgo.getFullYear() - 3);
    const item3YrAgo = findClosestNAV(sorted, date3YrAgo);
    const nav3YrAgo = item3YrAgo ? Number(item3YrAgo.nav) : null;
    let cagr3Yr: string | null = null;
    if (nav3YrAgo && nav3YrAgo > 0) {
      const cagr = (Math.pow(latestNavNum / nav3YrAgo, 1 / 3) - 1) * 100;
      cagr3Yr = `${cagr.toFixed(2)}%`;
    }

    return { nav, cagr1Yr, cagr3Yr };
  } catch (err) {
    console.error(`Error fetching scheme returns for ${schemeCode}:`, err);
    return { nav: null, cagr1Yr: null, cagr3Yr: null };
  }
}

/**
 * Determines target category from user's risk tolerance and time horizon.
 */
export function determineTargetCategory(riskTolerance: string | null, timeHorizon: string | null): { targetCategory: string; riskLabel: string } {
  const riskLower = (riskTolerance || "").toLowerCase();
  const horizonLower = (timeHorizon || "").toLowerCase();

  if (riskLower.includes("low") || riskLower.includes("conservative") || horizonLower.includes("< 3") || horizonLower.includes("1-3") || horizonLower.includes("short")) {
    return { targetCategory: "Debt", riskLabel: "Low Risk" };
  }
  if (riskLower.includes("high") || riskLower.includes("aggressive") || horizonLower.includes("> 10") || horizonLower.includes("10+")) {
    return { targetCategory: "Small Cap", riskLabel: "High Risk" };
  }
  if (riskLower.includes("moderately high") || riskLower.includes("growth") || horizonLower.includes("5-10") || horizonLower.includes("5 to 10")) {
    return { targetCategory: "Flexi Cap", riskLabel: "Moderately High Risk" };
  }

  // Default Moderate / Balanced
  return { targetCategory: "Large Cap Index", riskLabel: "Moderate Risk" };
}

/**
 * Extracts AMC / Fund House name from scheme name.
 */
function extractFundHouse(schemeName: string): string {
  const lower = schemeName.toLowerCase();
  const amcMap = [
    { key: 'parag parikh', name: 'PPFAS Mutual Fund' },
    { key: 'ppfas', name: 'PPFAS Mutual Fund' },
    { key: 'sbi', name: 'SBI Mutual Fund' },
    { key: 'quant', name: 'Quant Mutual Fund' },
    { key: 'hdfc', name: 'HDFC Mutual Fund' },
    { key: 'icici', name: 'ICICI Prudential MF' },
    { key: 'axis', name: 'Axis Mutual Fund' },
    { key: 'mirae', name: 'Mirae Asset MF' },
    { key: 'nippon', name: 'Nippon India MF' },
    { key: 'uti', name: 'UTI Mutual Fund' },
    { key: 'kotak', name: 'Kotak Mahindra MF' },
    { key: 'tata', name: 'Tata Mutual Fund' },
    { key: 'motilal', name: 'Motilal Oswal MF' },
    { key: 'dsp', name: 'DSP Mutual Fund' },
    { key: 'invesco', name: 'Invesco Mutual Fund' },
    { key: 'bandhan', name: 'Bandhan Mutual Fund' },
    { key: 'sundaram', name: 'Sundaram MF' },
    { key: 'canara', name: 'Canara Robeco MF' },
    { key: 'edelweiss', name: 'Edelweiss MF' },
    { key: 'franklin', name: 'Franklin Templeton MF' },
    { key: 'hsbc', name: 'HSBC Mutual Fund' },
    { key: 'pgim', name: 'PGIM India MF' },
    { key: 'groww', name: 'Groww Mutual Fund' },
    { key: 'whiteoak', name: 'WhiteOak Capital MF' },
    { key: 'navi', name: 'Navi Mutual Fund' }
  ];

  const match = amcMap.find(a => lower.includes(a.key));
  return match ? match.name : schemeName.split(" ")[0] + " MF";
}

/**
 * Main Deterministic Scheme Recommender Function.
 * Returns up to 5 top schemes from DISTINCT AMCs.
 */
export async function getTopRecommendedSchemes(params: { riskTolerance: string | null; timeHorizon: string | null }): Promise<EnrichedScheme[]> {
  const masterSchemes = await getMasterSchemes();
  if (!masterSchemes || masterSchemes.length === 0) return [];

  const { targetCategory, riskLabel } = determineTargetCategory(params.riskTolerance, params.timeHorizon);
  const catLower = targetCategory.toLowerCase();

  // 1. Filter Direct Growth schemes matching target category keywords
  const candidateSchemes: RawMasterScheme[] = [];
  const seenAmcs = new Set<string>();

  for (const scheme of masterSchemes) {
    const nameLower = scheme.schemeName.toLowerCase();
    const isDirect = nameLower.includes("direct");
    const isGrowth = nameLower.includes("growth") || nameLower.includes("-g");

    if (!isDirect || !isGrowth) continue;

    // Match category
    let matchesCategory = false;
    if (catLower === "debt") {
      matchesCategory = nameLower.includes("bond") || nameLower.includes("debt") || nameLower.includes("liquid") || nameLower.includes("gilt") || nameLower.includes("corporate");
    } else if (catLower === "small cap") {
      matchesCategory = nameLower.includes("small cap") || nameLower.includes("smallcap");
    } else if (catLower === "large cap index") {
      matchesCategory = nameLower.includes("index") || nameLower.includes("nifty") || nameLower.includes("large cap") || nameLower.includes("bluechip");
    } else if (catLower === "flexi cap") {
      matchesCategory = nameLower.includes("flexi") || nameLower.includes("multi cap") || nameLower.includes("focused");
    }

    if (!matchesCategory) continue;

    const amc = extractFundHouse(scheme.schemeName);
    if (seenAmcs.has(amc)) continue; // Ensure DISTINCT AMCs

    seenAmcs.add(amc);
    candidateSchemes.push(scheme);

    if (candidateSchemes.length >= 10) break; // Limit candidates for returns hydration
  }

  // 2. Fetch live returns for top distinct candidate schemes
  const enrichedList: EnrichedScheme[] = [];
  for (const s of candidateSchemes.slice(0, 5)) {
    const returns = await fetchSchemeReturns(s.schemeCode);
    enrichedList.push({
      schemeCode: s.schemeCode,
      schemeName: s.schemeName,
      fundHouse: extractFundHouse(s.schemeName),
      category: targetCategory,
      isDirect: true,
      isGrowth: true,
      nav: returns.nav,
      cagr1Yr: returns.cagr1Yr,
      cagr3Yr: returns.cagr3Yr,
      risk: riskLabel
    });
  }

  return enrichedList;
}
