const CACHE_PREFIX = 'finlabs_mf_cache_';
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

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
 * Searches mutual fund schemes by query string.
 */
export async function searchSchemes(query) {
  if (!query || query.trim().length < 3) return [];
  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `search_${cleanQuery}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanQuery)}`);
    if (!res.ok) throw new Error('Failed to search mutual funds');
    const data = await res.json();
    // Cache the search results
    setCachedData(cacheKey, data);
    return data;
  } catch (err) {
    console.error('Search schemes error:', err);
    return [];
  }
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

  // If the closest date found is more than 30 days away from the target date, return null to avoid invalid comparison
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

  // Explicitly sort by date descending (latest first) to guarantee data[0] is the newest NAV
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
    // Annualized return (CAGR) = (latestNav / nav3YrAgo)^(1/3) - 1
    const cagr = (Math.pow(latestNav / nav3YrAgo, 1 / 3) - 1) * 100;
    return3Yr = cagr.toFixed(2) + '%';
  }

  // Max / All-Time return (annualized if > 1 year)
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
