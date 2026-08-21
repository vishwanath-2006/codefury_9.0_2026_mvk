const CACHE_PREFIX = 'finlabs_mf_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for master list

function getCachedData(key) {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp < CACHE_TTL) {
      return parsed.data;
    }
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  return null;
}

function setCachedData(key, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({
        timestamp: Date.now(),
        data
      })
    );
  } catch (e) {
    console.warn('Cache write error:', e);
  }
}

/**
 * Fetches the master list of all ~37,000+ mutual fund schemes from MFapi.in
 */
export async function getAllSchemes() {
  const cacheKey = 'all_master_schemes';
  const cached = getCachedData(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  try {
    const res = await fetch('https://api.mfapi.in/mf');
    if (!res.ok) throw new Error('Failed to fetch master mutual fund scheme list');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setCachedData(cacheKey, data);
      return data;
    }
    return [];
  } catch (err) {
    console.error('Error fetching master scheme list:', err);
    return [];
  }
}

/**
 * Searches mutual fund schemes by query string via API.
 */
export async function searchSchemes(query) {
  if (!query || query.trim().length < 2) return [];
  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `search_${cleanQuery}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanQuery)}`);
    if (!res.ok) throw new Error('Failed to search mutual funds');
    const data = await res.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (err) {
    console.error('Search schemes error:', err);
    return [];
  }
}

/**
 * Derives category, AMC fund house, risk matching, and suitability from scheme name.
 */
export function enrichSchemeMeta(scheme) {
  const name = scheme.schemeName || scheme.name || '';
  const lower = name.toLowerCase();

  // 1. Category Classification
  let category = 'Flexi Cap';
  if (
    lower.includes('bond') ||
    lower.includes('debt') ||
    lower.includes('liquid') ||
    lower.includes('gilt') ||
    lower.includes('treasury') ||
    lower.includes('money market') ||
    lower.includes('overnight') ||
    lower.includes('short duration') ||
    lower.includes('corporate') ||
    lower.includes('floater') ||
    lower.includes('banking & psu')
  ) {
    category = 'Debt';
  } else if (
    lower.includes('small cap') ||
    lower.includes('smallcap') ||
    lower.includes('micro cap')
  ) {
    category = 'Small Cap';
  } else if (
    lower.includes('index') ||
    lower.includes('nifty') ||
    lower.includes('sensex') ||
    lower.includes('large cap') ||
    lower.includes('largecap') ||
    lower.includes('bluechip')
  ) {
    category = 'Large Cap Index';
  } else if (
    lower.includes('flexi') ||
    lower.includes('multi cap') ||
    lower.includes('multicap') ||
    lower.includes('focused')
  ) {
    category = 'Flexi Cap';
  }

  // 2. Fund House Extraction
  const amcList = [
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
    { key: 'navi', name: 'Navi Mutual Fund' },
  ];

  const matchedAmc = amcList.find((a) => lower.includes(a.key));
  const fundHouse = matchedAmc ? matchedAmc.name : name.split(' ')[0] + ' MF';

  // 3. Risk & Personalized Suitability Matching
  let risk = 'Moderate';
  let suitability = '92% Match';

  if (category === 'Debt') {
    risk = 'Low';
    suitability = '90% Match';
  } else if (category === 'Large Cap Index') {
    risk = 'Moderate';
    suitability = '96% Match';
  } else if (category === 'Flexi Cap') {
    risk = 'Moderately High';
    suitability = '94% Match';
  } else if (category === 'Small Cap') {
    risk = 'High';
    suitability = '86% Match';
  }

  const isDirect = lower.includes('direct');
  const isGrowth = lower.includes('growth') || lower.includes('-g');

  return {
    schemeCode: scheme.schemeCode,
    name: scheme.schemeName || scheme.name,
    category,
    fundHouse,
    risk,
    suitability,
    minSip: category === 'Debt' ? 500 : isDirect ? 500 : 1000,
    isDirect,
    isGrowth
  };
}

/**
 * Filters and paginates master list of 37,000+ mutual fund schemes.
 */
export function filterAndPaginateSchemes(allSchemes, { query = '', category = 'All', page = 1, pageSize = 12 }) {
  const trimmed = query.trim().toLowerCase();
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  let filtered = allSchemes;

  // 1. Filter by Search Query
  if (tokens.length > 0) {
    filtered = filtered.filter((s) => {
      const lowerName = s.schemeName.toLowerCase();
      return tokens.every((token) => {
        if (lowerName.includes(token)) return true;
        if (token === 'ppfas' && lowerName.includes('parag parikh')) return true;
        if (token === 'bluechip' && (lowerName.includes('large cap') || lowerName.includes('bluechip'))) return true;
        if (token === 'bchip' && lowerName.includes('bluechip')) return true;
        if (token === 'index' && lowerName.includes('nifty')) return true;
        if (token === 'flexi' && lowerName.includes('flexi')) return true;
        if (token === 'small' && lowerName.includes('small')) return true;
        return false;
      });
    });
  }

  // 2. Filter by Category
  if (category !== 'All') {
    const catLower = category.toLowerCase();
    filtered = filtered.filter((s) => {
      const meta = enrichSchemeMeta(s);
      return meta.category.toLowerCase() === catLower;
    });
  }

  // 3. Sort: Prioritize Direct Growth schemes
  filtered.sort((a, b) => {
    const nameA = a.schemeName.toLowerCase();
    const nameB = b.schemeName.toLowerCase();

    const scoreA = (nameA.includes('direct') ? 2 : 0) + (nameA.includes('growth') ? 1 : 0);
    const scoreB = (nameB.includes('direct') ? 2 : 0) + (nameB.includes('growth') ? 1 : 0);

    return scoreB - scoreA;
  });

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = 0; // Cumulative slice for Load More
  const endIndex = page * pageSize;

  const sliced = filtered.slice(startIndex, endIndex);

  return {
    items: sliced.map(enrichSchemeMeta),
    totalCount,
    totalPages,
    currentPage: page,
    hasMore: endIndex < totalCount
  };
}

/**
 * Parses date string in "DD-MM-YYYY" format to a Date object.
 */
function parseMFDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(NaN);
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
}

/**
 * Gets details of a specific mutual fund scheme, including historical NAV.
 */
export async function getSchemeDetails(schemeCode) {
  if (!schemeCode) return null;
  const cacheKey = `scheme_${schemeCode}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!res.ok) throw new Error(`Failed to fetch scheme details for ${schemeCode}`);
    const data = await res.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (err) {
    console.error('Get scheme details error:', err);
    throw err;
  }
}

/**
 * Finds the NAV closest to a target Date.
 */
function findClosestNAV(dataArray, targetDate) {
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

  if (minDiff > 30 * 24 * 60 * 60 * 1000) {
    return null;
  }

  return closestItem;
}

/**
 * Computes annualized performance CAGR returns.
 */
export function calculateReturns(schemeData) {
  const data = schemeData?.data;
  if (!data || data.length === 0) {
    return { return1Yr: 'N/A', return3Yr: 'N/A', returnAll: 'N/A' };
  }

  const sorted = [...data].sort((a, b) => parseMFDate(b.date) - parseMFDate(a.date));

  const latestItem = sorted[0];
  const latestNav = Number(latestItem.nav);
  const latestDate = parseMFDate(latestItem.date);

  if (isNaN(latestNav) || isNaN(latestDate.getTime())) {
    return { return1Yr: 'N/A', return3Yr: 'N/A', returnAll: 'N/A' };
  }

  // 1 Year ago
  const date1YrAgo = new Date(latestDate);
  date1YrAgo.setFullYear(date1YrAgo.getFullYear() - 1);
  const item1YrAgo = findClosestNAV(sorted, date1YrAgo);
  const nav1YrAgo = item1YrAgo ? Number(item1YrAgo.nav) : null;
  let return1Yr = 'N/A';
  if (nav1YrAgo && nav1YrAgo > 0) {
    return1Yr = (((latestNav - nav1YrAgo) / nav1YrAgo) * 100).toFixed(2) + '%';
  }

  // 3 Years ago
  const date3YrAgo = new Date(latestDate);
  date3YrAgo.setFullYear(date3YrAgo.getFullYear() - 3);
  const item3YrAgo = findClosestNAV(sorted, date3YrAgo);
  const nav3YrAgo = item3YrAgo ? Number(item3YrAgo.nav) : null;
  let return3Yr = 'N/A';
  if (nav3YrAgo && nav3YrAgo > 0) {
    const cagr = (Math.pow(latestNav / nav3YrAgo, 1 / 3) - 1) * 100;
    return3Yr = cagr.toFixed(2) + '%';
  }

  // Max / All-Time return
  const oldestItem = sorted[sorted.length - 1];
  const oldestNav = Number(oldestItem.nav);
  const oldestDate = parseMFDate(oldestItem.date);
  let returnAll = 'N/A';
  if (oldestNav && oldestNav > 0 && !isNaN(oldestDate.getTime())) {
    const yearsDiff = (latestDate.getTime() - oldestDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (yearsDiff > 0.1) {
      if (yearsDiff >= 1) {
        const cagr = (Math.pow(latestNav / oldestNav, 1 / yearsDiff) - 1) * 100;
        returnAll = cagr.toFixed(2) + '% p.a.';
      } else {
        returnAll = (((latestNav - oldestNav) / oldestNav) * 100).toFixed(2) + '%';
      }
    }
  }

  return {
    return1Yr,
    return3Yr,
    returnAll
  };
}
