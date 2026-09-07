import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Map as MapIcon, Edit3, Plus, Trash2, Save, Layers,
  Compass, CheckCircle2, RotateCcw, Image, Download
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { PlotAdminStatus } from '../../../lib/adminMockData';

const statusMapColors: Record<PlotAdminStatus, { fill: string; stroke: string }> = {
  Available: { fill: '#10b981', stroke: '#059669' },
  'On Hold': { fill: '#f59e0b', stroke: '#d97706' },
  Booked: { fill: '#8b5cf6', stroke: '#7c3aed' },
  'Registration Completed': { fill: '#3b82f6', stroke: '#2563eb' },
  Sold: { fill: '#ef4444', stroke: '#dc2626' },
  Blocked: { fill: '#64748b', stroke: '#475569' },
};

export function AdminMapManagement() {
  const { projects, developers, plots, updatePlotStatus, addPlot } = useAdmin();
  const [selectedProjectId, setSelectedProjectId] = useState('project-1');
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);

  const [showPlotModal, setShowPlotModal] = useState(false);
  const [newPlotNum, setNewPlotNum] = useState(plots.length + 1);
  const [newAreaSqFt, setNewAreaSqFt] = useState(1650);
  const [newFacing, setNewFacing] = useState('East');
  const [newRoad, setNewRoad] = useState("33' Road");
  const [newPrice, setNewPrice] = useState(5200000);
  const [newStatus, setNewStatus] = useState<PlotAdminStatus>('Available');

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectPlots = plots.filter((p) => p.projectId === selectedProjectId);

  // Map Click Listener for Drawing Polygons
  function MapClickListener() {
    useMapEvents({
      click(e) {
        if (!drawingMode) return;
        setDrawPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    });
    return null;
  }

  const handleFinishPolygon = () => {
    if (drawPoints.length < 3) return;
    setShowPlotModal(true);
  };

  const handleSavePlot = (e: React.FormEvent) => {
    e.preventDefault();
    addPlot({
      number: Number(newPlotNum),
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      developerId: selectedProject.developerId,
      developerName: selectedProject.developerName,
      sector: 'Phase 1 - North Greens',
      status: newStatus,
      facing: newFacing,
      road: newRoad,
      areaSqFt: Number(newAreaSqFt),
      price: Number(newPrice),
      coordinates: drawPoints
    });

    setDrawPoints([]);
    setDrawingMode(false);
    setShowPlotModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Interactive Map Editor & Management</h1>
          <p className="mt-1 text-xs text-slate-500">Draw, edit, and assign GeoJSON plot boundaries directly on OpenStreetMap.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-[#162943] shadow-xs outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.developerName})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Controls & Status Legend Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDrawingMode(!drawingMode);
              setDrawPoints([]);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              drawingMode ? 'bg-amber-500 text-slate-900 shadow-md' : 'bg-[#162943] text-white hover:bg-[#203a5e]'
            }`}
          >
            <Edit3 size={15} /> {drawingMode ? 'Cancel Polygon Drawing' : '+ Draw Plot Polygon'}
          </button>

          {drawingMode && (
            <button
              type="button"
              onClick={handleFinishPolygon}
              disabled={drawPoints.length < 3}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-40"
            >
              <Save size={15} /> Save Polygon ({drawPoints.length} points)
            </button>
          )}

          {drawPoints.length > 0 && (
            <button
              type="button"
              onClick={() => setDrawPoints([])}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              title="Reset current points"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-600">
          {Object.entries(statusMapColors).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color.fill }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative h-[650px] w-full overflow-hidden rounded-2xl border border-slate-300 shadow-xl">
        <MapContainer
          center={[selectedProject.lat, selectedProject.lng]}
          zoom={17}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickListener />

          {/* Render Existing Plot Boundaries */}
          {projectPlots.map((plot) => {
            const colors = statusMapColors[plot.status] || statusMapColors.Available;
            return (
              <Polygon
                key={plot.id}
                positions={plot.coordinates}
                pathOptions={{
                  fillColor: colors.fill,
                  fillOpacity: 0.65,
                  color: colors.stroke,
                  weight: 2
                }}
              >
                <Tooltip permanent direction="center" className="bg-white/90 text-[10px] font-bold">
                  P-{String(plot.number).padStart(3, '0')}
                </Tooltip>
                <Popup>
                  <div className="p-1 space-y-2 text-xs">
                    <p className="font-bold text-[#162943]">Plot P-{String(plot.number).padStart(3, '0')}</p>
                    <p className="text-[11px] text-slate-500">{plot.areaSqFt} sq ft · {plot.facing} facing</p>
                    <p className="font-mono font-bold text-teal-600">₹{(plot.price / 100000).toFixed(1)}L</p>
                    <div className="flex gap-1 pt-1">
                      <button
                        onClick={() => updatePlotStatus(plot.id, 'Available')}
                        className="px-2 py-1 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded"
                      >
                        Set Avail
                      </button>
                      <button
                        onClick={() => updatePlotStatus(plot.id, 'Sold')}
                        className="px-2 py-1 text-[9px] font-bold bg-rose-100 text-rose-800 rounded"
                      >
                        Set Sold
                      </button>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Render Polygon currently being drawn */}
          {drawPoints.length > 0 && (
            <Polygon
              positions={drawPoints}
              pathOptions={{ fillColor: '#f59e0b', fillOpacity: 0.7, color: '#b45309', weight: 3, dashArray: '6, 6' }}
            />
          )}
        </MapContainer>
      </div>

      {/* CREATE PLOT FROM POLYGON MODAL */}
      {showPlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleSavePlot} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#162943]">Save Drawn Plot Polygon</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plot Number</label>
                <input type="number" value={newPlotNum} onChange={(e) => setNewPlotNum(Number(e.target.value))} required className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area (Sq Ft)</label>
                <input type="number" value={newAreaSqFt} onChange={(e) => setNewAreaSqFt(Number(e.target.value))} required className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facing</label>
                <select value={newFacing} onChange={(e) => setNewFacing(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500">
                  <option value="East">East</option>
                  <option value="North">North</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Road Width</label>
                <input value={newRoad} onChange={(e) => setNewRoad(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
              <input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} required className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowPlotModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl">Save & Publish Plot</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
