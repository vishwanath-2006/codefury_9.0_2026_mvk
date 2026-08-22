import React, { useRef, useEffect, useState, useMemo } from 'react';

const SERIES_COLORS = [
  { stroke: '#10b981', name: 'Emerald', hex: '#10b981' }, // 1st: Emerald
  { stroke: '#06b6d4', name: 'Cyan', hex: '#06b6d4' },    // 2nd: Cyan
  { stroke: '#6366f1', name: 'Indigo', hex: '#6366f1' },  // 3rd: Indigo
  { stroke: '#f59e0b', name: 'Amber', hex: '#f59e0b' },   // 4th: Amber
  { stroke: '#f43f5e', name: 'Rose', hex: '#f43f5e' }     // 5th: Rose
];

export default function MultiAssetLineChart({ items = [], timeFilter = '1Y' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Prepare normalized time-series data (base = 100 at start of period)
  const normalizedSeries = useMemo(() => {
    if (!items || items.length === 0) return [];

    let daysToSlice = 250;
    if (timeFilter === '1M') daysToSlice = 22;
    if (timeFilter === '6M') daysToSlice = 130;
    if (timeFilter === '1Y') daysToSlice = 250;

    return items.map((item, itemIdx) => {
      const color = SERIES_COLORS[itemIdx % SERIES_COLORS.length];
      const rawHistory = item.history || [];
      const sliced = rawHistory.slice(-daysToSlice);

      if (sliced.length === 0) return { symbol: item.symbol, color, points: [] };

      const basePrice = Number(sliced[0].price) || 1;

      const points = sliced.map((pt) => {
        const currentPrice = Number(pt.price);
        const normalizedVal = Number(((currentPrice / basePrice) * 100).toFixed(2));
        const returnPct = Number((((currentPrice - basePrice) / basePrice) * 100).toFixed(2));
        return {
          date: pt.date,
          price: currentPrice,
          normalizedVal,
          returnPct
        };
      });

      return {
        symbol: item.symbol,
        name: item.name,
        color,
        points
      };
    });
  }, [items, timeFilter]);

  // Compute common min and max across all series for proper scaling
  const { minVal, maxVal, dataLength } = useMemo(() => {
    if (normalizedSeries.length === 0) return { minVal: 90, maxVal: 110, dataLength: 0 };

    let min = Infinity;
    let max = -Infinity;
    let maxLen = 0;

    normalizedSeries.forEach((s) => {
      if (s.points.length > maxLen) maxLen = s.points.length;
      s.points.forEach((p) => {
        if (p.normalizedVal < min) min = p.normalizedVal;
        if (p.normalizedVal > max) max = p.normalizedVal;
      });
    });

    if (min === Infinity) min = 95;
    if (max === -Infinity) max = 105;

    const pad = Math.max(2, (max - min) * 0.08);
    return {
      minVal: Math.max(0, min - pad),
      maxVal: max + pad,
      dataLength: maxLen
    };
  }, [normalizedSeries]);

  // Render on HTML5 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || normalizedSeries.length === 0 || dataLength === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(226, 232, 240, 0.8)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;
    const yRange = maxVal - minVal || 1;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw horizontal grid lines and baseline (100)
    const gridLines = 5;
    ctx.font = '10px monospace';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let j = 0; j <= gridLines; j++) {
      const val = minVal + (yRange * j) / gridLines;
      const y = height - paddingBottom - (plotHeight * j) / gridLines;

      ctx.beginPath();
      ctx.strokeStyle = Math.abs(val - 100) < 1.5 ? (isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.5)') : gridColor;
      ctx.lineWidth = Math.abs(val - 100) < 1.5 ? 1.5 : 1;
      if (Math.abs(val - 100) < 1.5) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText(val.toFixed(1), paddingLeft - 8, y);
    }

    // Coordinate conversion helper
    const getCoords = (index, val, totalPoints) => {
      const x = paddingLeft + (plotWidth * index) / Math.max(1, totalPoints - 1);
      const y = height - paddingBottom - ((val - minVal) / yRange) * plotHeight;
      return { x, y };
    };

    // 2. Draw lines for each series
    normalizedSeries.forEach((series) => {
      const pts = series.points;
      if (pts.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = series.color.hex;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const first = getCoords(0, pts[0].normalizedVal, pts.length);
      ctx.moveTo(first.x, first.y);

      for (let k = 1; k < pts.length; k++) {
        const c = getCoords(k, pts[k].normalizedVal, pts.length);
        ctx.lineTo(c.x, c.y);
      }
      ctx.stroke();
    });

    // 3. Draw X-axis date labels
    const refPoints = normalizedSeries[0]?.points || [];
    if (refPoints.length > 1) {
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const labelIndices = [
        0,
        Math.floor((refPoints.length - 1) * 0.33),
        Math.floor((refPoints.length - 1) * 0.66),
        refPoints.length - 1
      ];

      labelIndices.forEach((idx) => {
        if (refPoints[idx]) {
          const pt = getCoords(idx, minVal, refPoints.length);
          ctx.fillText(refPoints[idx].date, pt.x, height - paddingBottom + 8);
        }
      });
    }

    // 4. Draw interactive crosshair and dots
    if (hoverIndex !== null && refPoints.length > 0 && hoverIndex < refPoints.length) {
      const refCoord = getCoords(hoverIndex, minVal, refPoints.length);

      // Vertical line
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(refCoord.x, paddingTop);
      ctx.lineTo(refCoord.x, height - paddingBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dots on each series
      normalizedSeries.forEach((series) => {
        const p = series.points[hoverIndex];
        if (!p) return;
        const pt = getCoords(hoverIndex, p.normalizedVal, series.points.length);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = series.color.hex;
        ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }
  }, [normalizedSeries, minVal, maxVal, dataLength, hoverIndex]);

  // Pointer move handler
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || normalizedSeries.length === 0 || dataLength === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingLeft = 45;
    const paddingRight = 20;
    const plotWidth = rect.width - paddingLeft - paddingRight;

    const relativeX = x - paddingLeft;
    if (relativeX < 0 || relativeX > plotWidth) {
      setHoverIndex(null);
      return;
    }

    const percent = relativeX / plotWidth;
    const idx = Math.max(0, Math.min(dataLength - 1, Math.round(percent * (dataLength - 1))));

    setHoverIndex(idx);
    setHoverPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const hoveredDate = normalizedSeries[0]?.points[hoverIndex]?.date || '';

  return (
    <div className="space-y-3">
      {/* Legend and Base Note */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {normalizedSeries.map((s) => (
            <div key={s.symbol} className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color.hex }} />
              <span className="text-slate-800 dark:text-slate-200">{s.symbol}</span>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Baseline Index = 100 at start of {timeFilter}
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none bg-slate-950/40 rounded-xl p-2 border border-slate-800/60">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair block w-full"
        />

        {/* Multi-series Tooltip without ₹ currency symbol */}
        {hoverIndex !== null && hoveredDate && (
          <div
            className="absolute z-20 pointer-events-none p-3 bg-slate-900/95 text-white rounded-xl shadow-xl text-xs font-semibold leading-tight flex flex-col gap-1.5 border border-slate-700/80 backdrop-blur-md"
            style={{
              left: `${Math.min(
                (containerRef.current?.clientWidth || 300) - 180,
                Math.max(15, hoverPos.x - 70)
              )}px`,
              top: '15px'
            }}
          >
            <div className="text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800 flex justify-between">
              <span>Date:</span>
              <span className="text-slate-200">{hoveredDate}</span>
            </div>
            {normalizedSeries.map((s) => {
              const pt = s.points[hoverIndex];
              if (!pt) return null;
              const isPositive = pt.returnPct >= 0;
              return (
                <div key={s.symbol} className="flex items-center justify-between gap-4 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color.hex }} />
                    <span className="font-bold">{s.symbol}</span>
                  </div>
                  <div className="font-mono flex items-center gap-2">
                    <span className="text-slate-200 font-bold">{pt.normalizedVal}</span>
                    <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{pt.returnPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
