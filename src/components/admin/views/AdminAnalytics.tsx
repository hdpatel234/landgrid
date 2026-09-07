import React from 'react';
import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminAnalytics() {
  const { developers } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Platform Analytics & Rankings</h1>
          <p className="mt-1 text-xs text-slate-500">Developer conversion rates, view performance, and customer growth trends.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#162943] mb-4">Top Performing Developers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Developer</th>
                <th className="px-4 py-3">Projects</th>
                <th className="px-4 py-3">Total Views</th>
                <th className="px-4 py-3">Enquiries</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {developers.map((d, index) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-[#162943] flex items-center gap-2">
                    <span className="font-mono text-slate-400">#{index + 1}</span> {d.name}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-700">{d.projectsCount}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{(d.enquiriesCount * 9.5).toFixed(0)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">{d.enquiriesCount}</td>
                  <td className="px-4 py-3 font-mono font-bold text-teal-600">{Math.round(d.enquiriesCount * 0.15)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-600">15.2%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
