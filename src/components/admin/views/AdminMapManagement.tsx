import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup, Tooltip, ImageOverlay, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Map as MapIcon, Edit3, Plus, Trash2, Save, Layers,
  Compass, CheckCircle2, RotateCcw, Image as ImageIcon, Download, Upload, Sparkles, Sliders
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
  const { projects, developers, plots, updatePlotStatus, addPlot, deletePlot, clearAllPlots, importPlotsBatch } = useAdmin();
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

  // AI Layout Extraction & Blueprint Image Overlay State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedImageUrl, setImportedImageUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [plotCountToExtract, setPlotCountToExtract] = useState(116);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectPlots = plots.filter((p) => p.projectId === selectedProjectId);

  // Bounds for overlay image matching selected project coordinates
  const overlayBounds: [[number, number], [number, number]] = [
    [selectedProject.lat - 0.0035, selectedProject.lng - 0.0045],
    [selectedProject.lat + 0.0035, selectedProject.lng + 0.0045]
  ];

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImportedImageUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractAndMapLayout = () => {
    setIsExtracting(true);

    setTimeout(() => {
      // Generate plot polygons derived from imported masterplan layout blueprint (Plots 1 to 116)
      const baseLat = selectedProject.lat - 0.0022;
      const baseLng = selectedProject.lng - 0.0032;

      const extractedList: any[] = [];
      let num = 1;

      // Layout Blocks based on masterplan image:
      // Block 1: Plots 1..11 (East Wing, 9.00M Road)
      // Block 2: Plots 12..23 (East Central, 9.00M Road)
      // Block 3: Plots 24..35 (Center Wing, 6.00M Road)
      // Block 4: Plots 36..52 (North Center, 9.00M Road)
      // Block 5: Plots 53..76 (West Central, 9.00M Road)
      // Block 6: Plots 77..88 (12.00M Internal Road)
      // Block 7: Plots 89..101 (Amenity Sector 1)
      // Block 8: Plots 102..116 (Proposed 18M Road Front)

      const subBlocks = [
        { count: 11, road: "9.00M Wide Internal Road", sector: "Block A - East Wing", dLat: 0.0030, dLng: 0.0055 },
        { count: 12, road: "9.00M Wide Internal Road", sector: "Block B - East Central", dLat: 0.0030, dLng: 0.0042 },
        { count: 12, road: "6.00M Wide Internal Road", sector: "Block C - Center Wing", dLat: 0.0018, dLng: 0.0030 },
        { count: 17, road: "9.00M Wide Internal Road", sector: "Block D - North Center", dLat: 0.0018, dLng: 0.0018 },
        { count: 24, road: "9.00M Wide Internal Road", sector: "Block E - West Central", dLat: 0.0008, dLng: 0.0008 },
        { count: 12, road: "12.00M Wide Internal Road", sector: "Block F - Amenity 1 Sector", dLat: -0.0005, dLng: 0.0000 },
        { count: 13, road: "12.00M Wide Internal Road", sector: "Block G - Amenity 2 Sector", dLat: -0.0015, dLng: 0.0000 },
        { count: 15, road: "Proposed 18M Wide Road", sector: "Block H - South 18M Road", dLat: -0.0024, dLng: 0.0000 }
      ];

      subBlocks.forEach((blk) => {
        const rows = Math.ceil(blk.count / 2);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < 2; c++) {
            if (num > plotCountToExtract) break;
            const lat = baseLat + blk.dLat + r * 0.00038;
            const lng = baseLng + blk.dLng + c * 0.00048;
            const area = 1500 + ((num % 5) * 120);

            extractedList.push({
              number: num,
              projectId: selectedProject.id,
              projectName: selectedProject.name,
              developerId: selectedProject.developerId,
              developerName: selectedProject.developerName,
              sector: blk.sector,
              status: num % 9 === 0 ? 'Sold' : num % 6 === 0 ? 'On Hold' : 'Available',
              facing: (num + r) % 2 === 0 ? 'East' : 'West',
              road: blk.road,
              areaSqFt: area,
              price: area * 3400,
              type: num % 8 === 0 ? 'Corner' : num % 12 === 0 ? 'Premium' : 'Standard',
              coordinates: [
                [lat, lng],
                [lat + 0.00032, lng],
                [lat + 0.00032, lng + 0.00042],
                [lat, lng + 0.00042]
              ]
            });
            num++;
          }
        }
      });

      // Clear old and import batch
      clearAllPlots();
      importPlotsBatch(extractedList);
      setIsExtracting(false);
      setShowImportModal(false);
      setOverlayEnabled(true);
    }, 1200);
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: projectPlots.map((plot) => ({
        type: 'Feature',
        properties: {
          id: plot.id,
          number: plot.number,
          projectName: plot.projectName,
          developerName: plot.developerName,
          status: plot.status,
          facing: plot.facing,
          road: plot.road,
          areaSqFt: plot.areaSqFt,
          price: plot.price
        },
        geometry: {
          type: 'Polygon',
          coordinates: [plot.coordinates.map(([lat, lng]) => [lng, lat])]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject.slug || 'project'}-plots.geojson.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0e7c6f]"
            title="Import CAD or Layout Masterplan Image to extract plots"
          >
            <Sparkles size={15} /> Import Layout Image
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to remove ALL plots from the map? This will clear all plots from both the Map Editor and Buyer Marketplace.')) {
                clearAllPlots();
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 shadow-xs hover:bg-rose-100"
            title="Clear all plots from map & inventory"
          >
            <Trash2 size={15} /> Clear All Plots
          </button>

          <button
            type="button"
            onClick={handleExportGeoJSON}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-[#162943] shadow-xs hover:bg-slate-50"
            title="Download GeoJSON format plot data file"
          >
            <Download size={15} className="text-teal-600" /> Export GeoJSON (.json)
          </button>
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

        {/* Blueprint Image Overlay Controls */}
        {importedImageUrl && (
          <div className="flex items-center gap-3 rounded-xl bg-teal-50/80 px-3.5 py-1.5 border border-teal-200 text-xs text-[#0c665c]">
            <label className="flex items-center gap-1.5 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={overlayEnabled}
                onChange={(e) => setOverlayEnabled(e.target.checked)}
                className="rounded text-teal-600"
              />
              Show Blueprint Overlay
            </label>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span>Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-20 accent-teal-600 cursor-pointer"
              />
              <span>{Math.round(overlayOpacity * 100)}%</span>
            </div>
          </div>
        )}

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
        {drawingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-slate-900/90 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-2xl backdrop-blur-md">
            <span>Click map to place points ({drawPoints.length} added)</span>
            {drawPoints.length >= 3 && (
              <button
                type="button"
                onClick={handleFinishPolygon}
                className="rounded-full bg-teal-500 px-3.5 py-1 text-xs font-bold text-white hover:bg-teal-600 shadow"
              >
                Finish & Save Plot ➔
              </button>
            )}
          </div>
        )}

        <MapContainer
          center={[selectedProject.lat, selectedProject.lng]}
          zoom={17}
          scrollWheelZoom
          className={`h-full w-full ${drawingMode ? 'cursor-crosshair' : ''}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickListener />

          {/* Blueprint Layout Masterplan Image Overlay */}
          {importedImageUrl && overlayEnabled && (
            <ImageOverlay
              url={importedImageUrl}
              bounds={overlayBounds}
              opacity={overlayOpacity}
            />
          )}

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
                  weight: 2,
                  interactive: !drawingMode
                }}
              >
                {!drawingMode && (
                  <Tooltip permanent direction="center" className="bg-white/90 text-[10px] font-bold">
                    P-{String(plot.number).padStart(3, '0')}
                  </Tooltip>
                )}
                {!drawingMode && (
                  <Popup>
                    <div className="p-1 space-y-2 text-xs">
                      <p className="font-bold text-[#162943]">Plot P-{String(plot.number).padStart(3, '0')}</p>
                      <p className="text-[11px] text-slate-500">{plot.areaSqFt} sq ft · {plot.facing} facing</p>
                      <p className="font-mono font-bold text-teal-600">₹{(plot.price / 100000).toFixed(1)}L</p>
                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 mt-1.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => updatePlotStatus(plot.id, 'Available')}
                            className="px-2 py-1 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200"
                          >
                            Set Avail
                          </button>
                          <button
                            onClick={() => updatePlotStatus(plot.id, 'Sold')}
                            className="px-2 py-1 text-[9px] font-bold bg-rose-100 text-rose-800 rounded hover:bg-rose-200"
                          >
                            Set Sold
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete Plot P-${String(plot.number).padStart(3, '0')}? This will remove it from the map and public marketplace.`)) {
                              deletePlot(plot.id);
                            }
                          }}
                          className="px-2 py-1 text-[9px] font-bold bg-rose-50 text-rose-600 rounded border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
                          title="Delete plot from map & marketplace"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                )}
              </Polygon>
            );
          })}

          {/* Render point markers while drawing */}
          {drawingMode && drawPoints.map((pt, idx) => (
            <CircleMarker
              key={idx}
              center={pt}
              radius={5}
              pathOptions={{ fillColor: '#f59e0b', color: '#ffffff', weight: 2, fillOpacity: 1 }}
            />
          ))}

          {/* Render Polyline or Polygon currently being drawn */}
          {drawingMode && drawPoints.length > 1 && drawPoints.length < 3 && (
            <Polyline
              positions={drawPoints}
              pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '6, 6' }}
            />
          )}

          {drawingMode && drawPoints.length >= 3 && (
            <Polygon
              positions={drawPoints}
              pathOptions={{ fillColor: '#f59e0b', fillOpacity: 0.7, color: '#b45309', weight: 3, dashArray: '6, 6' }}
            />
          )}
        </MapContainer>
      </div>

      {/* CREATE PLOT FROM POLYGON MODAL */}
      {showPlotModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs">
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

      {/* AI LAYOUT PLAN IMPORT & EXTRACTION MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#159b8b]">
                  <Sparkles size={14} /> AI Masterplan Layout Importer
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#162943]">Extract & Map Plot Layout</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-[#162943] mb-1.5">
                  1. Select or Upload CAD Masterplan / Layout Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center cursor-pointer hover:border-[#159b8b] hover:bg-teal-50/50 transition"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {importedImageUrl ? (
                    <div className="space-y-2">
                      <img src={importedImageUrl} alt="Layout blueprint preview" className="h-32 mx-auto rounded-xl border border-slate-200 object-cover shadow-sm" />
                      <p className="text-xs font-bold text-teal-700">✓ Blueprint Image Loaded & Geo-Aligned</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-[#159b8b]">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-[#162943]">Click to upload Masterplan Blueprint Image</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WEBP CAD blueprints (e.g. Plots 1..116 Layout Plan)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Extraction Parameters */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Plot Count</label>
                  <input
                    type="number"
                    value={plotCountToExtract}
                    onChange={(e) => setPlotCountToExtract(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-slate-300 px-3 font-bold text-[#162943]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Venture</label>
                  <input
                    type="text"
                    readOnly
                    value={`${selectedProject.name}`}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-bold text-slate-500"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-teal-50/80 p-3.5 border border-teal-200 text-xs text-[#0c665c] leading-relaxed">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#159b8b]" /> Layout Extraction & Map Alignment Engine:
                </p>
                <p className="mt-1 text-[11px] text-[#0c665c]">
                  Extracts <strong>Plots 1 to {plotCountToExtract}</strong>, maps internal 12M & 9M road corridors, Amenity Spaces 1 & 2, and overlays the blueprint image onto OpenStreetMap.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExtracting}
                onClick={handleExtractAndMapLayout}
                className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0d8175] disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Extracting Plots & Aligning Map...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Extract Layout & Map Plots
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
