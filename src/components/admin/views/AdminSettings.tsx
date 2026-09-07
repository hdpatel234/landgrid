import React from 'react';
import { Settings, Save, Shield } from 'lucide-react';

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Platform Settings</h1>
          <p className="mt-1 text-xs text-slate-500">Configure marketplace defaults, email notifications, payment keys and SEO metadata.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-5 py-2.5 text-xs font-bold text-white shadow-xs">
          <Save size={15} /> Save Platform Settings
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#162943]">General Configuration</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Platform Name</label>
            <input defaultValue="LandGrid Property Marketplace" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
            <input defaultValue="support@landgrid.com" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
            <input defaultValue="₹ (INR)" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#162943]">Booking Token Settings</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Token Hold Duration (Hours)</label>
            <input defaultValue="48 hours" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Platform Commission Fee (%)</label>
            <input defaultValue="1.5%" className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
