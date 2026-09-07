import React from 'react';
import { UserRound, Key, Shield } from 'lucide-react';

export function AdminProfile() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Admin Account Profile</h1>
          <p className="mt-1 text-xs text-slate-500">Administrator security settings and session credentials.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#162943] text-2xl font-bold text-white">
            A
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#162943]">Super Administrator</h3>
            <p className="text-xs text-teal-600 font-bold">Role: Full System Access</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div><label className="block font-bold text-slate-700 mb-1">Email</label><input defaultValue="admin@landgrid.com" readOnly className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-slate-50 font-mono" /></div>
          <div><label className="block font-bold text-slate-700 mb-1">Phone</label><input defaultValue="+91 90000 00000" readOnly className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-slate-50 font-mono" /></div>
        </div>
      </div>
    </div>
  );
}
