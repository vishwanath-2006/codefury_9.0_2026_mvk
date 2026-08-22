/**
 * FINLABS UNIFIED MULTI-ASSET COMPARISON SERVICE
 * Supports Stocks, Mutual Funds, and IPOs comparison with normalized decision metrics.
 */

import { mockMutualFunds } from '../mock/finlabsMockData';

// Top Indian Equities (NSE Bluechips)
export const STOCKS_UNIVERSE = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT Services / Tech', exchange: 'NSE', basePrice: 4120.25, base1Y: 24.8, basePe: '31.2', baseMcap: '15,08,100 Cr', risk: 'High', minInv: '1 Share (~₹4,120)', horizon: '3–5+ Years', suitability: 'Direct Equity Growth' },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT Services / Tech', exchange: 'NSE', basePrice: 1840.10, base1Y: 21.4, basePe: '26.8', baseMcap: '7,41,200 Cr', risk: 'High', minInv: '1 Share (~₹1,840)', horizon: '3–5+ Years', suitability: 'Direct Equity Growth' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy & Conglomerate', exchange: 'NSE', basePrice: 2980.50, base1Y: 18.9, basePe: '24.5', baseMcap: '20,15,400 Cr', risk: 'Moderate', minInv: '1 Share (~₹2,980)', horizon: '3–5+ Years', suitability: 'Bluechip Capital Growth' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', basePrice: 1665.00, base1Y: 14.5, basePe: '18.4', baseMcap: '12,65,100 Cr', risk: 'Moderate', minInv: '1 Share (~₹1,665)', horizon: '3–5+ Years', suitability: 'Core Banking Compounding' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automotive / EV', exchange: 'NSE', basePrice: 1012.20, base1Y: 38.2, basePe: '15.2', baseMcap: '3,85,600 Cr', risk: 'High', minInv: '1 Share (~₹1,012)', horizon: '3–5+ Years', suitability: 'EV Sector Growth' },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG / Conglomerate', exchange: 'NSE', basePrice: 490.40, base1Y: 12.8, basePe: '28.1', baseMcap: '6,10,400 Cr', risk: 'Low to Moderate', minInv: '1 Share (~₹490)', horizon: '2–4+ Years', suitability: 'Defensive & Dividend Yield' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking & PSU', exchange: 'NSE', basePrice: 824.50, base1Y: 28.6, basePe: '9.8', baseMcap: '7,35,400 Cr', risk: 'Moderate', minInv: '1 Share (~₹825)', horizon: '3–5+ Years', suitability: 'PSU Banking Value' }
];

// Top Mutual Funds (Index, Flexi Cap, Small Cap, Bluechip, Debt)
export const MUTUAL_FUNDS_UNIVERSE = [
  { id: 'mf-parag-parikh', symbol: 'PPFAS_FLEXI', name: 'Parag Parikh Flexi Cap Fund', fundHouse: 'PPFAS Mutual Fund', category: 'Flexi Cap Equity', return1Y: 22.8, expenseRatio: '0.58%', risk: 'Moderately High', minSip: '₹1,000 / mo', aum: '₹62,100 Cr', horizon: '5–7+ Years', suitability: 'Automated Wealth Compounding', diversification: '35–50 Global & Indian Stocks' },
  { id: 'mf-nifty-50', symbol: 'UTI_NIFTY50', name: 'Nifty 50 Index Fund Direct-G', fundHouse: 'UTI Mutual Fund', category: 'Large Cap Index', return1Y: 18.4, expenseRatio: '0.12%', risk: 'Moderate', minSip: '₹500 / mo', aum: '₹16,450 Cr', horizon: '5+ Years', suitability: 'Low-Cost Market Growth', diversification: 'Top 50 Indian Bluechips' },
  { id: 'mf-sbi-smallcap', symbol: 'SBI_SMALLCAP', name: 'SBI Small Cap Fund Direct', fundHouse: 'SBI Mutual Fund', category: 'Small Cap Equity', return1Y: 26.4, expenseRatio: '0.69%', risk: 'High', minSip: '₹500 / mo', aum: '₹28,900 Cr', horizon: '7+ Years', suitability: 'Aggressive Small-Cap Alpha', diversification: '50+ High-Growth Small Caps' },
  { id: 'mf-sbi-bluechip', symbol: 'SBI_BLUECHIP', name: 'SBI Bluechip Fund Direct-G', fundHouse: 'SBI Mutual Fund', category: 'Large Cap Equity', return1Y: 16.8, expenseRatio: '0.82%', risk: 'Moderate', minSip: '₹500 / mo', aum: '₹44,200 Cr', horizon: '3–5+ Years', suitability: 'Stable Bluechip Appreciation', diversification: '40 Large Cap Leaders' },
  { id: 'mf-hdfc-debt', symbol: 'HDFC_CORPBOND', name: 'HDFC Corporate Bond Fund', fundHouse: 'HDFC Mutual Fund', category: 'Corporate Debt', return1Y: 7.8, expenseRatio: '0.34%', risk: 'Low', minSip: '₹500 / mo', aum: '₹27,800 Cr', horizon: '1–3 Years', suitability: 'Capital Preservation & Safety', diversification: 'AAA Rated Corporate Bonds' }
];

// Curated IPO Universe
export const IPOS_UNIVERSE = [
  { id: 'ipo-premier', symbol: 'PREMIERENE', name: 'Premier Energies Ltd', sector: 'Solar Energy / Manufacturing', priceBand: '₹427 - ₹450', issueSize: '₹2,830 Cr', gmpPct: 88.0, gmpLabel: '+88.0%', status: 'Open Now', minLot: '33 Shares (~₹14,850)', risk: 'High', horizon: 'Listing Gain / 3–5 Yrs', suitability: 'Clean Energy IPO Alpha', diversification: 'Single Solar Enterprise' },
  { id: 'ipo-bajaj-housing', symbol: 'BAJAJHFL', name: 'Bajaj Housing Finance Ltd', sector: 'Housing Finance / NBFC', priceBand: '₹66 - ₹70', issueSize: '₹6,560 Cr', gmpPct: 114.3, gmpLabel: '+114.3%', status: 'Upcoming', minLot: '214 Shares (~₹14,980)', risk: 'Moderate to High', horizon: 'Listing Gain / 3–5 Yrs', suitability: 'Bluechip Housing NBFC', diversification: 'Single Lending Enterprise' },
  { id: 'ipo-fintech-spark', symbol: 'FTSPARK', name: 'FinTech Spark India Ltd', sector: 'FinTech / Payments', priceBand: '₹420 - ₹445', issueSize: '₹1,200 Cr', gmpPct: 32.5, gmpLabel: '+32.5%', status: 'Upcoming', minLot: '33 Shares (~₹14,685)', risk: 'High', horizon: 'Listing Gain / 2–3 Yrs', suitability: 'FinTech Growth Play', diversification: 'Single Tech Startup' },
  { id: 'ipo-firstcry', symbol: 'FIRSTCRY', name: 'Brainbees Solutions (FirstCry)', sector: 'E-Commerce / Retail', priceBand: '₹440 - ₹465', issueSize: '₹4,194 Cr', gmpPct: 40.0, gmpLabel: '+40.0%', status: 'Listed', minLot: '32 Shares (~₹14,880)', risk: 'High', horizon: '3–5 Years', suitability: 'Consumer Tech Ecommerce', diversification: 'Single Retail Network' }
];

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
          id: `stock-${s.symbol}`,
          type: 'stock',
          key: s.symbol,
          symbol: s.symbol,
          name: s.name,
          subtext: `${s.sector} · NSE`,
          badge: 'Stock',
          badgeVariant: 'default',
          priceDisplay: `₹${s.basePrice.toLocaleString('en-IN')}`,
          return1Y: s.base1Y,
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
          name: mf.name,
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
          name: ipo.name,
          subtext: `${ipo.sector} · ${ipo.status}`,
          badge: 'IPO',
          badgeVariant: 'warning',
          priceDisplay: `${ipo.priceBand}`,
          return1Y: ipo.gmpPct,
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
  if (lower.includes('low to moderate') || lower.includes('moderate') && !lower.includes('high')) return 2;
  if (lower.includes('moderately high') || lower.includes('moderate to high')) return 3;
  if (lower.includes('high') && !lower.includes('very')) return 4;
  if (lower.includes('very high')) return 5;
  return 3;
}

/**
 * Loads unified comparison data for any combination of selected items.
 */
export async function loadUnifiedComparison(selectedItems) {
  if (!Array.isArray(selectedItems) || selectedItems.length === 0) return [];

  const results = await Promise.all(
    selectedItems.map(async (item) => {
      if (item.type === 'stock') {
        const base = STOCKS_UNIVERSE.find((s) => s.symbol === item.key) || item.rawItem || {
          symbol: item.key,
          name: item.name || item.key,
          basePrice: 1000,
          base1Y: 15.0,
          risk: 'High',
          minInv: '1 Share',
          horizon: '3–5+ Years',
          suitability: 'Direct Equity Growth'
        };

        const quote = await fetchLiveStockQuote(base.symbol);

        return {
          id: `stock-${base.symbol}`,
          type: 'stock',
          key: base.symbol,
          symbol: base.symbol,
          name: base.name,
          typeBadge: 'Stock (NSE)',
          priceDisplay: `₹${quote.price.toLocaleString('en-IN')}`,
          isLive: quote.isLive,
          return1Y: base.base1Y,
          returnDisplay: `+${base.base1Y}%`,
          risk: base.risk,
          riskScore: getRiskScore(base.risk),
          cost: 'Zero Brokerage / STT only',
          liquidity: 'High (T+1 Instant Trading)',
          diversification: 'Single Company (Concentrated)',
          minInvestment: base.minInv,
          horizon: base.horizon,
          suitability: base.suitability,
          specificMetric: base.basePe ? `P/E: ${base.basePe}x` : null
        };
      }

      if (item.type === 'mf') {
        const mf = MUTUAL_FUNDS_UNIVERSE.find((m) => m.id === item.key || m.symbol === item.key) || item.rawItem || {
          name: item.name,
          symbol: item.symbol || 'MF',
          return1Y: 16.0,
          expenseRatio: '0.50%',
          risk: 'Moderate',
          minSip: '₹500 / mo',
          horizon: '5+ Years',
          suitability: 'Diversified Investing',
          diversification: '30–50 Stocks'
        };

        return {
          id: mf.id,
          type: 'mf',
          key: mf.id,
          symbol: mf.symbol,
          name: mf.name,
          typeBadge: 'Mutual Fund',
          priceDisplay: `Min SIP: ${mf.minSip}`,
          isLive: true,
          return1Y: mf.return1Y,
          returnDisplay: `+${mf.return1Y}% CAGR`,
          risk: mf.risk,
          riskScore: getRiskScore(mf.risk),
          cost: `${mf.expenseRatio} Expense Ratio`,
          liquidity: 'High (T+2 NAV Settlement)',
          diversification: mf.diversification || '35–50 Diversified Stocks',
          minInvestment: mf.minSip,
          horizon: mf.horizon,
          suitability: mf.suitability,
          specificMetric: `AUM: ${mf.aum || 'N/A'}`
        };
      }

      if (item.type === 'ipo') {
        const ipo = IPOS_UNIVERSE.find((i) => i.id === item.key || i.symbol === item.key) || item.rawItem || {
          name: item.name,
          symbol: item.symbol || 'IPO',
          priceBand: '₹400 - ₹450',
          gmpPct: 30.0,
          gmpLabel: '+30.0%',
          minLot: '1 Lot',
          risk: 'High',
          horizon: 'Listing Gain',
          suitability: 'Primary Market Alpha'
        };

        return {
          id: ipo.id,
          type: 'ipo',
          key: ipo.id,
          symbol: ipo.symbol,
          name: ipo.name,
          typeBadge: 'IPO Radar',
          priceDisplay: ipo.priceBand,
          isLive: true,
          return1Y: ipo.gmpPct,
          returnDisplay: `${ipo.gmpLabel} GMP`,
          risk: ipo.risk,
          riskScore: getRiskScore(ipo.risk),
          cost: 'Nil Entry / Brokerage',
          liquidity: 'Locked until Listing (T+3)',
          diversification: ipo.diversification || 'Single New Enterprise',
          minInvestment: ipo.minLot,
          horizon: ipo.horizon,
          suitability: ipo.suitability,
          specificMetric: `Issue: ${ipo.issueSize || 'N/A'}`
        };
      }

      return null;
    })
  );

  return results.filter(Boolean);
}

/**
 * Generates 2–4 concise, beginner-friendly key takeaways.
 */
export function generateKeyDifferences(items) {
  if (!Array.isArray(items) || items.length < 2) return [];

  const points = [];
  const types = new Set(items.map((i) => i.type));
  const isCrossAsset = types.size > 1;

  // 1. Cross-Asset Comparison Takeaway
  if (isCrossAsset) {
    const hasStock = items.some((i) => i.type === 'stock');
    const hasMf = items.some((i) => i.type === 'mf');
    const hasIpo = items.some((i) => i.type === 'ipo');

    if (hasStock && hasMf) {
      const stock = items.find((i) => i.type === 'stock');
      const mf = items.find((i) => i.type === 'mf');
      points.push(
        `${stock.name} offers direct stock upside with higher volatility, while ${mf.name} provides built-in diversification across dozens of companies at a lower entry barrier (${mf.minInvestment}).`
      );
    }

    if (hasIpo) {
      const ipo = items.find((i) => i.type === 'ipo');
      points.push(
        `${ipo.name} carries primary market listing-day opportunity (${ipo.returnDisplay}) but requires full lot commitment (${ipo.minInvestment}).`
      );
    }
  }

  // 2. Risk & Return Relationship
  const sortedByRisk = [...items].sort((a, b) => a.riskScore - b.riskScore);
  const lowestRisk = sortedByRisk[0];
  const highestRisk = sortedByRisk[sortedByRisk.length - 1];

  if (lowestRisk.id !== highestRisk.id) {
    points.push(
      `${lowestRisk.name} is the most defensive option (${lowestRisk.risk} Risk), whereas ${highestRisk.name} has the highest risk profile.`
    );
  }

  // 3. Minimum Entry Barrier
  const sortedByReturn = [...items].sort((a, b) => b.return1Y - a.return1Y);
  if (sortedByReturn[0] && !points.some((p) => p.includes(sortedByReturn[0].name))) {
    points.push(
      `${sortedByReturn[0].name} leads the cohort in 1-year historical return / GMP (${sortedByReturn[0].returnDisplay}).`
    );
  }

  return points.slice(0, 3);
}
