import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminActivity() {
  const { activityLogs } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Admin Activity & Audit Logs</h1>
          <p className="mt-1 text-xs text-slate-500">Immutable trail of developer approvals, plot status overrides, and system changes.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Admin User</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Details</th>
                <th className="px-5 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4 font-bold text-[#162943]">{log.user}</td>
                  <td className="px-5 py-4 font-semibold text-teal-600">{log.action}</td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-700">{log.entity}</td>
                  <td className="px-5 py-4 font-mono text-slate-400">{log.ip}</td>
                  <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{log.details}</td>
                  <td className="px-5 py-4 font-mono text-slate-400">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
