import React from 'react';
import { CheckCircle2, CreditCard, Download, Eye } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminBookings() {
  const { bookings, updateBookingStatus } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Plot Bookings</h1>
          <p className="mt-1 text-xs text-slate-500">Audit expression-of-interest plot bookings and payment transactions.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Booking Code</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Project / Plot</th>
                <th className="px-5 py-3.5">Developer</th>
                <th className="px-5 py-3.5">Token Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4 font-mono font-bold text-[#162943]">
                    {bk.bookingCode}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">
                    {bk.customerName} <br />
                    <span className="text-[10px] text-slate-400 font-normal">{bk.customerPhone}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {bk.projectName} <span className="font-mono text-teal-600">(Plot #{bk.plotNumber})</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {bk.developerName}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-[#162943]">
                    ₹{(bk.bookingAmount / 100000).toFixed(1)}L
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 text-[10px] font-bold">
                      {bk.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                      {bk.bookingStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    {bk.bookingStatus === 'Pending' && (
                      <button
                        onClick={() => updateBookingStatus(bk.id, 'Confirmed')}
                        className="rounded-lg bg-teal-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-teal-600"
                      >
                        Confirm
                      </button>
                    )}
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
