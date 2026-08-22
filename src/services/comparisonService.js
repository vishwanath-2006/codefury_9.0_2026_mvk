/**
 * FINLABS UNIFIED CANONICAL MULTI-ASSET COMPARISON SERVICE
 * Single source of truth for Stocks, Mutual Funds, and IPOs.
 */

// Top Indian Equities (NSE Bluechips)
export const STOCKS_UNIVERSE = [
  {
    id: 'stock-TCS',
    symbol: 'TCS',
    displayName: 'Tata Consultancy Services',
    name: 'Tata Consultancy Services',
    sector: 'IT Services / Tech',
    exchange: 'NSE',
    basePrice: 4120.25,
    return1M: 4.2,
    return6M: 14.5,
    return1Y: 24.8,
    returnLabelType: 'Historical Return',
    basePe: '31.2',
    baseMcap: '15,08,100 Cr',
    risk: 'High',
    minInv: '1 Share (~₹4,120)',
    minInvestmentNum: 4120,
    horizon: '3–5+ Years',
    suitability: 'Direct Equity Growth',
    diversification: 'Single Company (Concentrated)'
  },
  {
    id: 'stock-INFY',
    symbol: 'INFY',
    displayName: 'Infosys Ltd',
    name: 'Infosys Ltd',
    sector: 'IT Services / Tech',
    exchange: 'NSE',
    basePrice: 1840.10,
    return1M: 3.5,
    return6M: 12.8,
    return1Y: 21.4,
    returnLabelType: 'Historical Return',
    basePe: '26.8',
    baseMcap: '7,41,200 Cr',
    risk: 'High',
    minInv: '1 Share (~₹1,840)',
    minInvestmentNum: 1840,
    horizon: '3–5+ Years',
    suitability: 'Direct Equity Growth',
    diversification: 'Single Company (Concentrated)'
  },
  {
    id: 'stock-RELIANCE',
    symbol: 'RELIANCE',
    displayName: 'Reliance Industries Ltd',
    name: 'Reliance Industries Ltd',
    sector: 'Energy & Conglomerate',
    exchange: 'NSE',
    basePrice: 2980.50,
    return1M: 2.8,
    return6M: 9.6,
    return1Y: 18.9,
    returnLabelType: 'Historical Return',
    basePe: '24.5',
    baseMcap: '20,15,400 Cr',
    risk: 'Moderate',
    minInv: '1 Share (~₹2,980)',
    minInvestmentNum: 2980,
    horizon: '3–5+ Years',
    suitability: 'Bluechip Capital Growth',
    diversification: 'Single Company (Conglomerate)'
  },
  {
    id: 'stock-HDFCBANK',
    symbol: 'HDFCBANK',
    displayName: 'HDFC Bank Ltd',
    name: 'HDFC Bank Ltd',
    sector: 'Banking & Finance',
    exchange: 'NSE',
    basePrice: 1665.00,
    return1M: 1.9,
    return6M: 7.4,
    return1Y: 14.5,
    returnLabelType: 'Historical Return',
    basePe: '18.4',
    baseMcap: '12,65,100 Cr',
    risk: 'Moderate',
    minInv: '1 Share (~₹1,665)',
    minInvestmentNum: 1665,
    horizon: '3–5+ Years',
    suitability: 'Core Banking Compounding',
    diversification: 'Single Company (Banking)'
  },
  {
    id: 'stock-TATAMOTORS',
    symbol: 'TATAMOTORS',
    displayName: 'Tata Motors Ltd',
    name: 'Tata Motors Ltd',
    sector: 'Automotive / EV',
    exchange: 'NSE',
    basePrice: 1012.20,
    return1M: 5.8,
    return6M: 22.4,
    return1Y: 38.2,
    returnLabelType: 'Historical Return',
    basePe: '15.2',
    baseMcap: '3,85,600 Cr',
    risk: 'High',
    minInv: '1 Share (~₹1,012)',
    minInvestmentNum: 1012,
    horizon: '3–5+ Years',
    suitability: 'EV Sector Growth',
    diversification: 'Single Company (Automotive)'
  },
  {
    id: 'stock-ITC',
    symbol: 'ITC',
    displayName: 'ITC Ltd',
    name: 'ITC Ltd',
    sector: 'FMCG / Conglomerate',
    exchange: 'NSE',
    basePrice: 490.40,
    return1M: 1.8,
    return6M: 6.5,
    return1Y: 12.8,
    returnLabelType: 'Historical Return',
    basePe: '28.1',
    baseMcap: '6,10,400 Cr',
    risk: 'Low to Moderate',
    minInv: '1 Share (~₹490)',
    minInvestmentNum: 490,
    horizon: '2–4+ Years',
    suitability: 'Defensive & Dividend Yield',
    diversification: 'Single Company (FMCG)'
  },
  {
    id: 'stock-SBIN',
    symbol: 'SBIN',
    displayName: 'State Bank of India',
    name: 'State Bank of India',
    sector: 'Banking & PSU',
    exchange: 'NSE',
    basePrice: 824.50,
    return1M: 4.1,
    return6M: 16.2,
    return1Y: 28.6,
    returnLabelType: 'Historical Return',
    basePe: '9.8',
    baseMcap: '7,35,400 Cr',
    risk: 'Moderate',
    minInv: '1 Share (~₹825)',
    minInvestmentNum: 825,
    horizon: '3–5+ Years',
    suitability: 'PSU Banking Value',
    diversification: 'Single Company (PSU Bank)'
  }
];

// Top Mutual Funds
export const MUTUAL_FUNDS_UNIVERSE = [
  {
    id: 'mf-parag-parikh',
    symbol: 'PPFAS_FLEXI',
    displayName: 'Parag Parikh Flexi Cap Fund',
    name: 'Parag Parikh Flexi Cap Fund',
    fundHouse: 'PPFAS Mutual Fund',
    category: 'Flexi Cap Equity',
    return1M: 3.1,
    return6M: 12.2,
    return1Y: 22.8,
    returnLabelType: 'CAGR',
    expenseRatio: '0.58%',
    expenseRatioNum: 0.58,
    risk: 'Moderately High',
    minSip: '₹1,000 / mo',
    minInvestmentNum: 1000,
    aum: '₹62,100 Cr',
    horizon: '5–7+ Years',
    suitability: 'Automated Wealth Compounding',
    diversification: '35–50 Global & Indian Stocks'
  },
  {
    id: 'mf-nifty-50',
    symbol: 'UTI_NIFTY50',
    displayName: 'Nifty 50 Index Fund Direct-G',
    name: 'Nifty 50 Index Fund Direct-G',
    fundHouse: 'UTI Mutual Fund',
    category: 'Large Cap Index',
    return1M: 2.4,
    return6M: 9.8,
    return1Y: 18.4,
    returnLabelType: 'CAGR',
    expenseRatio: '0.12%',
    expenseRatioNum: 0.12,
    risk: 'Moderate',
    minSip: '₹500 / mo',
    minInvestmentNum: 500,
    aum: '₹16,450 Cr',
    horizon: '5+ Years',
    suitability: 'Low-Cost Market Growth',
    diversification: 'Top 50 Indian Bluechips'
  },
  {
    id: 'mf-sbi-smallcap',
    symbol: 'SBI_SMALLCAP',
    displayName: 'SBI Small Cap Fund Direct',
    name: 'SBI Small Cap Fund Direct',
    fundHouse: 'SBI Mutual Fund',
    category: 'Small Cap Equity',
    return1M: 4.6,
    return6M: 15.4,
    return1Y: 26.4,
    returnLabelType: 'CAGR',
    expenseRatio: '0.69%',
    expenseRatioNum: 0.69,
    risk: 'High',
    minSip: '₹500 / mo',
    minInvestmentNum: 500,
    aum: '₹28,900 Cr',
    horizon: '7+ Years',
    suitability: 'Aggressive Small-Cap Alpha',
    diversification: '50+ High-Growth Small Caps'
  },
  {
    id: 'mf-sbi-bluechip',
    symbol: 'SBI_BLUECHIP',
    displayName: 'SBI Bluechip Fund Direct-G',
    name: 'SBI Bluechip Fund Direct-G',
    fundHouse: 'SBI Mutual Fund',
    category: 'Large Cap Equity',
    return1M: 2.1,
    return6M: 8.9,
    return1Y: 16.8,
    returnLabelType: 'CAGR',
    expenseRatio: '0.82%',
    expenseRatioNum: 0.82,
    risk: 'Moderate',
    minSip: '₹500 / mo',
    minInvestmentNum: 500,
    aum: '₹44,200 Cr',
    horizon: '3–5+ Years',
    suitability: 'Stable Bluechip Appreciation',
    diversification: '40 Large Cap Leaders'
  },
  {
    id: 'mf-hdfc-debt',
    symbol: 'HDFC_CORPBOND',
    displayName: 'HDFC Corporate Bond Fund',
    name: 'HDFC Corporate Bond Fund',
    fundHouse: 'HDFC Mutual Fund',
    category: 'Corporate Debt',
    return1M: 0.7,
    return6M: 3.9,
    return1Y: 7.8,
    returnLabelType: 'CAGR',
    expenseRatio: '0.34%',
    expenseRatioNum: 0.34,
    risk: 'Low',
    minSip: '₹500 / mo',
    minInvestmentNum: 500,
    aum: '₹27,800 Cr',
    horizon: '1–3 Years',
    suitability: 'Capital Preservation & Safety',
    diversification: 'AAA Rated Corporate Bonds'
  }
];

// Curated IPO Universe
export const IPOS_UNIVERSE = [
  {
    id: 'ipo-premier',
    symbol: 'PREMIERENE',
    displayName: 'Premier Energies Ltd',
    name: 'Premier Energies Ltd',
    sector: 'Solar Energy / Manufacturing',
    priceBand: '₹427 - ₹450',
    issueSize: '₹2,830 Cr',
    return1M: 18.5,
    return6M: 48.0,
    return1Y: 88.0,
    returnLabelType: 'Estimated IPO Premium',
    gmpPct: 88.0,
    gmpLabel: '+88.0%',
    status: 'Open Now',
    minLot: '33 Shares (~₹14,850)',
    minInvestmentNum: 14850,
    risk: 'High',
    horizon: 'Listing Gain / 3–5 Yrs',
    suitability: 'Clean Energy IPO Alpha',
    diversification: 'Single Solar Enterprise'
  },
  {
    id: 'ipo-bajaj-housing',
    symbol: 'BAJAJHFL',
    displayName: 'Bajaj Housing Finance Ltd',
    name: 'Bajaj Housing Finance Ltd',
    sector: 'Housing Finance / NBFC',
    priceBand: '₹66 - ₹70',
    issueSize: '₹6,560 Cr',
    return1M: 24.0,
    return6M: 62.0,
    return1Y: 114.3,
    returnLabelType: 'Estimated IPO Premium',
    gmpPct: 114.3,
    gmpLabel: '+114.3%',
    status: 'Upcoming',
    minLot: '214 Shares (~₹14,980)',
    minInvestmentNum: 14980,
    risk: 'Moderate to High',
    horizon: 'Listing Gain / 3–5 Yrs',
    suitability: 'Bluechip Housing NBFC',
    diversification: 'Single Lending Enterprise'
  },
  {
    id: 'ipo-fintech-spark',
    symbol: 'FTSPARK',
    displayName: 'FinTech Spark India Ltd',
    name: 'FinTech Spark India Ltd',
    sector: 'FinTech / Payments',
    priceBand: '₹420 - ₹445',
    issueSize: '₹1,200 Cr',
    return1M: 8.2,
    return6M: 18.5,
    return1Y: 32.5,
    returnLabelType: 'Estimated IPO Premium',
    gmpPct: 32.5,
    gmpLabel: '+32.5%',
    status: 'Upcoming',
    minLot: '33 Shares (~₹14,685)',
    minInvestmentNum: 14685,
    risk: 'High',
    horizon: 'Listing Gain / 2–3 Yrs',
    suitability: 'FinTech Growth Play',
    diversification: 'Single Tech Startup'
  },
  {
    id: 'ipo-firstcry',
    symbol: 'FIRSTCRY',
    displayName: 'Brainbees Solutions (FirstCry)',
    name: 'Brainbees Solutions (FirstCry)',
    sector: 'E-Commerce / Retail',
    priceBand: '₹440 - ₹465',
    issueSize: '₹4,194 Cr',
    return1M: 9.5,
    return6M: 22.0,
    return1Y: 40.0,
    returnLabelType: 'Estimated IPO Premium',
    gmpPct: 40.0,
    gmpLabel: '+40.0%',
    status: 'Listed',
    minLot: '32 Shares (~₹14,880)',
    minInvestmentNum: 14880,
    risk: 'High',
    horizon: '3–5 Years',
    suitability: 'Consumer Tech Ecommerce',
    diversification: 'Single Retail Network'
  }
];

// Seedable pseudo-random helper for deterministic historical curves
const getSeedRandom = (seedString) => {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
};

/**
 * Generates daily historical price points where 1M, 6M, and 1Y periods
 * are mathematically consistent with the respective return figures.
 */
export const generateAssetHistory = (symbol, return1Y = 15.0, return6M = 8.0, return1M = 2.0, daysCount = 365) => {
  const history = [];
  const rand = getSeedRandom(symbol + '_comp_v3');
  const today = new Date();

  // Target prices anchored to Base = 100 at 1Y start (index 0 of 250 trading days)
  const p1YStart = 100.0;
  const pToday = p1YStart * (1 + return1Y / 100);
  const p6MStart = pToday / (1 + (return6M || return1Y * 0.5) / 100);
  const p1MStart = pToday / (1 + (return1M || return1Y * 0.15) / 100);

  // Approximate trading day indices: 0 -> p1YStart, 120 -> p6MStart, 228 -> p1MStart, 250 -> pToday
  const tradingPoints = [];
  let currentPrice = p1YStart;
  const totalTradingDays = 250;

  for (let dayIdx = 0; dayIdx <= totalTradingDays; dayIdx++) {
    let target = pToday;
    if (dayIdx < 120) {
      const progress = dayIdx / 120;
      target = p1YStart + (p6MStart - p1YStart) * progress;
    } else if (dayIdx < 228) {
      const progress = (dayIdx - 120) / (228 - 120);
      target = p6MStart + (p1MStart - p6MStart) * progress;
    } else {
      const progress = (dayIdx - 228) / (totalTradingDays - 228);
      target = p1MStart + (pToday - p1MStart) * progress;
    }

    const noise = (rand() - 0.5) * 0.008 * target;
    const finalPrice = dayIdx === totalTradingDays ? pToday : (dayIdx === 0 ? p1YStart : target + noise);
    tradingPoints.push(Number(finalPrice.toFixed(2)));
  }

  // Map to actual dates excluding weekends
  let ptIdx = totalTradingDays;
  for (let i = 0; i < daysCount && ptIdx >= 0; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dayStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    const priceVal = tradingPoints[ptIdx] || 100.0;
    ptIdx--;

    history.push({
      date: dayStr,
      rawDate: d,
      price: priceVal
    });
  }

  return history.reverse();
};

/**
 * Fetches live stock quote from Angel One broker endpoint.
 */
export async function fetchLiveStockQuote(symbol) {
  try {
    const response = await fetch('/api/broker/angelone/stock-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: symbol.toUpperCase(), demo: false })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data && data.ltp) {
      return {
        symbol: symbol.toUpperCase(),
        price: Number(data.ltp),
        isLive: data.source === 'live_angelone',
        source: data.source || 'live_angelone'
      };
    }
  } catch (e) {
    // Graceful fallback to benchmark
  }

  const base = STOCKS_UNIVERSE.find((s) => s.symbol === symbol.toUpperCase());
  return {
    symbol: symbol.toUpperCase(),
    price: base ? base.basePrice : 1500,
    isLive: false,
    source: 'benchmark'
  };
}

/**
 * Unifies search across Stocks, Mutual Funds, and IPOs.
 */
export function searchAllInvestments(query, filterType = 'all') {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [];

  // 1. Search Stocks
  if (filterType === 'all' || filterType === 'stocks') {
    STOCKS_UNIVERSE.forEach((s) => {
      if (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          type: 'stock',
          key: s.symbol,
          symbol: s.symbol,
          name: s.displayName,
          displayName: s.displayName,
          subtext: `${s.sector} · NSE`,
          badge: 'Stock',
          badgeVariant: 'default',
          priceDisplay: `₹${s.basePrice.toLocaleString('en-IN')}`,
          return1Y: s.return1Y,
          rawItem: s
        });
      }
    });
  }

  // 2. Search Mutual Funds
  if (filterType === 'all' || filterType === 'mf') {
    MUTUAL_FUNDS_UNIVERSE.forEach((mf) => {
      if (
        mf.name.toLowerCase().includes(q) ||
        mf.fundHouse.toLowerCase().includes(q) ||
        mf.category.toLowerCase().includes(q) ||
        mf.symbol.toLowerCase().includes(q)
      ) {
        results.push({
          id: mf.id,
          type: 'mf',
          key: mf.id,
          symbol: mf.symbol,
          name: mf.displayName,
          displayName: mf.displayName,
          subtext: `${mf.fundHouse} · ${mf.category}`,
          badge: 'Mutual Fund',
          badgeVariant: 'purple',
          priceDisplay: `${mf.minSip}`,
          return1Y: mf.return1Y,
          rawItem: mf
        });
      }
    });
  }

  // 3. Search IPOs
  if (filterType === 'all' || filterType === 'ipos') {
    IPOS_UNIVERSE.forEach((ipo) => {
      if (ipo.name.toLowerCase().includes(q) || ipo.symbol.toLowerCase().includes(q) || ipo.sector.toLowerCase().includes(q)) {
        results.push({
          id: ipo.id,
          type: 'ipo',
          key: ipo.id,
          symbol: ipo.symbol,
          name: ipo.displayName,
          displayName: ipo.displayName,
          subtext: `${ipo.sector} · ${ipo.status}`,
          badge: 'IPO',
          badgeVariant: 'warning',
          priceDisplay: `${ipo.priceBand}`,
          return1Y: ipo.return1Y,
          rawItem: ipo
        });
      }
    });
  }

  return results;
}

/**
 * Maps risk string to numeric score 1 (Low) - 5 (Very High) for the visual risk gauge.
 */
export function getRiskScore(riskStr) {
  const lower = (riskStr || '').toLowerCase();
  if (lower.includes('low') && !lower.includes('moderate')) return 1;
  if (lower.includes('low to moderate') || (lower.includes('moderate') && !lower.includes('high'))) return 2;
  if (lower.includes('moderately high') || lower.includes('moderate to high')) return 3;
  if (lower.includes('high') && !lower.includes('very')) return 4;
  if (lower.includes('very high')) return 5;
  return 3;
}

/**
 * Loads unified canonical comparison data for any combination of selected items.
 */
export async function loadUnifiedComparison(selectedItems) {
  if (!Array.isArray(selectedItems) || selectedItems.length === 0) return [];

  const results = await Promise.all(
    selectedItems.map(async (item) => {
      // 1. Stock Data Resolution
      if (item.type === 'stock') {
        const base = STOCKS_UNIVERSE.find((s) => s.symbol === item.key || s.id === item.key) || item.rawItem || {
          id: `stock-${item.key}`,
          symbol: item.key,
          displayName: item.name || item.key,
          basePrice: 1000,
          return1M: 2.0,
          return6M: 8.0,
          return1Y: 15.0,
          returnLabelType: 'Historical Return',
          basePe: '20.0',
          risk: 'High',
          minInv: '1 Share',
          minInvestmentNum: 1000,
          horizon: '3–5+ Years',
          suitability: 'Direct Equity Growth',
          diversification: 'Single Company (Concentrated)'
        };

        const quote = await fetchLiveStockQuote(base.symbol);
        const history = generateAssetHistory(base.symbol, base.return1Y, base.return6M, base.return1M, 365);

        return {
          id: base.id || `stock-${base.symbol}`,
          type: 'stock',
          assetType: 'stock',
          key: base.symbol,
          symbol: base.symbol,
          displayName: base.displayName || base.name,
          name: base.displayName || base.name,
          typeBadge: 'Stock (NSE)',
          priceDisplay: `₹${quote.price.toLocaleString('en-IN')}`,
          isLive: quote.isLive,
          return1M: Number(base.return1M || (base.return1Y * 0.16).toFixed(1)),
          return6M: Number(base.return6M || (base.return1Y * 0.58).toFixed(1)),
          return1Y: Number(base.return1Y),
          returnDisplay: `+${base.return1Y}%`,
          returnLabelType: base.returnLabelType || 'Historical Return',
          risk: base.risk,
          riskScore: getRiskScore(base.risk),
          cost: 'Zero Brokerage / STT only',
          liquidity: 'High (T+1 Instant Trading)',
          diversification: base.diversification || 'Single Company (Concentrated)',
          minInvestment: base.minInv,
          minInvestmentNum: base.minInvestmentNum || 1000,
          horizon: base.horizon,
          suitability: base.suitability,
          valuationType: 'P/E Multiple',
          valuationDisplay: base.basePe ? `${base.basePe}x P/E` : 'N/A',
          valuationNumeric: base.basePe ? Number(base.basePe) : 20.0,
          peRatio: base.basePe ? Number(base.basePe) : null,
          history
        };
      }

      // 2. Mutual Fund Data Resolution
      if (item.type === 'mf') {
        const mf = MUTUAL_FUNDS_UNIVERSE.find((m) => m.id === item.key || m.symbol === item.key) || item.rawItem || {
          id: item.key,
          displayName: item.name || 'Mutual Fund',
          symbol: item.symbol || 'MF',
          return1M: 2.0,
          return6M: 8.0,
          return1Y: 16.0,
          returnLabelType: 'CAGR',
          expenseRatio: '0.50%',
          expenseRatioNum: 0.5,
          risk: 'Moderate',
          minSip: '₹500 / mo',
          minInvestmentNum: 500,
          horizon: '5+ Years',
          suitability: 'Diversified Investing',
          diversification: '30–50 Stocks'
        };

        const history = generateAssetHistory(mf.symbol, mf.return1Y, mf.return6M, mf.return1M, 365);

        return {
          id: mf.id,
          type: 'mf',
          assetType: 'mf',
          key: mf.id,
          symbol: mf.symbol,
          displayName: mf.displayName || mf.name,
          name: mf.displayName || mf.name,
          typeBadge: 'Mutual Fund',
          priceDisplay: `Min SIP: ${mf.minSip}`,
          isLive: true,
          return1M: Number(mf.return1M || (mf.return1Y * 0.14).toFixed(1)),
          return6M: Number(mf.return6M || (mf.return1Y * 0.52).toFixed(1)),
          return1Y: Number(mf.return1Y),
          returnDisplay: `+${mf.return1Y}% CAGR`,
          returnLabelType: mf.returnLabelType || 'CAGR',
          risk: mf.risk,
          riskScore: getRiskScore(mf.risk),
          cost: `${mf.expenseRatio} Expense Ratio`,
          liquidity: 'High (T+2 NAV Settlement)',
          diversification: mf.diversification || '35–50 Diversified Stocks',
          minInvestment: mf.minSip,
          minInvestmentNum: mf.minInvestmentNum || 500,
          horizon: mf.horizon,
          suitability: mf.suitability,
          valuationType: 'Expense Ratio (TER)',
          valuationDisplay: `${mf.expenseRatio} TER`,
          valuationNumeric: mf.expenseRatioNum || 0.5,
          peRatio: null,
          history
        };
      }

      // 3. IPO Data Resolution
      if (item.type === 'ipo') {
        const ipo = IPOS_UNIVERSE.find((i) => i.id === item.key || i.symbol === item.key) || item.rawItem || {
          id: item.key,
          displayName: item.name || 'IPO Enterprise',
          symbol: item.symbol || 'IPO',
          priceBand: '₹400 - ₹450',
          return1M: 10.0,
          return6M: 20.0,
          return1Y: 30.0,
          returnLabelType: 'Estimated IPO Premium',
          gmpPct: 30.0,
          gmpLabel: '+30.0%',
          minLot: '1 Lot',
          minInvestmentNum: 14000,
          risk: 'High',
          horizon: 'Listing Gain',
          suitability: 'Primary Market Alpha',
          diversification: 'Single Enterprise'
        };

        const history = generateAssetHistory(ipo.symbol, ipo.return1Y, ipo.return6M, ipo.return1M, 365);

        return {
          id: ipo.id,
          type: 'ipo',
          assetType: 'ipo',
          key: ipo.id,
          symbol: ipo.symbol,
          displayName: ipo.displayName || ipo.name,
          name: ipo.displayName || ipo.name,
          typeBadge: 'IPO Radar',
          priceDisplay: ipo.priceBand,
          isLive: true,
          return1M: Number(ipo.return1M || (ipo.return1Y * 0.3).toFixed(1)),
          return6M: Number(ipo.return6M || (ipo.return1Y * 0.65).toFixed(1)),
          return1Y: Number(ipo.return1Y),
          returnDisplay: `${ipo.gmpLabel} GMP`,
          returnLabelType: ipo.returnLabelType || 'Estimated IPO Premium',
          risk: ipo.risk,
          riskScore: getRiskScore(ipo.risk),
          cost: 'Nil Entry / Brokerage',
          liquidity: 'Locked until Listing (T+3)',
          diversification: ipo.diversification || 'Single New Enterprise',
          minInvestment: ipo.minLot,
          minInvestmentNum: ipo.minInvestmentNum || 14000,
          horizon: ipo.horizon,
          suitability: ipo.suitability,
          valuationType: 'GMP / Issue Valuation',
          valuationDisplay: `${ipo.gmpLabel} GMP`,
          valuationNumeric: ipo.gmpPct || 30.0,
          peRatio: null,
          history
        };
      }

      return null;
    })
  );

  return results.filter(Boolean);
}

/**
 * Generates 2–3 dynamic, beginner-friendly key takeaways strictly derived from currently selected items.
 */
export function generateKeyDifferences(items) {
  if (!Array.isArray(items) || items.length < 2) return [];

  const points = [];
  const types = new Set(items.map((i) => i.type));
  const isCrossAsset = types.size > 1;

  // 1. Cross-Asset Comparison Takeaway (Strictly using selected items)
  if (isCrossAsset) {
    const stock = items.find((i) => i.type === 'stock');
    const mf = items.find((i) => i.type === 'mf');
    const ipo = items.find((i) => i.type === 'ipo');

    if (stock && mf) {
      points.push(
        `${stock.displayName} offers direct equity upside with higher volatility, while ${mf.displayName} provides built-in diversification across dozens of companies at a lower entry barrier (${mf.minInvestment}).`
      );
    } else if (ipo && stock) {
      points.push(
        `${ipo.displayName} carries primary market listing-day opportunity (${ipo.returnDisplay}) compared to liquid secondary market trading in ${stock.displayName}.`
      );
    } else if (ipo && mf) {
      points.push(
        `${ipo.displayName} carries primary listing opportunity (${ipo.returnDisplay}) but requires full lot commitment (${ipo.minInvestment}), unlike diversified SIP compounding in ${mf.displayName}.`
      );
    }
  }

  // 2. Risk Differential Relationship
  const sortedByRisk = [...items].sort((a, b) => a.riskScore - b.riskScore);
  const lowestRisk = sortedByRisk[0];
  const highestRisk = sortedByRisk[sortedByRisk.length - 1];

  if (lowestRisk && highestRisk && lowestRisk.id !== highestRisk.id) {
    points.push(
      `${lowestRisk.displayName} is the most defensive option (${lowestRisk.risk} Risk), whereas ${highestRisk.displayName} carries the highest risk profile (${highestRisk.risk} Risk).`
    );
  }

  // 3. Return Leader Takeaway
  const sortedByReturn = [...items].sort((a, b) => (b.return1Y || 0) - (a.return1Y || 0));
  if (sortedByReturn[0] && !points.some((p) => p.includes(sortedByReturn[0].displayName))) {
    points.push(
      `${sortedByReturn[0].displayName} leads the cohort in 1-year historical gain / GMP (${sortedByReturn[0].returnDisplay}).`
    );
  }

  return points.slice(0, 3);
}
