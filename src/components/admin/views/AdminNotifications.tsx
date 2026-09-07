import React, { useState } from 'react';
import { Bell, Send, CheckCircle2 } from 'lucide-react';

export function AdminNotifications() {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Notifications & Broadcasting</h1>
          <p className="mt-1 text-xs text-slate-500">Send system alerts to developers and customer accounts.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs max-w-xl">
        <h3 className="font-serif text-lg font-bold text-[#162943] mb-3">Broadcast Alert</h3>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
            <select className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-teal-500">
              <option>All Developers & Companies</option>
              <option>All Registered Customers</option>
              <option>Platform Administrators</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notification Message</label>
            <textarea
              rows={4}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              required
              placeholder="e.g. Scheduled platform maintenance on Sunday 2:00 AM..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-teal-500"
            />
          </div>
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-teal-600">
            <Send size={15} /> Send Broadcast
          </button>
          {sent && <p className="text-xs font-bold text-teal-600 flex items-center gap-1"><CheckCircle2 size={14} /> Alert broadcasted successfully!</p>}
        </form>
      </div>
    </div>
  );
}
