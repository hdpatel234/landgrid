import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Compass, Search, Filter, Plus, CheckCircle2, AlertTriangle,
  Star, Eye, Check, X, Shield, MapPin, Building2
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { ProjectAdmin } from '../../../lib/adminMockData';

export function AdminProjects() {
  const { projects, developers, approveProject, rejectProject, suspendProject, toggleFeaturedProject, addProject } = useAdmin();
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [devFilter, setDevFilter] = useState('all');
  const [selectedProj, setSelectedProj] = useState<ProjectAdmin | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newDevId, setNewDevId] = useState('dev-1');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newArea, setNewArea] = useState('Shamshabad');
  const [newPlots, setNewPlots] = useState(50);
  const [newPrice, setNewPrice] = useState(3500000);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.developerName.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
    const matchApproval = approvalFilter === 'all' || p.approvalStatus === approvalFilter;
    const matchDev = devFilter === 'all' || p.developerId === devFilter;
    return matchSearch && matchApproval && matchDev;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const selectedDevObj = developers.find(d => d.id === newDevId);
    addProject({
      name: newName,
      developerId: newDevId,
      developerName: selectedDevObj ? selectedDevObj.name : 'Sreeni Groups',
      city: newCity,
      area: newArea,
      plotCount: Number(newPlots),
      priceFrom: Number(newPrice)
    });
    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Project Management</h1>
          <p className="mt-1 text-xs text-slate-500">Review, approve and manage real estate ventures across all developers.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#118073]"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, developers or locations..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#159b8b]"
          />
        </div>
        <select
          value={devFilter}
          onChange={(e) => setDevFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="all">All Developers</option>
          {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="all">All Approvals</option>
          <option value="Approved">Approved</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Projects Grid Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Project Name</th>
                <th className="px-5 py-3.5">Developer</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Plots / Available</th>
                <th className="px-5 py-3.5">Price From</th>
                <th className="px-5 py-3.5">RERA / Approval</th>
                <th className="px-5 py-3.5">Featured</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length ? filtered.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4">
                    <button onClick={() => setSelectedProj(proj)} className="font-bold text-[#162943] hover:text-[#159b8b] text-left block">
                      {proj.name}
                    </button>
                    <span className="text-[10px] text-slate-400">{proj.type} · Created {proj.createdAt}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {proj.developerName}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {proj.area}, {proj.city}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-800">
                    {proj.plotCount} plots <span className="text-teal-600">({proj.availableCount} avail)</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-[#162943]">
                    ₹{(proj.priceFrom / 100000).toFixed(1)}L
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      proj.approvalStatus === 'Approved' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      proj.approvalStatus === 'Pending Review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {proj.approvalStatus === 'Approved' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {proj.approvalStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleFeaturedProject(proj.id)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                        proj.featured ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-400 hover:text-amber-500'
                      }`}
                    >
                      <Star size={14} fill={proj.featured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    <button
                      onClick={() => setSelectedProj(proj)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    {proj.approvalStatus === 'Pending Review' && (
                      <button
                        onClick={() => approveProject(proj.id)}
                        className="rounded-lg bg-teal-500 p-1.5 text-white hover:bg-teal-600"
                        title="Approve Project"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    {proj.approvalStatus !== 'Suspended' && (
                      <button
                        onClick={() => suspendProject(proj.id)}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                        title="Suspend Project"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No projects match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROJECT DETAIL MODAL */}
      {selectedProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-rise">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#162943] p-5 text-white">
              <div>
                <h3 className="font-serif text-xl font-bold">{selectedProj.name}</h3>
                <p className="text-xs text-slate-300">Developer: {selectedProj.developerName} · {selectedProj.area}, {selectedProj.city}</p>
              </div>
              <button onClick={() => setSelectedProj(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">PLOTS</p><p className="text-lg font-bold text-[#162943]">{selectedProj.plotCount}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">AVAILABLE</p><p className="text-lg font-bold text-teal-600">{selectedProj.availableCount}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">ACRES</p><p className="text-lg font-bold text-[#162943]">{selectedProj.acres} ac</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">STATUS</p><p className="text-xs font-bold text-teal-600">{selectedProj.approvalStatus}</p></div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Description</p>
                <p className="text-xs leading-5 text-slate-500 rounded-xl bg-slate-50 p-3 border border-slate-100">{selectedProj.description}</p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <Link
                  href="/admin/map-management"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:underline"
                >
                  Open in Map Editor &rarr;
                </Link>

                <div className="flex gap-2">
                  {selectedProj.approvalStatus === 'Pending Review' && (
                    <button
                      onClick={() => { approveProject(selectedProj.id); setSelectedProj(null); }}
                      className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600"
                    >
                      Approve Project
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedProj(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleCreateProject} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#162943]">Add New Project</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="e.g. Royal Meadows" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Developer</label>
              <select value={newDevId} onChange={(e) => setNewDevId(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500">
                {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input value={newCity} onChange={(e) => setNewCity(e.target.value)} required className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality</label>
                <input value={newArea} onChange={(e) => setNewArea(e.target.value)} required className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Plots</label>
                <input type="number" value={newPlots} onChange={(e) => setNewPlots(Number(e.target.value))} required className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price From (₹)</label>
                <input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} required className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl">Save Project</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
