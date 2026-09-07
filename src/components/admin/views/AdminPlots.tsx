import React, { useState } from 'react';
import {
  Layers3, Search, Filter, Eye, CheckCircle2, AlertTriangle,
  History, ArrowRight, X, Clock, Edit
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { PlotAdmin, PlotAdminStatus } from '../../../lib/adminMockData';

export function AdminPlots() {
  const { plots, projects, developers, updatePlotStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projFilter, setProjFilter] = useState('all');
  const [facingFilter, setFacingFilter] = useState('all');
  const [selectedPlot, setSelectedPlot] = useState<PlotAdmin | null>(null);

  const filtered = plots.filter((plot) => {
    const matchSearch = `P-${String(plot.number).padStart(3, '0')}`.toLowerCase().includes(search.toLowerCase()) || String(plot.number) === search;
    const matchStatus = statusFilter === 'all' || plot.status === statusFilter;
    const matchProj = projFilter === 'all' || plot.projectId === projFilter;
    const matchFacing = facingFilter === 'all' || plot.facing === facingFilter;
    return matchSearch && matchStatus && matchProj && matchFacing;
  });

  const getStatusBadge = (status: PlotAdminStatus) => {
    switch (status) {
      case 'Available': return <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">AVAILABLE</span>;
      case 'On Hold': return <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold">ON HOLD</span>;
      case 'Booked': return <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold">BOOKED</span>;
      case 'Registration Completed': return <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">REGISTERED</span>;
      case 'Sold': return <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold">SOLD</span>;
      case 'Blocked': return <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold">BLOCKED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Global Plot Inventory</h1>
          <p className="mt-1 text-xs text-slate-500">Manage individual plot availability, pricing, and historical status logs across all projects.</p>
        </div>
        <div className="font-mono text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2">
          Total Inventory: {plots.length} Plots
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid gap-3 sm:grid-cols-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Plot number (e.g. P-004)..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#159b8b]"
          />
        </div>
        <select
          value={projFilter}
          onChange={(e) => setProjFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Hold">On Hold</option>
          <option value="Booked">Booked</option>
          <option value="Registration Completed">Registration Completed</option>
          <option value="Sold">Sold</option>
          <option value="Blocked">Blocked</option>
        </select>
        <select
          value={facingFilter}
          onChange={(e) => setFacingFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="all">Any Facing</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
      </div>

      {/* Plot Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Plot No.</th>
                <th className="px-5 py-3.5">Project</th>
                <th className="px-5 py-3.5">Sector</th>
                <th className="px-5 py-3.5">Area (Sq Ft / Yd)</th>
                <th className="px-5 py-3.5">Facing</th>
                <th className="px-5 py-3.5">Road</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 50).map((plot) => (
                <tr key={plot.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4 font-mono font-bold text-[#162943]">
                    P-{String(plot.number).padStart(3, '0')}
                    {plot.type !== 'Standard' && <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-800 uppercase">{plot.type}</span>}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">
                    {plot.projectName}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {plot.sector}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-700">
                    {plot.areaSqFt.toLocaleString()} sqft <span className="text-slate-400">({plot.areaSqYd} sqyd)</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {plot.facing}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {plot.road}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-[#162943]">
                    ₹{(plot.price / 100000).toFixed(1)}L
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(plot.status)}
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    <button
                      onClick={() => setSelectedPlot(plot)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      title="Inspect Plot & History"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLOT INSPECTION & STATUS HISTORY MODAL */}
      {selectedPlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-rise">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#162943] p-5 text-white">
              <div>
                <span className="font-mono text-[10px] text-teal-400 uppercase font-bold tracking-wider">Plot Detail Inspector</span>
                <h3 className="font-serif text-2xl font-bold">Plot P-{String(selectedPlot.number).padStart(3, '0')}</h3>
              </div>
              <button onClick={() => setSelectedPlot(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400 block text-[10px]">PROJECT</span><span className="font-bold text-slate-800">{selectedPlot.projectName}</span></div>
                <div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400 block text-[10px]">DEVELOPER</span><span className="font-bold text-slate-800">{selectedPlot.developerName}</span></div>
                <div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400 block text-[10px]">AREA</span><span className="font-bold text-slate-800">{selectedPlot.areaSqFt} sq ft ({selectedPlot.areaSqYd} sq yd)</span></div>
                <div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400 block text-[10px]">INDICATIVE PRICE</span><span className="font-bold text-[#162943]">₹{(selectedPlot.price / 100000).toFixed(2)} Lakhs</span></div>
              </div>

              {/* Status Change Controls */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
                <p className="text-xs font-bold text-slate-800">Quick Status Override</p>
                <div className="flex flex-wrap gap-2">
                  {(['Available', 'On Hold', 'Booked', 'Registration Completed', 'Sold', 'Blocked'] as PlotAdminStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        updatePlotStatus(selectedPlot.id, st);
                        setSelectedPlot((prev) => prev ? { ...prev, status: st } : null);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        selectedPlot.status === st ? 'bg-[#159b8b] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status History Timeline */}
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock size={13} /> Audit & Status History Timeline
                </p>
                <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                  {selectedPlot.history.map((h, i) => (
                    <div key={i} className="text-xs">
                      <p className="font-bold text-slate-800">{h.from} &rarr; <span className="text-teal-600">{h.to}</span></p>
                      <p className="text-[11px] text-slate-500">{h.note}</p>
                      <p className="font-mono text-[9px] text-slate-400">{h.user} · {h.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedPlot(null)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
