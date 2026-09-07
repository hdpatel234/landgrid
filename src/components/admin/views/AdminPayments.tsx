import React from 'react';
import { CreditCard, IndianRupee, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function AdminPayments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Payment & Transactions</h1>
          <p className="mt-1 text-xs text-slate-500">Platform revenue, gateway settlements, and booking token transactions.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Total Platform Volume</span>
          <p className="font-serif text-3xl font-bold text-[#162943] mt-2">₹18.6 Cr</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Token Collections</span>
          <p className="font-serif text-3xl font-bold text-teal-600 mt-2">₹1.15 Cr</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Gateway Fees</span>
          <p className="font-serif text-3xl font-bold text-slate-700 mt-2">₹2.3L</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Refunds Processed</span>
          <p className="font-serif text-3xl font-bold text-rose-600 mt-2">₹0.00</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#162943] mb-4">Payment Gateway Integration Status</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50"><p className="text-xs font-bold text-slate-800">Razorpay Direct API</p><p className="text-[10px] text-teal-600 font-bold mt-1">● Operational</p></div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50"><p className="text-xs font-bold text-slate-800">Stripe Connect</p><p className="text-[10px] text-teal-600 font-bold mt-1">● Operational</p></div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50"><p className="text-xs font-bold text-slate-800">Bank NEFT/RTGS Verification</p><p className="text-[10px] text-amber-600 font-bold mt-1">● Manual Approval Mode</p></div>
        </div>
      </div>
    </div>
  );
}
