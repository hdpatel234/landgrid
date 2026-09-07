import React from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';

export function AdminAmenities() {
  const amenities = [
    { name: 'Clubhouse & Party Lawn', category: 'Infrastructure', count: 45 },
    { name: 'Native Tree Boulevard', category: 'Landscape', count: 82 },
    { name: 'Children’s Play Park', category: 'Recreation', count: 68 },
    { name: '24/7 Gated Security & CCTV', category: 'Security', count: 110 },
    { name: 'Underground Drainage & Electricity', category: 'Utilities', count: 95 },
    { name: '33ft / 40ft Blacktop Roads', category: 'Infrastructure', count: 126 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Amenities Catalog</h1>
          <p className="mt-1 text-xs text-slate-500">Manage project amenity tags and feature indicators.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white shadow-sm">
          <Plus size={16} /> Add Amenity
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {amenities.map((a) => (
          <div key={a.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <Sparkles size={18} className="text-amber-500" />
              <span className="font-mono text-[10px] font-bold text-slate-400">{a.category}</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-[#162943] mt-3">{a.name}</h4>
            <p className="text-xs text-slate-500 mt-1">Used in {a.count} projects</p>
          </div>
        ))}
      </div>
    </div>
  );
}
