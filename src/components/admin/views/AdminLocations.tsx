import React from 'react';
import { MapPin, Plus, Building2 } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminLocations() {
  const { projects } = useAdmin();

  const locations = [
    { city: 'Hyderabad', state: 'Telangana', count: projects.filter(p => p.city === 'Hyderabad').length, status: 'Active' },
    { city: 'Bengaluru', state: 'Karnataka', count: projects.filter(p => p.city === 'Bengaluru').length, status: 'Active' },
    { city: 'Pune', state: 'Maharashtra', count: projects.filter(p => p.city === 'Pune').length, status: 'Active' },
    { city: 'Mysuru', state: 'Karnataka', count: 4, status: 'Active' },
    { city: 'Ahmedabad', state: 'Gujarat', count: 9, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Locations & Geography</h1>
          <p className="mt-1 text-xs text-slate-500">Configure regions, states, cities and project corridors.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white shadow-sm">
          <Plus size={16} /> Add City / Region
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {locations.map((loc) => (
          <div key={loc.city} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <MapPin size={20} className="text-[#159b8b]" />
              <span className="rounded-full bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-700">{loc.count} Projects</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#162943] mt-4">{loc.city}</h3>
            <p className="text-xs text-slate-400 mt-1">{loc.state}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
