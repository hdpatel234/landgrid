import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Building2, Search, Filter, Plus, CheckCircle2, AlertTriangle,
  XCircle, MoreHorizontal, Check, X, Shield, Eye, Mail, Phone, Globe, MapPin
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { DeveloperAdmin } from '../../../lib/adminMockData';

export function AdminCompanies() {
  const { developers, approveDeveloper, rejectDeveloper, suspendDeveloper, addDeveloper } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDev, setSelectedDev] = useState<DeveloperAdmin | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding developer
  const [newDevName, setNewDevName] = useState('');
  const [newDevCity, setNewDevCity] = useState('Hyderabad');
  const [newDevContact, setNewDevContact] = useState('');
  const [newDevEmail, setNewDevEmail] = useState('');
  const [newDevPhone, setNewDevPhone] = useState('');

  const filtered = developers.filter((dev) => {
    const matchSearch = dev.name.toLowerCase().includes(search.toLowerCase()) || dev.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || dev.verificationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName) return;
    addDeveloper({
      name: newDevName,
      city: newDevCity,
      contactPerson: newDevContact,
      email: newDevEmail,
      phone: newDevPhone
    });
    setNewDevName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Developers & Companies</h1>
          <p className="mt-1 text-xs text-slate-500">Manage, verify and audit real estate companies on the LandGrid platform.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#118073]"
        >
          <Plus size={16} /> Add Developer
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name, city or contact..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#159b8b]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending Review</option>
            <option value="Rejected">Rejected</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table of Companies */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Company Name</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Projects</th>
                <th className="px-5 py-3.5">Plots</th>
                <th className="px-5 py-3.5">Enquiries</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length ? filtered.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#162943] font-mono text-xs font-bold text-teal-400">
                        {dev.initials}
                      </div>
                      <div>
                        <button
                          onClick={() => setSelectedDev(dev)}
                          className="font-bold text-[#162943] hover:text-[#159b8b] text-left block"
                        >
                          {dev.name}
                        </button>
                        <span className="text-[10px] text-slate-400">Since {dev.founded} · {dev.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-medium">
                    {dev.city}, {dev.state}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-800">
                    {dev.projectsCount}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-800">
                    {dev.plotsCount}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-teal-600">
                    {dev.enquiriesCount}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      dev.verificationStatus === 'Verified' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      dev.verificationStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {dev.verificationStatus === 'Verified' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {dev.verificationStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-amber-600">
                    ★ {dev.rating}
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    <button
                      onClick={() => setSelectedDev(dev)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    {dev.verificationStatus === 'Pending' && (
                      <button
                        onClick={() => approveDeveloper(dev.id)}
                        className="rounded-lg bg-teal-500 p-1.5 text-white hover:bg-teal-600"
                        title="Approve Developer"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    {dev.verificationStatus !== 'Suspended' && (
                      <button
                        onClick={() => suspendDeveloper(dev.id)}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                        title="Suspend Developer"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No developers match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-rise">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 font-mono text-sm font-bold text-white">
                  {selectedDev.initials}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">{selectedDev.name}</h3>
                  <p className="text-xs text-slate-300">{selectedDev.city}, {selectedDev.state} · Registered {selectedDev.createdAt}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDev(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">PROJECTS</p><p className="text-lg font-bold text-[#162943]">{selectedDev.projectsCount}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">PLOTS</p><p className="text-lg font-bold text-[#162943]">{selectedDev.plotsCount}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">ENQUIRIES</p><p className="text-lg font-bold text-teal-600">{selectedDev.enquiriesCount}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-mono text-slate-400">STATUS</p><p className="text-xs font-bold text-teal-600">{selectedDev.verificationStatus}</p></div>
              </div>

              <div className="space-y-3 text-xs">
                <p className="font-mono text-[10px] uppercase font-bold text-slate-400">Company & Contact Info</p>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div><span className="text-slate-400 block text-[10px]">Contact Person</span><span className="font-bold text-slate-800">{selectedDev.contactPerson}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Email Address</span><span className="font-bold text-slate-800">{selectedDev.email}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Phone Number</span><span className="font-bold text-slate-800">{selectedDev.phone}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Website</span><a href={selectedDev.website} target="_blank" rel="noreferrer" className="font-bold text-teal-600 underline">{selectedDev.website}</a></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                {selectedDev.verificationStatus === 'Pending' && (
                  <button
                    onClick={() => { approveDeveloper(selectedDev.id); setSelectedDev(null); }}
                    className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600"
                  >
                    Approve Developer
                  </button>
                )}
                <button
                  onClick={() => { suspendDeveloper(selectedDev.id); setSelectedDev(null); }}
                  className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100"
                >
                  Suspend Account
                </button>
                <button
                  onClick={() => setSelectedDev(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEVELOPER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#162943]">Add Developer Company</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input value={newDevName} onChange={(e) => setNewDevName(e.target.value)} required placeholder="e.g. Acme Properties" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
              <input value={newDevCity} onChange={(e) => setNewDevCity(e.target.value)} required placeholder="e.g. Hyderabad" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input value={newDevContact} onChange={(e) => setNewDevContact(e.target.value)} placeholder="Full Name" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input value={newDevEmail} onChange={(e) => setNewDevEmail(e.target.value)} type="email" placeholder="dev@company.com" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input value={newDevPhone} onChange={(e) => setNewDevPhone(e.target.value)} placeholder="+91 90000 00000" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl">Save & Onboard</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
