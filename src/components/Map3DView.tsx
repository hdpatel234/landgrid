import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Compass, Search, Filter, RotateCcw, ChevronDown, Share2, Navigation, Phone, Info, BarChart2, Eye, MapPin } from 'lucide-react';

export type PlotStatus = 'Available' | 'On Hold' | 'Registration Completed' | 'Sold';
export type PlotType = 'Standard' | 'Corner' | 'Premium';

export type Plot = {
  id: string;
  number: number;
  sector: string;
  status: PlotStatus;
  facing: string;
  road: string;
  area: number;
  price: number;
  type: PlotType;
  coordinates: [number, number][];
  // 3D local relative coordinates [x, z, width, depth]
  x3d: number;
  z3d: number;
  w3d: number;
  d3d: number;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  developer: { name: string; initials: string; tone: string };
  city: string;
  area: string;
  priceFrom: number;
  plotCount: number;
  available: number;
};

interface Map3DViewProps {
  project: Project;
  plots: Plot[];
  selectedPlot: Plot | null;
  onSelectPlot: (plot: Plot) => void;
  onView2D: () => void;
}

const statusColors: Record<PlotStatus, { fill: string; topFill: string; stroke: string; label: string }> = {
  Available: { fill: '#10b981', topFill: '#34d399', stroke: '#059669', label: 'AVAILABLE' },
  'On Hold': { fill: '#3b82f6', topFill: '#60a5fa', stroke: '#2563eb', label: 'MORTGAGE' },
  'Registration Completed': { fill: '#d946ef', topFill: '#f0abfc', stroke: '#c026d3', label: 'REGISTRATION COMP' },
  Sold: { fill: '#ef4444', topFill: '#f87171', stroke: '#dc2626', label: 'SOLD' },
};

export function Map3DView({ project, plots, selectedPlot, onSelectPlot, onView2D }: Map3DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pitch, setPitch] = useState(0.65); // Angle
  const [yaw, setYaw] = useState(0.45); // Rotation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('ALL PHASES');
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'stats' | 'nearby' | 'contact'>('overview');

  // Filtered plots
  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      const matchSearch = searchQuery === '' || `P-${String(plot.number).padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase()) || String(plot.number) === searchQuery;
      const matchPhase = selectedPhase === 'ALL PHASES' || plot.sector === selectedPhase;
      return matchSearch && matchPhase;
    });
  }, [plots, searchQuery, selectedPhase]);

  // Counts for status pills
  const counts = useMemo(() => {
    const available = plots.filter((p) => p.status === 'Available').length;
    const mortgage = plots.filter((p) => p.status === 'On Hold').length;
    const registered = plots.filter((p) => p.status === 'Registration Completed').length;
    const sold = plots.filter((p) => p.status === 'Sold').length;
    return { available, mortgage, registered, sold };
  }, [plots]);

  // Mouse / Touch handlers for 3D navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      // Check plot hover
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      checkPlotHit(mouseX, mouseY);
      return;
    }
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (e.shiftKey || e.buttons === 2) {
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else {
      setYaw((prev) => prev + dx * 0.005);
      setPitch((prev) => Math.max(0.2, Math.min(1.2, prev + dy * 0.005)));
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.5, Math.min(2.5, prev - e.deltaY * 0.001)));
  };

  // Stored hit regions for mouse hover/click
  const plotPolysRef = useRef<{ plot: Plot; path: Path2D }[]>([]);

  const checkPlotHit = (mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let found: Plot | null = null;
    for (let i = plotPolysRef.current.length - 1; i >= 0; i--) {
      const { plot, path } = plotPolysRef.current[i];
      if (ctx.isPointInPath(path, mouseX, mouseY)) {
        found = plot;
        break;
      }
    }
    setHoveredPlot(found);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let i = plotPolysRef.current.length - 1; i >= 0; i--) {
      const { plot, path } = plotPolysRef.current[i];
      if (ctx.isPointInPath(path, mouseX, mouseY)) {
        onSelectPlot(plot);
        break;
      }
    }
  };

  // Render 3D Scene to Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear background (clean map surface canvas background)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2 + pan.x;
    const cy = height / 2 + pan.y + 40;

    // Projection math (Isometric 3D)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    const project3D = (x: number, y: number, z: number) => {
      // Rotate Y
      const rx = x * cosY - z * sinY;
      const rz = x * sinY + z * cosY;
      // Rotate Pitch & Project
      const px = cx + rx * zoom * 1.6;
      const py = cy + (rz * sinP - y * cosP) * zoom * 1.6;
      return [px, py];
    };

    // Render Base Project Layout Ground (Isometric background tile map)
    const baseP1 = project3D(-210, 0, -160);
    const baseP2 = project3D(210, 0, -160);
    const baseP3 = project3D(210, 0, 180);
    const baseP4 = project3D(-210, 0, 180);

    ctx.beginPath();
    ctx.moveTo(baseP1[0], baseP1[1]);
    ctx.lineTo(baseP2[0], baseP2[1]);
    ctx.lineTo(baseP3[0], baseP3[1]);
    ctx.lineTo(baseP4[0], baseP4[1]);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Subtle isometric ground grid inside layout
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    for (let x = -200; x <= 200; x += 40) {
      const pStart = project3D(x, 0, -160);
      const pEnd = project3D(x, 0, 180);
      ctx.beginPath();
      ctx.moveTo(pStart[0], pStart[1]);
      ctx.lineTo(pEnd[0], pEnd[1]);
      ctx.stroke();
    }

    plotPolysRef.current = [];

    // 1. Internal Layout Roads (STRICTLY confined inside project boundary)
    const roadColor = '#334155';
    const mainRoads = [
      // 33' Parallel Sector Roads
      { name: "33' North Road", points: [[-190, -135], [190, -135]] },
      { name: "33' Mid Road", points: [[-190, -35], [190, -35]] },
      { name: "33' South Road", points: [[-190, 55], [190, 55]] },
      // Cross Connecting Roads
      { name: "Proposed 150' Main Road", points: [[-190, 145], [190, 145]] },
      { name: "40' West Road", points: [[-75, -155], [-75, 165]] },
      { name: "40' East Road", points: [[45, -155], [45, 165]] },
      { name: "Approach Entrance", points: [[0, 145], [0, 175]] },
    ];

    mainRoads.forEach((rd) => {
      ctx.beginPath();
      rd.points.forEach((pt, idx) => {
        const [px, py] = project3D(pt[0], 0, pt[1]);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = roadColor;
      ctx.lineWidth = 14 * zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Road markings (yellow/white dashes)
      ctx.beginPath();
      rd.points.forEach((pt, idx) => {
        const [px, py] = project3D(pt[0], 0, pt[1]);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5 * zoom;
      ctx.setLineDash([6 * zoom, 6 * zoom]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Road Text Label
      const midIdx = Math.floor(rd.points.length / 2);
      const [midX, midY] = project3D(rd.points[midIdx][0], 2, rd.points[midIdx][1]);
      ctx.font = `bold ${Math.max(9, Math.round(10 * zoom))}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(rd.name, midX, midY - 3);
      ctx.shadowBlur = 0;
    });

    // 2. Draw Parks & Amenities
    const amenities = [
      { name: 'Park I', x: -180, z: -125, w: 60, d: 40, color: '#86efac' },
      { name: 'Park II', x: -180, z: 65, w: 60, d: 40, color: '#4ade80' },
      { name: 'Social Infra', x: -60, z: 150, w: 50, d: 25, color: '#bae6fd' },
      { name: 'Utility Zone', x: 60, z: 150, w: 50, d: 25, color: '#fde68a' },
    ];

    amenities.forEach((amen) => {
      const p1 = project3D(amen.x, 0, amen.z);
      const p2 = project3D(amen.x + amen.w, 0, amen.z);
      const p3 = project3D(amen.x + amen.w, 0, amen.z + amen.d);
      const p4 = project3D(amen.x, 0, amen.z + amen.d);

      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.lineTo(p4[0], p4[1]);
      ctx.closePath();
      ctx.fillStyle = amen.color;
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      const centerP = project3D(amen.x + amen.w / 2, 2, amen.z + amen.d / 2);
      ctx.font = `italic bold ${Math.max(9, Math.round(10 * zoom))}px sans-serif`;
      ctx.fillStyle = '#14532d';
      ctx.textAlign = 'center';
      ctx.fillText(amen.name, centerP[0], centerP[1]);
    });

    // 3. Draw 3D Palm Trees along roads inside project
    const treeCoords = [
      [-170, -140], [-120, -140], [-40, -140], [20, -140], [80, -140], [140, -140],
      [-170, -30], [-120, -30], [-40, -30], [20, -30], [80, -30], [140, -30],
      [-170, 60], [-120, 60], [-40, 60], [20, 60], [80, 60], [140, 60],
      [-80, -100], [-80, 0], [-80, 100],
      [40, -100], [40, 0], [40, 100],
    ];

    treeCoords.forEach(([tx, tz]) => {
      const [px, py] = project3D(tx, 0, tz);
      const trunkH = 12 * zoom;
      const crownR = 6 * zoom;

      // Trunk
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - trunkH);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      // Palm Crown
      ctx.beginPath();
      ctx.arc(px, py - trunkH, crownR, 0, Math.PI * 2);
      ctx.fillStyle = '#16a34a';
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 4. Sort and Draw 3D Extruded Plots (Back to Front)
    const plotsWithDepth = filteredPlots.map((plot) => {
      const centerZ = plot.z3d + plot.d3d / 2;
      const centerX = plot.x3d + plot.w3d / 2;
      const rz = centerX * sinY + centerZ * cosY;
      return { plot, rz };
    });

    plotsWithDepth.sort((a, b) => a.rz - b.rz);

    plotsWithDepth.forEach(({ plot }) => {
      const meta = statusColors[plot.status] || statusColors.Available;
      const isSelected = selectedPlot?.id === plot.id;
      const isHovered = hoveredPlot?.id === plot.id;

      const height3D = isSelected ? 16 : isHovered ? 12 : 6;

      const x = plot.x3d;
      const z = plot.z3d;
      const w = plot.w3d;
      const d = plot.d3d;

      // 4 Bottom corners
      const b1 = project3D(x, 0, z);
      const b2 = project3D(x + w, 0, z);
      const b3 = project3D(x + w, 0, z + d);
      const b4 = project3D(x, 0, z + d);

      // 4 Top corners
      const t1 = project3D(x, height3D, z);
      const t2 = project3D(x + w, height3D, z);
      const t3 = project3D(x + w, height3D, z + d);
      const t4 = project3D(x, height3D, z + d);

      // Top Face Path for Hit Testing
      const topPath = new Path2D();
      topPath.moveTo(t1[0], t1[1]);
      topPath.lineTo(t2[0], t2[1]);
      topPath.lineTo(t3[0], t3[1]);
      topPath.lineTo(t4[0], t4[1]);
      topPath.closePath();
      plotPolysRef.current.push({ plot, path: topPath });

      // Draw Front/Side Extrusions
      // Front Wall (t4 - t3 - b3 - b4)
      ctx.beginPath();
      ctx.moveTo(b4[0], b4[1]);
      ctx.lineTo(b3[0], b3[1]);
      ctx.lineTo(t3[0], t3[1]);
      ctx.lineTo(t4[0], t4[1]);
      ctx.closePath();
      ctx.fillStyle = meta.fill;
      ctx.fill();
      ctx.strokeStyle = meta.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right Wall (t2 - t3 - b3 - b2)
      ctx.beginPath();
      ctx.moveTo(b2[0], b2[1]);
      ctx.lineTo(b3[0], b3[1]);
      ctx.lineTo(t3[0], t3[1]);
      ctx.lineTo(t2[0], t2[1]);
      ctx.closePath();
      ctx.fillStyle = meta.fill;
      ctx.fill();
      ctx.stroke();

      // Top Face
      ctx.fillStyle = isSelected ? '#fbbf24' : isHovered ? '#6ee7b7' : meta.topFill;
      ctx.fill(topPath);
      ctx.strokeStyle = isSelected ? '#b45309' : meta.stroke;
      ctx.lineWidth = isSelected || isHovered ? 2.5 : 1;
      ctx.stroke(topPath);

      // Plot Number Label on Top
      const labelCenter = project3D(x + w / 2, height3D + 1, z + d / 2);
      ctx.font = `bold ${Math.max(8, Math.round(9.5 * zoom))}px monospace`;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`P-${String(plot.number).padStart(3, '0')}`, labelCenter[0], labelCenter[1] + 3);
    });
  }, [pitch, yaw, zoom, pan, filteredPlots, selectedPlot, hoveredPlot]);

  return (
    <div className="relative h-[min(82vh,800px)] w-full overflow-hidden rounded-[24px] border border-slate-300 bg-[#eef2f5] shadow-2xl">
      {/* 3D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Compass */}
      <div className="absolute left-6 top-6 z-20 flex flex-col items-center gap-1 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-lg backdrop-blur-md">
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-100 shadow-inner"
          style={{ transform: `rotate(${-yaw * 57.3}deg)` }}
        >
          <Compass className="text-slate-700" size={28} />
          <span className="absolute -top-1 font-mono text-[9px] font-bold text-red-600">N</span>
          <span className="absolute -bottom-1 font-mono text-[9px] font-bold text-slate-500">S</span>
          <span className="absolute -right-1 font-mono text-[9px] font-bold text-slate-500">E</span>
          <span className="absolute -left-1 font-mono text-[9px] font-bold text-slate-500">W</span>
        </div>
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">Compass</span>
      </div>

      {/* Top Right Header Controls: Search, Phase Filter, and Action Buttons */}
      <div className="absolute right-6 top-6 z-20 flex flex-col items-end gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-10 w-36 rounded-full border border-slate-200 bg-white/95 pl-9 pr-3 text-xs font-semibold text-slate-800 shadow-md backdrop-blur-md focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="h-10 appearance-none rounded-full border border-slate-200 bg-white/95 pl-4 pr-8 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-md backdrop-blur-md focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL PHASES">ALL PHASES ⚙️</option>
              <option value="Phase 1 - North Greens">PHASE 1 - NORTH GREENS</option>
              <option value="Phase 2 - West Garden">PHASE 2 - WEST GARDEN</option>
              <option value="Phase 3 - East Avenue">PHASE 3 - EAST AVENUE</option>
              <option value="Phase 4 - Central Court">PHASE 4 - CENTRAL COURT</option>
              <option value="Phase 5 - South Reserve">PHASE 5 - SOUTH RESERVE</option>
              <option value="Phase 6 - Executive Crest">PHASE 6 - EXECUTIVE CREST</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-500" />
          </div>
        </div>

        {/* Vertical Action Buttons matching reference screenshot */}
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-md">
          <button
            type="button"
            title="Edit mode"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button
            type="button"
            title="Filter view"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          >
            <Filter size={16} />
          </button>
          <button
            type="button"
            title="Fullscreen / Expand view"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        </div>
      </div>

      {/* Hover Plot Tooltip Overlay */}
      {hoveredPlot && (
        <div className="pointer-events-none absolute left-1/2 top-10 z-30 -translate-x-1/2 rounded-2xl border border-slate-200 bg-slate-900/90 px-4 py-2.5 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-amber-400">P-{String(hoveredPlot.number).padStart(3, '0')}</span>
            <span className="text-xs font-semibold text-slate-300">{hoveredPlot.sector}</span>
            <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">{hoveredPlot.status}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {hoveredPlot.area.toLocaleString()} sq ft · {hoveredPlot.facing} · {hoveredPlot.road} Road
          </p>
        </div>
      )}

      {/* Bottom Left: Plot Status Legend Counters Pill Modal (Matching Reference Image 3) */}
      <div className="absolute bottom-16 left-6 z-20 flex flex-col gap-1.5 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md sm:bottom-20">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 font-mono text-[10px] text-emerald-800">
            {counts.available}
          </span>
          <span className="font-mono text-[10px] font-bold text-emerald-700">AVAILABLE</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 font-mono text-[10px] text-blue-800">
            {counts.mortgage}
          </span>
          <span className="font-mono text-[10px] font-bold text-blue-700">MORTGAGE</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 font-mono text-[10px] text-pink-800">
            {counts.registered}
          </span>
          <span className="font-mono text-[10px] font-bold text-pink-700">REGISTRATION COMP</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 font-mono text-[10px] text-red-800">
            {counts.sold}
          </span>
          <span className="font-mono text-[10px] font-bold text-red-700">SOLD</span>
        </div>
      </div>

      {/* Floating 2D / 3D Mode Switcher (Matching Reference Screenshot Pill Toggle) */}
      <div className="absolute bottom-16 right-6 z-30 flex items-center rounded-full border border-slate-300 bg-slate-900/90 p-1 shadow-2xl backdrop-blur-md sm:bottom-20">
        <button
          type="button"
          onClick={onView2D}
          className="rounded-full px-4 py-1.5 font-mono text-xs font-bold text-slate-300 transition hover:text-white"
        >
          2D
        </button>
        <button
          type="button"
          className="rounded-full bg-teal-500 px-4 py-1.5 font-mono text-xs font-bold text-white shadow-md"
        >
          3D
        </button>
      </div>

      {/* Bottom Floating Navigation Toolbar (Matching Reference Screenshot) */}
      <div className="absolute inset-x-6 bottom-3 z-20 flex flex-wrap items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-xs font-bold text-white shadow-sm">
            {project.developer.initials}
          </span>
          <span className="font-serif text-xs font-bold text-slate-800">{project.developer.name}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 transition ${activeTab === 'overview' ? 'bg-slate-100 text-teal-700 font-bold' : 'hover:bg-slate-50'}`}
          >
            <Info size={14} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 transition ${activeTab === 'insights' ? 'bg-slate-100 text-teal-700 font-bold' : 'hover:bg-slate-50'}`}
          >
            <Eye size={14} /> Insights
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 transition ${activeTab === 'stats' ? 'bg-slate-100 text-teal-700 font-bold' : 'hover:bg-slate-50'}`}
          >
            <BarChart2 size={14} /> Stats
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 transition ${activeTab === 'nearby' ? 'bg-slate-100 text-teal-700 font-bold' : 'hover:bg-slate-50'}`}
          >
            <MapPin size={14} /> Nearby
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 transition ${activeTab === 'contact' ? 'bg-slate-100 text-teal-700 font-bold' : 'hover:bg-slate-50'}`}
          >
            <Phone size={14} /> Contact
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=Mansanpalle+Hyderabad`, '_blank')}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <Navigation size={13} className="text-teal-600" /> Directions
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <Share2 size={13} className="text-teal-600" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
