import React, { useState } from 'react';
import {
  Users, Search, Filter, ShieldCheck, Mail, Phone, Eye, MoreHorizontal, UserX
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminUsers() {
  const { users } = useAdmin();
  const [roleTab, setRoleTab] = useState<'All' | 'Customer' | 'Developer' | 'Agent' | 'Admin'>('All');
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const matchRole = roleTab === 'All' || u.role === roleTab;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">User Accounts</h1>
          <p className="mt-1 text-xs text-slate-500">Manage buyer customers, developer delegates, and system administrators.</p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Customer', 'Developer', 'Agent', 'Admin'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleTab(r)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              roleTab === r ? 'bg-[#162943] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {r}s
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Enquiries</th>
                <th className="px-5 py-3.5">Bookings</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4 font-bold text-[#162943]">
                    {u.name}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {u.email} <br /> <span className="text-[10px] text-slate-400">{u.phone}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-800">
                    {u.enquiriesCount}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-teal-600">
                    {u.bookingsCount}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 text-[10px] font-bold">
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-400">
                    {u.createdAt}
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
