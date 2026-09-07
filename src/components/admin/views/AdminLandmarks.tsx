import React from 'react';
import { ArrowUpRight, Plus, MapPin } from 'lucide-react';

export function AdminLandmarks() {
  const landmarks = [
    { name: 'Rajiv Gandhi International Airport (RGIA)', category: 'Airport', distance: '12 km', time: '15 mins' },
    { name: 'Financial District & ORR Junction', category: 'IT Park / Highway', distance: '18 km', time: '22 mins' },
    { name: 'GMR Aerospace & Industrial Park', category: 'Commercial', distance: '4 km', time: '5 mins' },
    { name: 'Amazon HYD3 Logistics Hub', category: 'Commercial', distance: '6 km', time: '8 mins' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Nearby Landmarks</h1>
          <p className="mt-1 text-xs text-slate-500">Configure key points of interest, airports, highways, and travel times.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white shadow-sm">
          <Plus size={16} /> Add Landmark
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {landmarks.map((l) => (
          <div key={l.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold text-teal-600 uppercase">{l.category}</span>
              <h4 className="font-serif text-base font-bold text-[#162943] mt-1">{l.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{l.distance} away · ~{l.time} travel</p>
            </div>
            <ArrowUpRight size={18} className="text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
