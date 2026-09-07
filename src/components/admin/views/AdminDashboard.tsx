import React from 'react';
import { Link } from 'wouter';
import {
  Building2, Compass, Layers3, Users, MessageSquare, CheckCircle2,
  TrendingUp, IndianRupee, AlertTriangle, ArrowRight, ShieldCheck,
  Check, X, Eye, FileText, ArrowUpRight, Plus, MapPin
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminDashboard() {
  const { developers, projects, plots, enquiries, bookings, activityLogs, approveDeveloper, approveProject } = useAdmin();

  const availablePlots = plots.filter((p) => p.status === 'Available').length;
  const onHoldPlots = plots.filter((p) => p.status === 'On Hold').length;
  const bookedPlots = plots.filter((p) => p.status === 'Booked' || p.status === 'Registration Completed').length;
  const soldPlots = plots.filter((p) => p.status === 'Sold').length;

  const totalRevenue = bookings.reduce((sum, b) => sum + b.bookingAmount, 0);

  const pendingDevs = developers.filter((d) => d.verificationStatus === 'Pending');
  const pendingProjects = projects.filter((p) => p.approvalStatus === 'Pending Review');
  const newEnquiries = enquiries.filter((e) => e.status === 'New');
  const pendingBookings = bookings.filter((b) => b.bookingStatus === 'Pending');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Platform Overview</h1>
          <p className="mt-1 text-xs text-slate-500">Monitor properties, developers, customers and platform activity across LandGrid.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/map-management"
            className="flex items-center gap-2 rounded-xl bg-[#162943] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#203a5e]"
          >
            <Compass size={15} /> Open Map Editor
          </Link>
          <Link
            href="/admin/companies"
            className="flex items-center gap-2 rounded-xl bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#118073]"
          >
            <Plus size={15} /> Add Developer
          </Link>
        </div>
      </div>

      {/* TOP STATISTICS CARDS (Grid of 8 KPIs) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Developers" value={developers.length.toString()} sub="48 active platform companies" icon={Building2} color="text-teal-600" bg="bg-teal-50" />
        <StatCard title="Total Projects" value={projects.length.toString()} sub="126 ventures listed" icon={Compass} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Total Plots" value="12,840" sub={`${plots.length} in active index`} icon={Layers3} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Available Plots" value="5,430" sub={`${availablePlots} ready for booking`} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Total Customers" value="18,420" sub="Registered buyers" icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard title="Total Enquiries" value="6,284" sub={`${newEnquiries.length} new today`} icon={MessageSquare} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Total Bookings" value="1,248" sub={`${pendingBookings.length} pending review`} icon={TrendingUp} color="text-sky-600" bg="bg-sky-50" />
        <StatCard title="Total Revenue" value="₹18.6 Cr" sub={`₹${(totalRevenue / 100000).toFixed(1)}L this month`} icon={IndianRupee} color="text-emerald-700" bg="bg-emerald-100/60" />
      </div>

      {/* REQUIRES ATTENTION SECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#162943]">Requires Attention</h3>
            <p className="text-xs text-slate-500">Action items waiting for platform administrator approval or review.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 font-mono text-xs font-bold text-amber-800">
            {pendingDevs.length + pendingProjects.length + newEnquiries.length + pendingBookings.length} pending items
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AttentionCard
            title="Pending Developer Approvals"
            count={pendingDevs.length}
            description="New developers submitted company & business documents."
            href="/admin/companies"
            badgeColor="bg-amber-500"
          />
          <AttentionCard
            title="Pending Project Reviews"
            count={pendingProjects.length}
            description="Projects awaiting master plan and RERA review."
            href="/admin/projects"
            badgeColor="bg-blue-500"
          />
          <AttentionCard
            title="New Property Enquiries"
            count={newEnquiries.length}
            description="Unassigned customer enquiries sent to developers."
            href="/admin/enquiries"
            badgeColor="bg-emerald-500"
          />
          <AttentionCard
            title="Pending Booking Confirmations"
            count={pendingBookings.length}
            description="Plot booking tokens awaiting payment verification."
            href="/admin/bookings"
            badgeColor="bg-purple-500"
          />
        </div>
      </div>

      {/* DASHBOARD CHARTS & INVENTORY STATUS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plot Inventory Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#162943]">Plot Inventory Status</h3>
          <p className="text-xs text-slate-500">Current allocation across registered ventures.</p>

          <div className="mt-6 space-y-4">
            <ProgressBar label="Available Plots" count={availablePlots} total={plots.length} color="bg-emerald-500" />
            <ProgressBar label="On Hold / Mortgage" count={onHoldPlots} total={plots.length} color="bg-blue-500" />
            <ProgressBar label="Booked / Registered" count={bookedPlots} total={plots.length} color="bg-purple-500" />
            <ProgressBar label="Sold Out" count={soldPlots} total={plots.length} color="bg-slate-400" />
          </div>

          <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Fastest Selling Venture</span>
              <span className="text-[#159b8b]">Aanvi Heights (75% Sold)</span>
            </div>
          </div>
        </div>

        {/* Property Listings & Booking Trends */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#162943]">Monthly Performance Trends</h3>
              <p className="text-xs text-slate-500">Project listings and booking volume over the last 6 months.</p>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-400">2026 YTD</span>
          </div>

          {/* SVG Performance Chart Mock */}
          <div className="mt-6 h-48 w-full">
            <svg viewBox="0 0 500 150" className="h-full w-full">
              {/* Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area path */}
              <path
                d="M 0,120 Q 80,90 160,105 T 320,40 T 500,20 L 500,150 L 0,150 Z"
                fill="url(#tealGradient)"
                opacity="0.2"
              />
              <path
                d="M 0,120 Q 80,90 160,105 T 320,40 T 500,20"
                fill="none"
                stroke="#159b8b"
                strokeWidth="3"
              />

              <defs>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#159b8b" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">New Projects</p>
              <p className="text-base font-bold text-[#162943]">+14 this month</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Enquiries Conversion</p>
              <p className="text-base font-bold text-teal-600">19.8%</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Avg Plot Price</p>
              <p className="text-base font-bold text-[#162943]">₹3,450 / sqft</p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY LOGS & PENDING ACTION TABLE */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approval List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-[#162943]">Pending Developer Onboarding</h3>
            <Link href="/admin/companies" className="text-xs font-bold text-teal-600 hover:underline">View all ({pendingDevs.length})</Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {pendingDevs.length ? pendingDevs.map((dev) => (
              <div key={dev.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-mono text-xs font-bold text-[#162943]">
                    {dev.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#162943]">{dev.name}</p>
                    <p className="text-[10px] text-slate-400">{dev.city} · Submitted {dev.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => approveDeveloper(dev.id)}
                    className="flex h-8 items-center gap-1 rounded-lg bg-teal-50 px-2.5 text-[11px] font-bold text-teal-700 hover:bg-teal-100"
                  >
                    <Check size={13} /> Approve
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-xs text-slate-400">No pending developer reviews at this moment.</div>
            )}
          </div>
        </div>

        {/* Audit Activity Feed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-[#162943]">Recent Platform Activity</h3>
            <Link href="/admin/activity" className="text-xs font-bold text-teal-600 hover:underline">Full Log</Link>
          </div>

          <div className="mt-4 space-y-4 max-h-72 overflow-y-auto">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[#159b8b] flex-shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{log.action}: <span className="text-[#159b8b]">{log.entity}</span></p>
                  <p className="text-[11px] text-slate-500">{log.details}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-400">{log.user} · {log.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#162943]">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-500">{sub}</p>
    </div>
  );
}

function AttentionCard({ title, count, description, href, badgeColor }: any) {
  return (
    <Link href={href} className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#159b8b] hover:bg-white hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 font-mono text-xs font-bold text-white ${badgeColor}`}>
          {count}
        </span>
        <ArrowRight size={15} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#159b8b]" />
      </div>
      <h4 className="mt-3 text-xs font-bold text-[#162943]">{title}</h4>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{description}</p>
    </Link>
  );
}

function ProgressBar({ label, count, total, color }: any) {
  const percent = Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-700">
        <span>{label}</span>
        <span className="font-mono font-bold">{count} ({percent}%)</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
