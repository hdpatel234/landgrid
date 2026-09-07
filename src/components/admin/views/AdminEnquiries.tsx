import React, { useState } from 'react';
import { MessageSquare, Search, Filter, CheckCircle2, User, Clock } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminEnquiries() {
  const { enquiries, updateEnquiryStatus } = useAdmin();
  const [search, setSearch] = useState('');

  const filtered = enquiries.filter((e) =>
    e.customerName.toLowerCase().includes(search.toLowerCase()) ||
    e.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Property Enquiries</h1>
          <p className="mt-1 text-xs text-slate-500">Track and assign buyer inquiries across developers.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by buyer name or project..."
            className="h-10 w-full sm:w-80 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-teal-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Project / Plot</th>
                <th className="px-5 py-3.5">Developer</th>
                <th className="px-5 py-3.5">Message</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((enq) => (
                <tr key={enq.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4 font-bold text-[#162943]">
                    {enq.customerName} <br />
                    <span className="text-[10px] text-slate-400 font-normal">{enq.customerPhone}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {enq.projectName} {enq.plotNumber && <span className="font-mono text-teal-600">(Plot #{enq.plotNumber})</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {enq.developerName}
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                    {enq.message}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-400">
                    {enq.date}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold">
                      {enq.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    <button
                      onClick={() => updateEnquiryStatus(enq.id, 'Contacted')}
                      className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100"
                    >
                      Mark Contacted
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
