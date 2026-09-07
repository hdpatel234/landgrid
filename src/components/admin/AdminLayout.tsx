import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Building2, Map as MapIcon, Layers3, Users, MessageSquare, CreditCard,
  MapPin, ShieldAlert, BarChart3, FileText, Bell, Settings, LogOut,
  Search, ChevronDown, Menu, X, Compass, CheckCircle2, AlertTriangle,
  HelpCircle, Eye, ArrowUpRight, Plus, SlidersHorizontal, Sparkles, UserRound
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { developers, projects, plots, enquiries, bookings, notificationsCount } = useAdmin();

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboardIcon }
      ]
    },
    {
      title: 'MARKETPLACE',
      items: [
        { label: 'Companies', href: '/admin/companies', icon: Building2, badge: developers.filter(d => d.verificationStatus === 'Pending').length },
        { label: 'Projects', href: '/admin/projects', icon: Compass, badge: projects.filter(p => p.approvalStatus === 'Pending Review').length },
        { label: 'Plots Inventory', href: '/admin/plots', icon: Layers3 },
        { label: 'Locations', href: '/admin/locations', icon: MapPin }
      ]
    },
    {
      title: 'CUSTOMERS & SALES',
      items: [
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare, badge: enquiries.filter(e => e.status === 'New').length },
        { label: 'Bookings', href: '/admin/bookings', icon: CheckCircle2, badge: bookings.filter(b => b.bookingStatus === 'Pending').length },
        { label: 'Payments', href: '/admin/payments', icon: CreditCard }
      ]
    },
    {
      title: 'MAP & CONTENT',
      items: [
        { label: 'Map Management', href: '/admin/map-management', icon: MapIcon },
        { label: 'Amenities', href: '/admin/amenities', icon: Sparkles },
        { label: 'Landmarks', href: '/admin/landmarks', icon: ArrowUpRight },
        { label: 'Content CMS', href: '/admin/content', icon: FileText }
      ]
    },
    {
      title: 'ANALYTICS & REPORTS',
      items: [
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Reports', href: '/admin/reports', icon: SlidersHorizontal }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Notifications', href: '/admin/notifications', icon: Bell },
        { label: 'Activity Logs', href: '/admin/activity', icon: ShieldAlert },
        { label: 'Settings', href: '/admin/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* LEFT SIDEBAR (Desktop) */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-800 bg-[#162943] text-slate-300 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#159b8b] font-bold text-white shadow-lg">
              LG
            </div>
            {!collapsed && (
              <div>
                <span className="block font-serif text-lg font-bold tracking-tight text-white">LandGrid</span>
                <span className="block text-[9px] font-mono tracking-wider uppercase text-teal-400">Platform Admin</span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${isActive
                        ? 'bg-[#159b8b] text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                      <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge && item.badge > 0 ? (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-slate-900">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Bottom User & Exit */}
        <div className="border-t border-slate-800 p-3 space-y-1">
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">
              A
            </div>
            {!collapsed && (
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-white truncate">Super Admin</p>
                <p className="text-[10px] text-slate-400 truncate">admin@landgrid.com</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-64 md:w-96">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global Search (Developers, Projects, Plots, Enquiries...)"
                className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs font-medium outline-none focus:border-[#159b8b] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Switch to Customer Portal */}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#162943] hover:border-[#159b8b]"
            >
              <Eye size={14} className="text-[#159b8b]" /> View Customer Site
            </Link>

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
              >
                <Bell size={18} />
                {notificationsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 font-mono text-[9px] font-bold text-white">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-bold text-[#162943]">System Notifications</h4>
                    <span className="text-[10px] font-bold text-teal-600">Mark all read</span>
                  </div>
                  <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                    <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-2.5 text-xs">
                      <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">New Developer Registration</p>
                        <p className="text-[11px] text-slate-500">GreenField Developers submitted documents for review.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-teal-50 p-2.5 text-xs">
                      <CheckCircle2 size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">Booking Confirmed</p>
                        <p className="text-[11px] text-slate-500">Vikrant Roy booked Plot P-004 in Aanvi Heights.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 hover:border-[#159b8b]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#162943] text-xs font-bold text-white">
                  A
                </div>
                <span className="hidden md:inline text-xs font-bold text-[#162943]">Platform Admin</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <Link href="/admin/profile" className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Admin Profile
                  </Link>
                  <Link href="/admin/settings" className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Settings
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <Link href="/" className="block rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MOBILE DRAWER */}
        {mobileMenu && (
          <div className="fixed inset-0 z-50 flex bg-slate-900/60 lg:hidden">
            <div className="w-72 bg-[#162943] p-4 text-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-serif text-lg font-bold">LandGrid Admin</span>
                <button type="button" onClick={() => setMobileMenu(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              <div className="mt-4 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
                {navGroups.flatMap(g => g.items).map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenu(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      <Icon size={18} /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function LayoutDashboardIcon(props: any) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
