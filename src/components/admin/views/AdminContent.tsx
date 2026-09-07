import React from 'react';
import { FileText, Star, Compass, Sparkles } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export function AdminContent() {
  const { projects, developers, toggleFeaturedProject } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#162943]">Content CMS & Featured Listings</h1>
          <p className="mt-1 text-xs text-slate-500">Control homepage hero banners, featured projects, and developer highlights.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#162943] mb-4">Featured Marketplace Projects</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div>
                <p className="font-bold text-[#162943] text-sm">{p.name}</p>
                <p className="text-xs text-slate-400">{p.developerName} · {p.city}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFeaturedProject(p.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  p.featured ? 'bg-amber-500 text-slate-900 shadow-xs' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                <Star size={13} fill={p.featured ? 'currentColor' : 'none'} />
                {p.featured ? 'Featured' : 'Mark Featured'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
