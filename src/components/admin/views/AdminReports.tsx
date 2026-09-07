import React from 'react';
import { SlidersHorizontal, Download, FileText } from 'lucide-react';

export function AdminReports() {
  const reports = [
    { title: 'Developer Performance Report', type: 'PDF / Excel', size: '2.4 MB' },
    { title: 'Monthly Plot Inventory Audit', type: 'CSV / Excel', size: '4.1 MB' },
    { title: 'Customer Enquiry Conversion Summary', type: 'PDF', size: '1.2 MB' },
    { title: 'Platform Token Revenue & GST Statement', type: 'PDF / Excel', size: '3.8 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Platform Reports Center</h1>
          <p className="mt-1 text-xs text-slate-500">Export marketplace reports, inventory spreadsheets and financial logs.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <div key={r.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#159b8b]">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#162943]">{r.title}</h4>
                <p className="text-xs text-slate-400">{r.type} · {r.size}</p>
              </div>
            </div>
            <button
              onClick={() => alert(`Simulated Download: ${r.title}`)}
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              <Download size={14} /> Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
