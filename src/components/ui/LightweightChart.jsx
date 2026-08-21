import React, { useRef, useEffect, useState } from 'react';

export default function LightweightChart({ data = [], timeFilter = '1Y' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [filteredData, setFilteredData] = useState([]);

  // Parse DD-MM-YYYY format
  const parseDate = (str) => {
    const parts = str.split('-');
    if (parts.length !== 3) return new Date(NaN);
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  };

  // Filter historical data based on timeFilter
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    // Sort ascending (oldest first) for correct chronological drawing
    const sorted = [...data].reverse();
    
    if (timeFilter === 'ALL') {
      setFilteredData(sorted);
      return;
    }

    const latestDate = parseDate(sorted[sorted.length - 1].date);
    if (isNaN(latestDate.getTime())) {
      setFilteredData(sorted);
      return;
    }

    const cutoffDate = new Date(latestDate);
    if (timeFilter === '1M') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    } else if (timeFilter === '6M') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    } else if (timeFilter === '1Y') {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }

    const filtered = sorted.filter((item) => {
      const d = parseDate(item.date);
      return !isNaN(d.getTime()) && d >= cutoffDate;
    });

    // Fallback if filtering leaves too few points
    setFilteredData(filtered.length > 1 ? filtered : sorted.slice(-30));
  }, [data, timeFilter]);

  // Draw chart onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || filteredData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    // Set responsive width & height based on device pixels ratio
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 220;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Styling configuration (Dark mode sensitive)
    const isDark = document.documentElement.classList.contains('dark');
    const lineColor = '#10b981'; // Emerald 500
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.7)';
    const textColor = isDark ? '#94a3b8' : '#64748b'; // Slate 400 vs Slate 500

    // Chart margins
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // Get min and max NAV values
    const navs = filteredData.map(d => Number(d.nav));
    const maxNav = Math.max(...navs);
    const minNav = Math.min(...navs);
    const navRange = maxNav - minNav || 1;
    
    // Pad min/max slightly for better display
    const yMax = maxNav + navRange * 0.05;
    const yMin = Math.max(0, minNav - navRange * 0.05);
    const yRange = yMax - yMin || 1;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines and Y-axis labels
    const gridLines = 4;
    ctx.font = '9px monospace';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let j = 0; j <= gridLines; j++) {
      const val = yMin + (yRange * j) / gridLines;
      const y = height - paddingBottom - (plotHeight * j) / gridLines;

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Label text
      ctx.fillText(val.toFixed(2), paddingLeft - 8, y);
    }

    // Coordinate conversion helper
    const getCoords = (index) => {
      const x = paddingLeft + (plotWidth * index) / (filteredData.length - 1);
      const y = height - paddingBottom - ((Number(filteredData[index].nav) - yMin) / yRange) * plotHeight;
      return { x, y };
    };

    // Draw area gradient fill under line
    if (filteredData.length > 1) {
      ctx.beginPath();
      const first = getCoords(0);
      ctx.moveTo(first.x, height - paddingBottom);
      ctx.lineTo(first.x, first.y);

      for (let k = 1; k < filteredData.length; k++) {
        const pt = getCoords(k);
        ctx.lineTo(pt.x, pt.y);
      }
      
      const last = getCoords(filteredData.length - 1);
      ctx.lineTo(last.x, height - paddingBottom);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
      if (isDark) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      } else {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      }
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw main line path
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const startPt = getCoords(0);
    ctx.moveTo(startPt.x, startPt.y);

    for (let k = 1; k < filteredData.length; k++) {
      const pt = getCoords(k);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Draw X-axis date labels (e.g. Start, Mid, End)
    if (filteredData.length > 1) {
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const labelIndices = [0, Math.floor((filteredData.length - 1) / 2), filteredData.length - 1];
      labelIndices.forEach((idx) => {
        const pt = getCoords(idx);
        ctx.fillText(filteredData[idx].date, pt.x, height - paddingBottom + 6);
      });
    }

    // Draw interactive hover indicators
    if (hoverIndex !== null && hoverIndex < filteredData.length) {
      const pt = getCoords(hoverIndex);

      // Vertical line
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(pt.x, paddingTop);
      ctx.lineTo(pt.x, height - paddingBottom);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Hover dot on the line
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = lineColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    }
  }, [filteredData, hoverIndex]);

  // Handle pointer tracking on canvas
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || filteredData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingLeft = 45;
    const paddingRight = 15;
    const plotWidth = rect.width - paddingLeft - paddingRight;

    // Calculate nearest index based on X coordinate
    const relativeX = x - paddingLeft;
    if (relativeX < 0 || relativeX > plotWidth) {
      setHoverIndex(null);
      return;
    }

    const percent = relativeX / plotWidth;
    let idx = Math.round(percent * (filteredData.length - 1));
    idx = Math.max(0, Math.min(filteredData.length - 1, idx));

    setHoverIndex(idx);
    setHoverPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair block"
      />

      {/* Tooltip Indicator */}
      {hoverIndex !== null && hoverIndex < filteredData.length && (
        <div
          className="absolute z-20 pointer-events-none p-2 bg-slate-900/90 text-white rounded-lg shadow-lg text-[10px] font-semibold leading-tight flex flex-col gap-0.5 border border-slate-700/50"
          style={{
            left: `${Math.min(containerRef.current.clientWidth - 110, Math.max(10, hoverPos.x - 50))}px`,
            top: `${Math.max(5, hoverPos.y - 55)}px`
          }}
        >
          <span className="text-slate-400 font-normal">{filteredData[hoverIndex].date}</span>
          <span className="font-mono text-emerald-400 font-bold">NAV: ₹{Number(filteredData[hoverIndex].nav).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
