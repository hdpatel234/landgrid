import React, { Fragment, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GeoJSON, MapContainer, TileLayer, Tooltip, Polyline, useMap } from 'react-leaflet';
import type { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  ArrowDown, ArrowRight, BadgeCheck, Building2, CalendarDays, Check, ChevronDown, Compass,
  ExternalLink, Eye, FileCheck2, Filter, Heart, Home, Landmark, Layers3, LocateFixed,
  LogIn, Map as MapIcon, MapPin, Menu, MessageSquare, Minimize2, Minus, Plus, RotateCcw,
  Search, ShieldCheck, SlidersHorizontal, Trees, UserRound, UsersRound, X
} from 'lucide-react';
import { Map3DView } from './components/Map3DView';
import { AdminProvider } from './context/AdminContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/views/AdminDashboard';
import { AdminCompanies } from './components/admin/views/AdminCompanies';
import { AdminProjects } from './components/admin/views/AdminProjects';
import { AdminPlots } from './components/admin/views/AdminPlots';
import { AdminMapManagement } from './components/admin/views/AdminMapManagement';
import { AdminUsers } from './components/admin/views/AdminUsers';
import { AdminEnquiries } from './components/admin/views/AdminEnquiries';
import { AdminBookings } from './components/admin/views/AdminBookings';
import { AdminPayments } from './components/admin/views/AdminPayments';
import { AdminLocations } from './components/admin/views/AdminLocations';
import { AdminAmenities } from './components/admin/views/AdminAmenities';
import { AdminLandmarks } from './components/admin/views/AdminLandmarks';
import { AdminAnalytics } from './components/admin/views/AdminAnalytics';
import { AdminReports } from './components/admin/views/AdminReports';
import { AdminContent } from './components/admin/views/AdminContent';
import { AdminNotifications } from './components/admin/views/AdminNotifications';
import { AdminActivity } from './components/admin/views/AdminActivity';
import { AdminSettings } from './components/admin/views/AdminSettings';
import { AdminProfile } from './components/admin/views/AdminProfile';

type PlotStatus = 'Available' | 'On Hold' | 'Registration Completed' | 'Sold';
type PlotType = 'Standard' | 'Corner' | 'Premium';
type Plot = { id: string; number: number; sector: string; status: PlotStatus; facing: string; road: string; area: number; price: number; type: PlotType; coordinates: [number, number][]; x3d: number; z3d: number; w3d: number; d3d: number };
type Developer = { id: string; name: string; slug: string; initials: string; founded: string; projects: number; description: string; tone: string };
type Project = { id: string; slug: string; name: string; developer: Developer; city: string; area: string; type: string; status: string; possession: string; priceFrom: number; plotCount: number; available: number; acres: number; approval: string; featured: boolean; description: string; accent: string; lat: number; lng: number };
type Enquiry = { id: string; project: string; plot?: string; developer: string; date: string; status: 'New' | 'Advisor assigned' | 'Closed' };

const queryClient = new QueryClient();
const teal = '#159b8b';
const navy = '#162943';
const center: LatLngExpression = [17.2495, 78.4514];
const facingOptions = ['North', 'South', 'East', 'West', 'NE', 'NW', 'SE', 'SW'];
const roadOptions = ['30 ft', '33 ft', '40 ft', '60 ft'];
const statusOptions: PlotStatus[] = ['Available', 'On Hold', 'Registration Completed', 'Sold'];
const statusMeta: Record<PlotStatus, { fill: string; stroke: string; ink: string; label: string }> = {
  Available: { fill: '#44b9a7', stroke: '#137d73', ink: '#0c665c', label: 'Available' },
  'On Hold': { fill: '#f0ca72', stroke: '#bf9441', ink: '#8a651d', label: 'On hold' },
  'Registration Completed': { fill: '#8fb3db', stroke: '#557da8', ink: '#315d8b', label: 'Registered' },
  Sold: { fill: '#c5cbd1', stroke: '#8d98a5', ink: '#687582', label: 'Sold' },
};

const developers: Developer[] = [
  { id: 'dev-sreeni', name: 'Sreeni Groups', slug: 'sreeni-groups', initials: 'SG', founded: '2008', projects: 4, description: 'Thoughtful plotted communities across Hyderabad’s southern growth belt.', tone: '#159b8b' },
  { id: 'dev-verdant', name: 'Verdant Habitat', slug: 'verdant-habitat', initials: 'VH', founded: '2013', projects: 3, description: 'Low-density land communities that give nature room to stay visible.', tone: '#6d8f6e' },
  { id: 'dev-arcstone', name: 'Arcstone Estates', slug: 'arcstone-estates', initials: 'AE', founded: '1999', projects: 3, description: 'Civic-minded layouts built around access, title clarity and value.', tone: '#cc8d4d' },
  { id: 'dev-nestline', name: 'Nestline Properties', slug: 'nestline-properties', initials: 'NP', founded: '2017', projects: 2, description: 'First-home friendly plots in the next ring of India’s fastest cities.', tone: '#8d78ad' },
  { id: 'dev-morrow', name: 'Morrow Land Co.', slug: 'morrow-land-co', initials: 'ML', founded: '2020', projects: 3, description: 'Modern land ownership, made transparent for the long view.', tone: '#3d7da3' },
];

const developerFor = (id: string) => developers.find((developer) => developer.id === id) ?? developers[0];
const projectSeeds = [
  ['Aanvi Heights', 'Sreeni Groups', 'Manisam Pally', 'Hyderabad', 'Plots', 'Ready to build', '₹45.6L', 110, 47, 14.8, 'RERA approved', true, 'A quiet, planned address on Hyderabad’s southern edge, with a considered green spine and flexible plot sizes.', '#159b8b', 17.2495, 78.4514],
  ['Meridian Grove', 'Verdant Habitat', 'Shamshabad', 'Hyderabad', 'Villa plots', 'Launching soon', '₹38.2L', 84, 62, 11.2, 'HMDA approved', true, 'A green-first plotted neighbourhood with wide boulevards and a short airport commute.', '#6d8f6e', 17.226, 78.389],
  ['The Foundry District', 'Arcstone Estates', 'Tellapur', 'Hyderabad', 'Urban plots', 'Ready to build', '₹72.5L', 76, 24, 9.6, 'RERA approved', true, 'Serviced plots for people who want a city address and the freedom to shape what comes next.', '#cc8d4d', 17.456, 78.318],
  ['Aster Fields', 'Morrow Land Co.', 'Devanahalli', 'Bengaluru', 'Plots', 'Launching soon', '₹31.8L', 132, 96, 18.4, 'BIAAPA approved', true, 'A clear-title land community near Bengaluru’s northern airport corridor.', '#3d7da3', 13.249, 77.711],
  ['Lakeview 28', 'Nestline Properties', 'Kondapur', 'Hyderabad', 'Premium plots', 'Ready to build', '₹1.12Cr', 58, 11, 6.8, 'RERA approved', true, 'A compact, premium layout for a sharper city life and a slower daily rhythm.', '#8d78ad', 17.47, 78.36],
  ['Nila Courtyard', 'Sreeni Groups', 'Kandukur', 'Hyderabad', 'Plots', 'Under development', '₹28.4L', 144, 113, 22.1, 'DTCP approved', false, 'Big skies, clean documentation and plots that leave room for a meaningful home.', '#159b8b', 17.09, 78.39],
  ['Canopy County', 'Verdant Habitat', 'Yelahanka', 'Bengaluru', 'Villa plots', 'Ready to build', '₹61.3L', 95, 28, 15.2, 'BIAAPA approved', false, 'A native-tree-led neighbourhood with generous roads and a practical community plan.', '#6d8f6e', 13.12, 77.58],
  ['Kaveri Rise', 'Arcstone Estates', 'Mysuru Road', 'Bengaluru', 'Plots', 'Launching soon', '₹24.9L', 210, 178, 28.5, 'BMRDA approved', false, 'A plotted address with the road network and neighbourhood energy to grow into.', '#cc8d4d', 12.87, 77.39],
  ['Northstar Enclave', 'Morrow Land Co.', 'Shadnagar', 'Hyderabad', 'Plots', 'Ready to build', '₹19.7L', 168, 139, 24.8, 'RERA approved', false, 'An accessible ownership story for buyers looking south without losing city links.', '#3d7da3', 17.04, 78.20],
  ['Sandalwood Reserve', 'Nestline Properties', 'Sarjapur', 'Bengaluru', 'Premium plots', 'Under development', '₹88.4L', 64, 31, 10.5, 'BMRDA approved', false, 'A smaller reserve of premium plots shaped around a central commons.', '#8d78ad', 12.86, 77.75],
  ['Cedar Mile', 'Sreeni Groups', 'Maheshwaram', 'Hyderabad', 'Plots', 'Launching soon', '₹23.1L', 188, 166, 26.2, 'DTCP approved', false, 'A long-view land parcel on the Maheshwaram corridor with efficient plot planning.', '#159b8b', 17.11, 78.42],
  ['Orchard 17', 'Verdant Habitat', 'Hoskote', 'Bengaluru', 'Villa plots', 'Ready to build', '₹35.6L', 118, 73, 17.9, 'BIAAPA approved', false, 'An orchard-led community with honest infrastructure and a flexible build horizon.', '#6d8f6e', 13.07, 77.8],
  ['Terrace Park', 'Arcstone Estates', 'Kokapet', 'Hyderabad', 'Urban plots', 'Under development', '₹96.2L', 52, 17, 7.1, 'RERA approved', false, 'A limited collection of urban plots near the city’s westward centre of gravity.', '#cc8d4d', 17.39, 78.31],
  ['Avara Meadows', 'Morrow Land Co.', 'Electronic City', 'Bengaluru', 'Plots', 'Launching soon', '₹27.4L', 156, 122, 20.4, 'BMRDA approved', false, 'A measured land community for a new chapter south of the city.', '#3d7da3', 12.82, 77.66],
  ['Bluebell Quarter', 'Sreeni Groups', 'Shamshabad', 'Hyderabad', 'Plots', 'Ready to build', '₹42.8L', 92, 39, 12.7, 'HMDA approved', false, 'A neighbourhood-scale project with an easy airport connection and clear next steps.', '#159b8b', 17.20, 78.43],
] as const;
const projects: Project[] = projectSeeds.map((seed, index) => ({
  id: `project-${index + 1}`, slug: seed[0].toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: seed[0], developer: developerFor(`dev-${seed[1].toLowerCase().split(' ')[0] === 'sreeni' ? 'sreeni' : seed[1].toLowerCase().split(' ')[0]}`.replace('verdant', 'verdant').replace('arcstone', 'arcstone').replace('nestline', 'nestline').replace('morrow', 'morrow')), city: seed[3], area: seed[2], type: seed[4], status: seed[5], possession: seed[5] === 'Ready to build' ? 'Immediate' : seed[5] === 'Launching soon' ? 'Q4 2025' : 'Q2 2026', priceFrom: Number(String(seed[6]).replace(/[₹,LCr]/g, '').replace('Cr', '00').replace('L', '')) || 0, plotCount: seed[7], available: seed[8], acres: seed[9], approval: seed[10], featured: seed[11], description: seed[12], accent: seed[13], lat: seed[14], lng: seed[15],
}));
// Keep price display intentional and human-readable; the seed labels remain the source of truth.
const priceLabels: Record<string, string> = Object.fromEntries(projectSeeds.map((seed) => [seed[0], seed[6]]));
projects.forEach((project) => { project.priceFrom = Number(priceLabels[project.name].replace(/[₹,]/g, '').replace('Cr', '0000000').replace('L', '00000')) || 0; });

const sectors = [
  { name: 'Phase 1 - North Greens', latOff: 0, lngOff: 0, x3d: -160, z3d: -130 },
  { name: 'Phase 2 - West Garden', latOff: 0, lngOff: 0, x3d: -170, z3d: -30 },
  { name: 'Phase 3 - East Avenue', latOff: 0, lngOff: 0, x3d: 50, z3d: -120 },
  { name: 'Phase 4 - Central Court', latOff: 0, lngOff: 0, x3d: -30, z3d: 30 },
  { name: 'Phase 5 - South Reserve', latOff: 0, lngOff: 0, x3d: -140, z3d: 60 },
  { name: 'Phase 6 - Executive Crest', latOff: 0, lngOff: 0, x3d: 40, z3d: 60 },
];

function generatePlots(): Plot[] {
  const plots: Plot[] = [];
  const baseLat = 17.2470;
  const baseLng = 78.4485;
  const plotWidth = 0.00048;  // ~50m width
  const plotHeight = 0.00035; // ~38m height
  const gapLat = 0.00012;     // internal road gap between rows
  const gapLng = 0.00008;

  const statuses: PlotStatus[] = ['Available', 'On Hold', 'Registration Completed', 'Sold'];
  const facings = ['North', 'South', 'East', 'West'];
  const roads = ["30' Road", "33' Road", "40' Road", "Proposed 100' Wide Road"];
  const plotTypes: PlotType[] = ['Standard', 'Corner', 'Premium'];

  let plotNum = 1;

  // Create 6 sectors arranged in a 2x3 block grid (side-by-side plots like reference screenshot)
  const sectorLayouts = [
    { name: 'Phase 1 - North Greens', rowStart: 0, colStart: 0, rows: 4, cols: 5 },
    { name: 'Phase 2 - West Garden', rowStart: 0, colStart: 6, rows: 4, cols: 5 },
    { name: 'Phase 3 - East Avenue', rowStart: 0, colStart: 12, rows: 4, cols: 5 },
    { name: 'Phase 4 - Central Court', rowStart: 5, colStart: 0, rows: 4, cols: 5 },
    { name: 'Phase 5 - South Reserve', rowStart: 5, colStart: 6, rows: 4, cols: 5 },
    { name: 'Phase 6 - Executive Crest', rowStart: 5, colStart: 12, rows: 4, cols: 5 },
  ];

  sectorLayouts.forEach((sec) => {
    for (let r = 0; r < sec.rows; r++) {
      for (let c = 0; c < sec.cols; c++) {
        const absRow = sec.rowStart + r;
        const absCol = sec.colStart + c;

        const lat = baseLat + absRow * (plotHeight + gapLat);
        const lng = baseLng + absCol * (plotWidth + gapLng);

        // Side-by-side plot coordinates polygon
        const coords: [number, number][] = [
          [lat, lng],
          [lat + plotHeight, lng],
          [lat + plotHeight, lng + plotWidth],
          [lat, lng + plotWidth],
        ];

        const statusIdx = (plotNum * 7 + r * 3 + c) % statuses.length;
        const facingIdx = (r + c) % facings.length;
        const roadIdx = r % roads.length;
        const typeIdx = (c === 0 || c === sec.cols - 1) ? 1 : (r % 3 === 0) ? 2 : 0;
        const area = 1500 + ((r + c) % 4) * 200;
        const price = Math.round((area * 3200 + (typeIdx === 2 ? 500000 : 0)) / 10000) * 10000;

        plots.push({
          id: `plot-${plotNum}`,
          number: plotNum,
          sector: sec.name,
          status: statuses[statusIdx],
          facing: facings[facingIdx],
          road: roads[roadIdx],
          area,
          price,
          type: plotTypes[typeIdx],
          coordinates: coords,
          x3d: -180 + absCol * 22,
          z3d: -140 + absRow * 32,
          w3d: 18,
          d3d: 26,
        });

        plotNum++;
      }
    }
  });

  return plots;
}

function getAllPlots(): Plot[] {
  if (typeof window !== 'undefined' && localStorage.getItem('landgrid_clear_all') === 'true') {
    const saved = localStorage.getItem('landgrid_custom_plots');
    if (saved) {
      try {
        const customAdminPlots = JSON.parse(saved);
        return customAdminPlots.map((p: any) => ({
          id: p.id,
          number: p.number,
          sector: p.sector || 'Phase 1 - North Greens',
          status: p.status || 'Available',
          facing: p.facing || 'East',
          road: p.road || "33' Road",
          area: p.areaSqFt || 1650,
          price: p.price || 5200000,
          type: p.type || 'Standard',
          coordinates: p.coordinates,
          x3d: 0,
          z3d: 0,
          w3d: 20,
          d3d: 20
        }));
      } catch {
        return [];
      }
    }
    return [];
  }

  const generated = generatePlots();
  let result = generated;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('landgrid_custom_plots');
    if (saved) {
      try {
        const customAdminPlots = JSON.parse(saved);
        const mappedCustom: Plot[] = customAdminPlots.map((p: any) => ({
          id: p.id,
          number: p.number,
          sector: p.sector || 'Phase 1 - North Greens',
          status: p.status || 'Available',
          facing: p.facing || 'East',
          road: p.road || "33' Road",
          area: p.areaSqFt || 1650,
          price: p.price || 5200000,
          type: p.type || 'Standard',
          coordinates: p.coordinates,
          x3d: 0,
          z3d: 0,
          w3d: 20,
          d3d: 20
        }));
        result = [...mappedCustom, ...generated];
      } catch {
        result = generated;
      }
    }
    const deletedIds: string[] = JSON.parse(localStorage.getItem('landgrid_deleted_plot_ids') || '[]');
    result = result.filter((p) => !deletedIds.includes(p.id));
  }
  return result;
}

const allPlots = getAllPlots();
const formatPrice = (price: number) => `₹${(price / 10000000).toFixed(2)} Cr`;
const formatCompactPrice = (price: number) => `₹${(price / 100000).toFixed(1)}L`;
const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('');

function MapControls({ expanded, onToggleExpanded, mapCenter }: { expanded: boolean; onToggleExpanded: () => void; mapCenter: LatLngExpression }) {
  const map = useMap();
  const locate = () => navigator.geolocation?.getCurrentPosition(({ coords }) => map.setView([coords.latitude, coords.longitude], 17), () => map.setView(mapCenter, 17));
  return <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2"><div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm"><button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in" data-testid="button-map-zoom-in" className="flex h-9 w-9 items-center justify-center text-[#162943] hover:bg-slate-100"><Plus size={16} /></button><div className="mx-2 border-t border-slate-200" /><button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out" data-testid="button-map-zoom-out" className="flex h-9 w-9 items-center justify-center text-[#162943] hover:bg-slate-100"><Minus size={16} /></button></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm"><button type="button" onClick={locate} aria-label="Locate me" data-testid="button-map-locate" className="flex h-9 w-9 items-center justify-center text-[#162943] hover:bg-slate-100"><LocateFixed size={16} /></button><div className="mx-2 border-t border-slate-200" /><button type="button" onClick={() => map.setView(mapCenter, 17)} aria-label="Reset map" data-testid="button-map-reset" className="flex h-9 w-9 items-center justify-center text-[#162943] hover:bg-slate-100"><RotateCcw size={15} /></button><div className="mx-2 border-t border-slate-200" /><button type="button" onClick={onToggleExpanded} aria-label="Toggle fullscreen map" data-testid="button-map-fullscreen" className="flex h-9 w-9 items-center justify-center text-[#162943] hover:bg-slate-100">{expanded ? <Minimize2 size={15} /> : <Eye size={15} />}</button></div></div>;
}

function StatusBadge({ status }: { status: PlotStatus }) {
  const meta = statusMeta[status];
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em]" style={{ backgroundColor: `${meta.fill}40`, color: meta.ink }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.stroke }} />{meta.label}</span>;
}

function MapExplorer({ project, onSelect, selected, onClose, onBook, onEnquire }: { project: Project; onSelect: (plot: Plot) => void; selected: Plot | null; onClose: () => void; onBook: (plot: Plot) => void; onEnquire: (plot: Plot) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [phase, setPhase] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => allPlots.filter((plot) => 
    (!query || `p-${String(plot.number).padStart(3, '0')}`.includes(query.toLowerCase()) || String(plot.number) === query) &&
    (status === 'all' || plot.status === status) &&
    (type === 'all' || plot.type === type) &&
    (phase === 'all' || plot.sector === phase)
  ), [query, status, type, phase]);

  const available = allPlots.filter((plot) => plot.status === 'Available').length;

  return (
    <div className={`mx-auto max-w-[1400px] px-5 pb-20 sm:px-8 ${expanded ? 'fixed inset-0 z-[900] max-w-none bg-[#f3f6f8] pt-4' : ''}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#159b8b]">Interactive inventory · {project.name}</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-.05em] text-[#162943]">Choose your ground</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono font-bold text-[#162943]" data-testid="text-results-count">{filtered.length}</span> of {allPlots.length} plots shown
          <button type="button" onClick={() => setShowFilters(!showFilters)} data-testid="button-toggle-map-filters" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-[#162943] md:hidden">
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div className={`mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plot number, e.g. P-024" data-testid="input-map-search" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#159b8b] focus:ring-2 focus:ring-[#159b8b]/15" />
          </label>
          <FilterSelect label="Phase / Sector" value={phase} onChange={setPhase} options={[{ label: 'All phases', value: 'all' }, ...sectors.map((s) => ({ label: s.name, value: s.name }))]} testId="select-map-phase" />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ label: 'All statuses', value: 'all' }, ...statusOptions.map((item) => ({ label: item, value: item }))]} testId="select-map-status" />
          <FilterSelect label="Plot type" value={type} onChange={setType} options={['all', 'Standard', 'Corner', 'Premium'].map((item) => ({ label: item === 'all' ? 'All plot types' : item, value: item }))} testId="select-map-type" />
          <button type="button" onClick={() => { setQuery(''); setStatus('all'); setType('all'); setPhase('all'); }} data-testid="button-reset-map-filters" className="flex h-10 items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-bold text-[#159b8b] hover:bg-teal-50">
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {viewMode === '3d' ? (
        <Map3DView project={project} plots={filtered} selectedPlot={selected} onSelectPlot={onSelect} onView2D={() => setViewMode('2d')} />
      ) : (
        <div className={`grid overflow-hidden rounded-[22px] border border-slate-200 bg-[#dce7e7] shadow-[0_24px_60px_rgba(22,41,67,.13)] lg:grid-cols-[minmax(0,1fr)_320px] ${expanded ? 'h-[calc(100dvh-32px)]' : ''}`}>
          <div className={`map-shell relative min-h-[580px] ${expanded ? 'min-h-0' : 'h-[min(72vh,740px)]'}`}>
            <MapContainer center={center} zoom={17} scrollWheelZoom className="h-full min-h-[580px] w-full">
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className={satellite ? 'satellite-mock' : ''} />
              <MapControls expanded={expanded} onToggleExpanded={() => setExpanded(!expanded)} mapCenter={center} />
              
              {filtered.map((plot) => {
                const meta = statusMeta[plot.status];
                const active = selected?.id === plot.id;
                const geoJson = {
                  type: 'Feature' as const,
                  properties: { plotNumber: plot.number },
                  geometry: {
                    type: 'Polygon' as const,
                    coordinates: [[...plot.coordinates.map(([lat, lng]) => [lng, lat]), [plot.coordinates[0][1], plot.coordinates[0][0]]] as [number, number][]]
                  }
                };
                const events = {
                  mouseover: (event: LeafletMouseEvent) => event.target.setStyle({ fillOpacity: .95, weight: 3 }),
                  mouseout: (event: LeafletMouseEvent) => event.target.setStyle({ fillOpacity: active ? .95 : .72, weight: active ? 3 : 1.4 }),
                  click: () => onSelect(plot)
                };
                return (
                  <GeoJSON key={plot.id} data={geoJson} pathOptions={{ color: active ? navy : meta.stroke, fillColor: meta.fill, fillOpacity: active ? .95 : .72, weight: active ? 3 : 1.4, className: 'plot-polygon' }} eventHandlers={events}>
                    <Tooltip direction="top" offset={[0, -4]}>
                      <div className="min-w-[112px]">
                        <div className="font-mono text-[11px] font-bold">P-{String(plot.number).padStart(3, '0')}</div>
                        <div className="text-[10px] text-slate-500">{plot.sector}</div>
                        <div className="mt-1 text-[11px] font-normal">{plot.area.toLocaleString()} sq ft · {formatCompactPrice(plot.price)}</div>
                      </div>
                    </Tooltip>
                  </GeoJSON>
                );
              })}
            </MapContainer>

            {/* Status Legend */}
            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-sm">
              {statusOptions.map((item) => (
                <span key={item} className="flex items-center gap-1.5 px-1.5 text-[10px] font-semibold text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: statusMeta[item].fill, border: `1px solid ${statusMeta[item].stroke}` }} />
                  {statusMeta[item].label}
                </span>
              ))}
            </div>

            {/* 2D / 3D Mode Toggle Switcher Pill */}
            <div className="absolute bottom-4 right-4 z-[600] flex items-center rounded-full border border-slate-300 bg-slate-900/90 p-1 shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold transition ${(viewMode as string) === '2d' ? 'bg-teal-500 text-white shadow' : 'text-slate-300 hover:text-white'}`}
              >
                2D
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold transition ${(viewMode as string) === '3d' ? 'bg-teal-500 text-white shadow' : 'text-slate-300 hover:text-white'}`}
              >
                3D
              </button>
            </div>

            {/* Aerial Tint Toggle */}
            <button type="button" onClick={() => setSatellite(!satellite)} data-testid="button-map-layer-toggle" className="absolute bottom-4 right-32 z-[500] flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[10px] font-bold text-[#162943] shadow-lg hover:bg-slate-50">
              <Layers3 size={13} /> {satellite ? 'Map view' : 'Aerial tint'}
            </button>
          </div>

          <aside className="hidden overflow-hidden border-l border-slate-200 bg-white lg:flex lg:flex-col">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[.15em] text-slate-400">Available now</p>
                <span className="rounded-full bg-teal-50 px-2 py-1 font-mono text-[10px] font-bold text-[#0c665c]">{available} plots</span>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-slate-500">Select a plot on the plan to inspect dimensions, price and booking status.</p>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {filtered.length ? filtered.slice(0, 20).map((plot) => (
                <button key={plot.id} type="button" onClick={() => onSelect(plot)} data-testid={`card-map-plot-${plot.number}`} className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50">
                  <span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#162943]">P-{String(plot.number).padStart(3, '0')}</span>
                      {plot.type !== 'Standard' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">{plot.type}</span>}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">{plot.area.toLocaleString()} sq ft · {plot.facing}</span>
                    <span className="text-[10px] text-teal-600">{plot.sector}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-[11px] font-bold text-[#162943]">{formatCompactPrice(plot.price)}</span>
                    <StatusBadge status={plot.status} />
                  </span>
                </button>
              )) : <EmptyState onClear={() => { setQuery(''); setStatus('all'); setType('all'); setPhase('all'); }} />}
            </div>
          </aside>
        </div>
      )}

      {selected && <PlotSheet plot={selected} project={project} onClose={onClose} onBook={onBook} onEnquire={onEnquire} />}
    </div>
  );
}

function PlotSheet({ plot, project, onClose, onBook, onEnquire }: { plot: Plot; project: Project; onClose: () => void; onBook: (plot: Plot) => void; onEnquire: (plot: Plot) => void }) {
  return <div className="fixed inset-x-0 bottom-0 z-[1100] mx-auto max-w-[560px] rounded-t-3xl border border-slate-200 bg-white p-5 shadow-[0_-18px_50px_rgba(22,41,67,.2)] md:absolute md:bottom-6 md:left-6 md:right-auto md:inset-x-auto md:w-[360px] md:rounded-2xl md:p-6"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#159b8b]">Plot detail · {project.name}</p><h3 className="mt-1 font-serif text-3xl font-semibold tracking-[-.05em] text-[#162943]">P-{String(plot.number).padStart(3, '0')}</h3></div><button type="button" onClick={onClose} aria-label="Close plot details" data-testid="button-close-plot-sheet" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button></div><div className="mt-4 flex items-center justify-between"><StatusBadge status={plot.status} /><span className="font-mono text-sm font-bold text-[#162943]">{formatPrice(plot.price)}</span></div><div className="mt-5 grid grid-cols-2 gap-2 text-xs"><Detail label="Area" value={`${plot.area.toLocaleString()} sq ft`} /><Detail label="Facing" value={plot.facing} /><Detail label="Road width" value={plot.road} /><Detail label="Plot type" value={plot.type} /></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => onEnquire(plot)} data-testid="button-enquire-plot" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold text-[#162943] hover:bg-slate-50"><MessageSquare size={14} /> Enquire</button><button type="button" disabled={plot.status !== 'Available'} onClick={() => onBook(plot)} data-testid="button-book-plot" className="flex items-center justify-center gap-2 rounded-xl bg-[#159b8b] px-3 py-3 text-xs font-bold text-white hover:bg-[#0d8175] disabled:cursor-not-allowed disabled:opacity-40">Start booking <ArrowRight size={14} /></button></div></div>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold text-[#162943]">{value}</p></div>; }
function EmptyState({ onClear }: { onClear: () => void }) { return <div className="p-8 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Search size={16} /></div><p className="mt-3 text-sm font-bold text-[#162943]">No plots match those filters</p><button type="button" onClick={onClear} data-testid="button-empty-reset" className="mt-3 text-xs font-bold text-[#159b8b]">Clear filters</button></div>; }
function FilterSelect({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[]; testId: string }) { return <label className="relative block"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} data-testid={testId} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-7 text-xs font-medium text-[#162943] outline-none focus:border-[#159b8b]"><option value="" disabled>{label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-400" /></label>; }


function Header({ favorites, onList }: { favorites: string[]; onList: () => void }) {
  const [menu, setMenu] = useState(false); const [location, setLocation] = useLocation();
  const links = [['Explore', '/projects'], ['Projects', '/projects'], ['Plots', '/plots'], ['Developers', '/developers'], ['Locations', '/locations'], ['How it works', '/how-it-works']];
  return <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-[#f3f6f8]/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8"><Link href="/" data-testid="link-brand-home" className="group flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#162943] text-[#8ce0d4] shadow-sm transition group-hover:-rotate-3"><Landmark size={19} strokeWidth={1.8} /></span><span><span className="block font-serif text-[18px] font-semibold leading-none tracking-[-.04em] text-[#162943]">LandGrid</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[.2em] text-slate-400">Discover. Explore. Own.</span></span></Link><nav className="hidden items-center gap-5 text-[12px] font-semibold text-slate-500 lg:flex">{links.map(([label, href]) => <Link key={label} href={href} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} className={`transition hover:text-[#159b8b] ${location === href ? 'text-[#159b8b]' : ''}`}>{label}</Link>)}</nav><div className="hidden items-center gap-2 md:flex"><Link href="/admin" data-testid="link-header-admin" className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100"><ShieldCheck size={14} className="text-amber-700" /> Admin Portal</Link><Link href="/projects" data-testid="link-header-search" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-[#159b8b]"><Search size={17} /></Link><Link href="/favorites" data-testid="link-header-favorites" className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-[#159b8b]"><Heart size={17} />{favorites.length > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#159b8b] px-1 font-mono text-[8px] text-white">{favorites.length}</span>}</Link><Link href="/account" data-testid="link-header-login" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-[#162943] hover:border-[#159b8b]"><LogIn size={14} /> Login</Link><button type="button" onClick={onList} data-testid="button-list-property" className="rounded-full bg-[#162943] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm hover:bg-[#243d60]">List Your Property</button></div><button type="button" onClick={() => setMenu(!menu)} aria-label="Open navigation menu" data-testid="button-mobile-menu" className="rounded-full p-2 text-[#162943] md:hidden"><Menu size={21} /></button></div>{menu && <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden"><div className="grid gap-1">{links.slice(0, 5).map(([label, href]) => <Link key={label} href={href} onClick={() => setMenu(false)} data-testid={`link-mobile-${label.toLowerCase()}`} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#162943] hover:bg-slate-50">{label}</Link>)}<Link href="/admin" onClick={() => setMenu(false)} className="rounded-xl bg-amber-50 px-3 py-3 text-sm font-bold text-amber-900">Admin Portal ⚙️</Link></div><div className="mt-3 grid grid-cols-2 gap-2"><Link href="/favorites" onClick={() => setMenu(false)} data-testid="link-mobile-saved" className="rounded-xl border border-slate-200 px-3 py-3 text-center text-xs font-bold text-[#162943]">Saved {favorites.length ? `(${favorites.length})` : ''}</Link><button type="button" onClick={onList} data-testid="button-mobile-list-property" className="rounded-xl bg-[#159b8b] px-3 py-3 text-xs font-bold text-white">List property</button></div></div>}</header>;
}

function MobileNav() { const [location] = useLocation(); const items = [['/', 'Home', Home], ['/projects', 'Explore', Compass], ['/favorites', 'Saved', Heart], ['/enquiries', 'Enquiries', MessageSquare], ['/account', 'Account', UserRound] ] as const; return <nav className="fixed inset-x-0 bottom-0 z-[1000] grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">{items.map(([href, label, Icon]) => <Link key={href} href={href} data-testid={`link-mobile-bottom-${label.toLowerCase()}`} className={`flex flex-col items-center gap-1 py-1 text-[9px] font-bold ${location === href ? 'text-[#159b8b]' : 'text-slate-400'}`}><Icon size={18} strokeWidth={location === href ? 2.4 : 1.8} /><span>{label}</span></Link>)}</nav>; }

const projectImages: Record<string, string> = {
  'Aanvi Heights': '/images/aanvi_heights.jpg',
  'Meridian Grove': '/images/meridian_grove.jpg',
  'The Foundry District': '/images/foundry_district.jpg',
};

function ProjectCard({ project, saved, onFavorite, onCompare }: { project: Project; saved: boolean; onFavorite: () => void; onCompare: () => void }) {
  const image = projectImages[project.name] || '/images/aanvi_heights.jpg';

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,41,67,.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(22,41,67,.11)]">
      <Link href={`/projects/${project.slug}`} data-testid={`card-project-${project.id}`} className="block">
        <div className="relative h-44 overflow-hidden bg-[#162943]">
          <img src={image} alt={project.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#162943]/80 via-transparent to-black/30" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 font-mono text-[10px] font-bold backdrop-blur-md">
              {project.developer.initials}
            </span>
            <span className="text-[11px] font-bold">{project.developer.name}</span>
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[.08em] text-[#162943] backdrop-blur-sm shadow-sm">
            {project.status}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-[22px] font-semibold tracking-[-.04em] text-[#162943]">{project.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={13} className="text-[#159b8b]" />
                {project.area}, {project.city}
              </p>
            </div>
            <span className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-[9px] font-bold text-slate-500">{project.type}</span>
          </div>
          <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-500">{project.description}</p>
          <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.12em] text-slate-400">Plots from</p>
              <p className="mt-1 font-mono text-sm font-bold text-[#162943]">{priceLabels[project.name]}</p>
            </div>
            <span className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-[.12em] text-slate-400">Available</p>
              <p className="mt-1 font-mono text-sm font-bold text-[#159b8b]">{project.available} / {project.plotCount}</p>
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute right-4 top-[156px] flex gap-2 z-10">
        <button type="button" onClick={onFavorite} aria-label={saved ? 'Remove project from favorites' : 'Save project'} data-testid={`button-favorite-${project.id}`} className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm ${saved ? 'border-[#159b8b] text-[#159b8b]' : 'border-slate-200 text-slate-500'} hover:border-[#159b8b]`}>
          {saved ? <Heart size={15} fill="currentColor" /> : <Heart size={15} />}
        </button>
        <button type="button" onClick={onCompare} data-testid={`button-compare-${project.id}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-[#159b8b] hover:text-[#159b8b]">
          <Layers3 size={15} />
        </button>
      </div>
    </article>
  );
}

function DeveloperCard({ developer, saved, onFavorite }: { developer: Developer; saved: boolean; onFavorite: () => void }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-start justify-between"><Link href={`/developers/${developer.slug}`} data-testid={`card-developer-${developer.id}`} className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl font-mono text-xs font-bold text-white" style={{ backgroundColor: developer.tone }}>{developer.initials}</span><span><span className="block text-sm font-bold text-[#162943]">{developer.name}</span><span className="mt-1 block text-[10px] text-slate-400">Since {developer.founded} · {developer.projects} projects</span></span></Link><button type="button" onClick={onFavorite} aria-label={saved ? 'Unsave developer' : 'Save developer'} data-testid={`button-favorite-developer-${developer.id}`} className={`rounded-full p-1.5 ${saved ? 'text-[#159b8b]' : 'text-slate-300'} hover:text-[#159b8b]`}>{saved ? <Heart size={16} fill="currentColor" /> : <Heart size={16} />}</button></div><p className="mt-4 text-xs leading-5 text-slate-500">{developer.description}</p><Link href={`/developers/${developer.slug}`} data-testid={`link-developer-${developer.id}`} className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-[#159b8b]">View developer <ArrowRight size={13} /></Link></article>;
}

function HomePage({ onFavorite, favorites, onCompare }: { onFavorite: (id: string) => void; favorites: string[]; onCompare: (id: string) => void }) {
  const [, setLocation] = useLocation(); const [search, setSearch] = useState(''); const featured = projects.filter((project) => project.featured);
  return <><main><section className="relative overflow-hidden bg-[#162943] text-white"><div className="absolute right-[-8%] top-[-35%] h-[680px] w-[680px] rounded-full border border-white/10" /><div className="absolute right-[6%] top-[-10%] h-[480px] w-[480px] rounded-full border border-[#159b8b]/35" /><div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_.95fr]"><div className="relative z-10 animate-rise"><p className="mb-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#8ce0d4]"><span className="h-px w-8 bg-[#8ce0d4]" />Land, with a wider view</p><h1 className="max-w-[720px] font-serif text-[clamp(3.5rem,7vw,7.6rem)] font-semibold leading-[.88] tracking-[-.07em]">Find the right land.<br /><span className="text-[#6bd4c8]">Choose the right plot.</span></h1><p className="mt-7 max-w-[460px] text-[15px] leading-7 text-slate-300">Discover plotted developments from developers you can verify, in places you can picture yourself growing into.</p><div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-hero-search" className="flex items-center gap-2 rounded-full bg-[#159b8b] px-5 py-3 text-xs font-bold text-white hover:bg-[#21aa9a]">Start exploring <ArrowDown size={14} /></button><Link href="/how-it-works" data-testid="link-hero-how-it-works" className="flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-xs font-bold text-white hover:border-[#8ce0d4] hover:text-[#8ce0d4]">How LandGrid works <ArrowRight size={14} /></Link></div></div><div className="relative min-h-[340px] animate-rise animation-delay-2"><div className="absolute inset-6 rotate-[-4deg] rounded-[28px] border border-white/10 bg-[#203957] p-5 shadow-2xl"><div className="h-full rounded-[19px] border border-white/10 p-5" style={{ backgroundImage: 'linear-gradient(90deg, rgba(140,224,212,.11) 1px, transparent 1px), linear-gradient(rgba(140,224,212,.11) 1px, transparent 1px)', backgroundSize: '48px 48px' }}><div className="flex justify-between text-[10px] font-mono uppercase tracking-[.16em] text-[#8ce0d4]"><span>Verified inventory</span><span>15 live projects</span></div><div className="relative mt-8 h-48"><div className="absolute left-[12%] top-[26%] h-16 w-24 rotate-12 rounded-xl border border-[#6bd4c8]/60 bg-[#159b8b]/30" /><div className="absolute right-[16%] top-[44%] h-20 w-32 -rotate-6 rounded-xl border border-[#f0ca72]/70 bg-[#f0ca72]/20" /><div className="absolute left-[35%] top-[58%] h-14 w-20 rotate-[-18deg] rounded-xl border border-[#8fb3db]/60 bg-[#8fb3db]/20" /><span className="absolute left-[18%] top-[18%] h-3 w-3 rounded-full bg-[#6bd4c8] shadow-[0_0_0_6px_rgba(107,212,200,.15)]" /><span className="absolute right-[23%] top-[36%] h-3 w-3 rounded-full bg-[#f0ca72]" /></div><div className="flex items-end justify-between border-t border-white/10 pt-4"><span><span className="block font-mono text-2xl font-bold">1,700+</span><span className="text-[10px] text-slate-400">plots across the grid</span></span><span className="rounded-full border border-[#6bd4c8]/40 px-3 py-1.5 text-[10px] font-bold text-[#8ce0d4]">Live map data</span></div></div></div></div></div></section><section id="home-search" className="relative z-20 mx-auto -mt-8 max-w-[1180px] px-5 sm:px-8"><div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_44px_rgba(22,41,67,.12)]"><div className="flex flex-col gap-2 md:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-4 top-3.5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setLocation(`/projects?search=${search}`); }} placeholder="Search by city, developer or project" data-testid="input-home-search" className="h-12 w-full rounded-xl bg-slate-50 pl-11 pr-4 text-sm text-[#162943] outline-none placeholder:text-slate-400 focus:bg-teal-50/40" /></label><select data-testid="select-home-property-type" className="h-12 rounded-xl border-0 bg-slate-50 px-4 text-xs font-semibold text-[#162943] outline-none md:w-44"><option>All property types</option><option>Plots</option><option>Villa plots</option><option>Premium plots</option></select><button type="button" onClick={() => setLocation('/projects')} data-testid="button-home-search" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#159b8b] px-6 text-xs font-bold text-white hover:bg-[#0d8175]">Search land <Search size={14} /></button></div><div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3"><span className="mr-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-slate-400"><Filter size={12} /> Quick filters</span>{['Hyderabad', 'Bengaluru', 'Under ₹50L', 'Ready to build', 'RERA approved'].map((filter) => <button key={filter} type="button" onClick={() => setLocation('/projects')} data-testid={`button-quick-filter-${filter.toLowerCase().replaceAll(' ', '-')}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-[#159b8b] hover:text-[#159b8b]">{filter}</button>)}</div></div></section><section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#159b8b]">A considered shortlist</p><h2 className="mt-3 font-serif text-5xl font-semibold leading-none tracking-[-.06em] text-[#162943]">Projects worth<br />a closer look.</h2></div><Link href="/projects" data-testid="link-home-all-projects" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#162943] hover:border-[#159b8b] hover:text-[#159b8b]">See all projects <ArrowRight size={14} /></Link></div><div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{featured.map((project) => <ProjectCard key={project.id} project={project} saved={favorites.includes(project.id)} onFavorite={() => onFavorite(project.id)} onCompare={() => onCompare(project.id)} />)}</div></section><section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-24"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#159b8b]">Developers you can place</p><h2 className="mt-3 max-w-[420px] font-serif text-5xl font-semibold leading-[.95] tracking-[-.06em] text-[#162943]">Good land starts with good context.</h2><p className="mt-5 max-w-[380px] text-sm leading-7 text-slate-500">Every project keeps its developer in view. Compare track record, approvals and the kind of neighbourhood they tend to make.</p><Link href="/developers" data-testid="link-home-developers" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#159b8b]">Browse all developers <ArrowRight size={14} /></Link></div><div className="grid gap-3 sm:grid-cols-2">{developers.slice(0, 4).map((developer) => <DeveloperCard key={developer.id} developer={developer} saved={favorites.includes(developer.id)} onFavorite={() => onFavorite(developer.id)} />)}</div></div></section><section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#159b8b]">Explore by place</p><h2 className="mt-3 font-serif text-5xl font-semibold leading-none tracking-[-.06em] text-[#162943]">The next right<br />address is local.</h2></div><Link href="/locations" data-testid="link-home-locations" className="flex items-center gap-2 text-xs font-bold text-[#159b8b]">All locations <ArrowRight size={14} /></Link></div><div className="mt-9 grid gap-3 md:grid-cols-3">
  <LocationTile city="Hyderabad" count="8 projects" places="Shamshabad · Tellapur · Maheshwaram" image="/images/aanvi_heights.jpg" />
  <LocationTile city="Bengaluru" count="7 projects" places="Devanahalli · Sarjapur · Hoskote" image="/images/meridian_grove.jpg" />
  <LocationTile city="Mysuru" count="4 projects" places="Mysuru Road · North corridor" image="/images/foundry_district.jpg" />
</div></section></main></>;
}
function LocationTile({ city, count, places, image }: { city: string; count: string; places: string; image: string }) { 
  return (
    <Link href="/locations" data-testid={`card-location-${city.toLowerCase()}`} className="group relative min-h-[220px] overflow-hidden rounded-[22px] p-6 text-white bg-slate-900 shadow-md">
      <img src={image} alt={city} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#162943]/90 via-[#162943]/30 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-white/80"><MapPin size={13} /> {count}</span>
        <div>
          <h3 className="font-serif text-4xl font-semibold tracking-[-.05em]">{city}</h3>
          <p className="mt-2 text-xs text-white/80">{places}</p>
        </div>
      </div>
    </Link>
  );
}

function ProjectsPage({ favorites, onFavorite, onCompare }: { favorites: string[]; onFavorite: (id: string) => void; onCompare: (id: string) => void }) {
  const [search, setSearch] = useState(''); const [city, setCity] = useState('all'); const [developer, setDeveloper] = useState('all'); const [type, setType] = useState('all'); const [status, setStatus] = useState('all'); const [approval, setApproval] = useState('all'); const [more, setMore] = useState(false);
  const filtered = useMemo(() => projects.filter((project) => (!search || `${project.name} ${project.city} ${project.developer.name}`.toLowerCase().includes(search.toLowerCase())) && (city === 'all' || project.city === city) && (developer === 'all' || project.developer.id === developer) && (type === 'all' || project.type === type) && (status === 'all' || project.status === status) && (approval === 'all' || project.approval === approval)), [search, city, developer, type, status, approval]);
  return <PageFrame eyebrow="Marketplace inventory" title="Projects built for the long view." description="Compare plotted developments across Hyderabad, Bengaluru and beyond. Each listing keeps the developer, approvals and real inventory in view." action={<Link href="/developers" data-testid="link-projects-developers" className="flex items-center gap-2 text-xs font-bold text-[#159b8b]">Browse developers <ArrowRight size={14} /></Link>}><div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="grid gap-2 md:grid-cols-[1.7fr_1fr_1fr_1fr]"><label className="relative"><Search size={15} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects, cities or developers" data-testid="input-project-search" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#159b8b]" /></label><FilterSelect label="Location" value={city} onChange={setCity} options={[{ label: 'All locations', value: 'all' }, ...Array.from(new Set(projects.map((project) => project.city))).map((item) => ({ label: item, value: item }))]} testId="select-project-city" /><FilterSelect label="Developer" value={developer} onChange={setDeveloper} options={[{ label: 'All developers', value: 'all' }, ...developers.map((item) => ({ label: item.name, value: item.id }))]} testId="select-project-developer" /><button type="button" onClick={() => setMore(!more)} data-testid="button-more-project-filters" className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-bold text-[#162943]"><SlidersHorizontal size={14} /> More filters</button></div>{more && <div className="mt-2 grid gap-2 border-t border-slate-100 pt-2 md:grid-cols-3"><FilterSelect label="Property type" value={type} onChange={setType} options={[{ label: 'All property types', value: 'all' }, ...Array.from(new Set(projects.map((project) => project.type))).map((item) => ({ label: item, value: item }))]} testId="select-project-type" /><FilterSelect label="Project status" value={status} onChange={setStatus} options={[{ label: 'All statuses', value: 'all' }, ...Array.from(new Set(projects.map((project) => project.status))).map((item) => ({ label: item, value: item }))]} testId="select-project-status" /><FilterSelect label="Approval" value={approval} onChange={setApproval} options={[{ label: 'All approvals', value: 'all' }, ...Array.from(new Set(projects.map((project) => project.approval))).map((item) => ({ label: item, value: item }))]} testId="select-project-approval" /></div>}</div><div className="mt-8 flex items-center justify-between"><p className="text-xs text-slate-500"><span className="font-mono font-bold text-[#162943]" data-testid="text-project-results">{filtered.length}</span> projects match your view</p><button type="button" onClick={() => { setSearch(''); setCity('all'); setDeveloper('all'); setType('all'); setStatus('all'); setApproval('all'); }} data-testid="button-reset-project-filters" className="flex items-center gap-1 text-xs font-bold text-[#159b8b]"><RotateCcw size={13} /> Reset</button></div><div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} saved={favorites.includes(project.id)} onFavorite={() => onFavorite(project.id)} onCompare={() => onCompare(project.id)} />)}</div>{!filtered.length && <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center"><Compass className="mx-auto text-slate-300" size={32} /><h3 className="mt-4 font-serif text-2xl font-semibold text-[#162943]">Try a wider search</h3><p className="mt-2 text-sm text-slate-500">There are no projects in this exact slice of the grid.</p></div>}</PageFrame>;
}

function PageFrame({ eyebrow, title, description, action, children, dark = false }: { eyebrow: string; title: string; description: string; action?: ReactNode; children: ReactNode; dark?: boolean }) { return <main className={`min-h-[calc(100dvh-72px)] ${dark ? 'bg-[#162943] text-white' : ''}`}><div className="mx-auto max-w-[1400px] px-5 pb-28 pt-14 sm:px-8 sm:pt-20"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className={`font-mono text-[10px] uppercase tracking-[.18em] ${dark ? 'text-[#8ce0d4]' : 'text-[#159b8b]'}`}>{eyebrow}</p><h1 className={`mt-3 max-w-[760px] font-serif text-[clamp(2.8rem,5vw,5.5rem)] font-semibold leading-[.9] tracking-[-.07em] ${dark ? 'text-white' : 'text-[#162943]'}`}>{title}</h1><p className={`mt-5 max-w-[570px] text-sm leading-7 ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{description}</p></div>{action}</div>{children}</div></main>; }

function ProjectPage({ favorites, onFavorite, selectedPlot, setSelectedPlot, setBooking, setEnquiry }: { favorites: string[]; onFavorite: (id: string) => void; selectedPlot: Plot | null; setSelectedPlot: (plot: Plot | null) => void; setBooking: (plot: Plot | null) => void; setEnquiry: (plot: Plot | null) => void }) {
  const { slug } = useParams<{ slug: string }>(); const project = projects.find((item) => item.slug === slug);
  if (!project) return <NotFound />;
  const developer = project.developer;
  return <main><section className="bg-[#162943] text-white"><div className="mx-auto max-w-[1400px] px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16"><div className="flex items-center gap-2 text-xs text-slate-300"><Link href="/projects" data-testid="link-project-breadcrumbs" className="hover:text-[#8ce0d4]">Projects</Link><span>/</span><span>{project.name}</span></div><div className="mt-10 grid items-end gap-9 lg:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl font-mono text-xs font-bold text-white" style={{ backgroundColor: project.accent }}>{developer.initials}</span><span className="text-sm font-semibold text-[#8ce0d4]">{developer.name}</span><span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-slate-300">{project.approval}</span></div><h1 className="mt-6 font-serif text-[clamp(3rem,7vw,7rem)] font-semibold leading-[.87] tracking-[-.075em]">{project.name}</h1><p className="mt-5 flex items-center gap-2 text-sm text-slate-300"><MapPin size={15} className="text-[#8ce0d4]" />{project.area}, {project.city} · {project.type}</p></div><div className="flex gap-2"><button type="button" onClick={() => onFavorite(project.id)} data-testid="button-project-favorite" className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${favorites.includes(project.id) ? 'border-[#8ce0d4] bg-[#159b8b] text-white' : 'border-white/25 text-white hover:border-[#8ce0d4]'}`}><Heart size={15} fill={favorites.includes(project.id) ? 'currentColor' : 'none'} />{favorites.includes(project.id) ? 'Saved' : 'Save project'}</button><Link href={`/enquiries?project=${project.slug}`} data-testid="link-project-enquire" className="flex items-center gap-2 rounded-full bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#20ab9c]">Enquire <MessageSquare size={14} /></Link></div></div><div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4"><ProjectStat label="Plots" value={String(project.plotCount)} /><ProjectStat label="Available" value={String(project.available)} /><ProjectStat label="Plots from" value={priceLabels[project.name]} /><ProjectStat label="Possession" value={project.possession} /></div></div></section><section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20"><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#159b8b]">About the project</p><h2 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-.05em] text-[#162943]">The details that<br />make a difference.</h2><p className="mt-5 text-sm leading-7 text-slate-500">{project.description}</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><InfoRow icon={<ShieldCheck size={16} />} label="Approval status" value={project.approval} /><InfoRow icon={<CalendarDays size={16} />} label="Possession" value={project.possession} /><InfoRow icon={<Trees size={16} />} label="Land parcel" value={`${project.acres} acres`} /></div></div><div className="rounded-[22px] bg-slate-50 p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#159b8b]">Developer context</p><h3 className="mt-2 font-serif text-3xl font-semibold tracking-[-.05em] text-[#162943]">{developer.name}</h3></div><Link href={`/developers/${developer.slug}`} data-testid="link-project-developer" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#159b8b] shadow-sm hover:bg-[#159b8b] hover:text-white"><ArrowRight size={16} /></Link></div><p className="mt-4 max-w-[520px] text-sm leading-6 text-slate-500">{developer.description}</p><div className="mt-6 flex flex-wrap gap-3"><span className="rounded-full bg-white px-3 py-2 text-[10px] font-bold text-slate-600"><BadgeCheck size={12} className="mr-1 inline text-[#159b8b]" /> Verified profile</span><span className="rounded-full bg-white px-3 py-2 text-[10px] font-bold text-slate-600">{developer.projects} active projects</span></div></div></div></section>{project.id === 'project-1' ? <section className="border-t border-slate-200 bg-[#f3f6f8] pt-14 sm:pt-20"><MapExplorer project={project} selected={selectedPlot} onSelect={setSelectedPlot} onClose={() => setSelectedPlot(null)} onBook={setBooking} onEnquire={setEnquiry} /></section> : <section className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8"><div className="rounded-[24px] bg-[#162943] p-7 text-white sm:p-10"><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#8ce0d4]">Inventory preview</p><h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-.05em]">A live conversation, not a static brochure.</h2><p className="mt-4 max-w-[580px] text-sm leading-6 text-slate-300">This project has {project.available} plots available from {priceLabels[project.name]}. Ask the developer for the current plan, plot dimensions and documentation.</p></div><Link href={`/enquiries?project=${project.slug}`} data-testid="link-project-preview-enquire" className="flex items-center justify-center gap-2 rounded-full bg-[#159b8b] px-5 py-3 text-xs font-bold text-white">Request inventory <ArrowRight size={14} /></Link></div></div></section>}</main>;
}
function ProjectStat({ label, value }: { label: string; value: string }) { return <div className="bg-[#203957] p-4 sm:p-5"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-slate-400">{label}</p><p className="mt-2 font-mono text-sm font-bold text-white">{value}</p></div>; }
function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="text-[#159b8b]">{icon}</span><span><span className="block text-[10px] text-slate-400">{label}</span><span className="mt-0.5 block text-xs font-bold text-[#162943]">{value}</span></span></div>; }

function PlotsPage({ compared, onCompare }: { compared: string[]; onCompare: (id: string) => void }) {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('all'); const [facing, setFacing] = useState('all'); const [area, setArea] = useState('all'); const [road, setRoad] = useState('all');
  const filtered = useMemo(() => allPlots.filter((plot) => (!query || String(plot.number).includes(query)) && (status === 'all' || plot.status === status) && (facing === 'all' || plot.facing === facing) && (area === 'all' || (area === 'small' ? plot.area <= 1500 : area === 'large' ? plot.area > 2000 : true)) && (road === 'all' || plot.road === road)), [query, status, facing, area, road]);
  return <PageFrame eyebrow="Plot inventory" title="See the parcel, not just the promise." description="Search Aanvi Heights’ live plotted plan by status, facing, area and road width. More project maps are joining the grid soon." action={<Link href="/projects/aanvi-heights" data-testid="link-plots-map" className="flex items-center gap-2 rounded-full bg-[#162943] px-4 py-2.5 text-xs font-bold text-white">Open interactive map <MapIcon size={14} /></Link>}><div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]"><label className="relative"><Search size={15} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plot number" data-testid="input-plots-search" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#159b8b]" /></label><FilterSelect label="Status" value={status} onChange={setStatus} options={[{ label: 'All statuses', value: 'all' }, ...statusOptions.map((item) => ({ label: item, value: item }))]} testId="select-plots-status" /><FilterSelect label="Facing" value={facing} onChange={setFacing} options={[{ label: 'Any facing', value: 'all' }, ...facingOptions.map((item) => ({ label: item, value: item }))]} testId="select-plots-facing" /><FilterSelect label="Plot area" value={area} onChange={setArea} options={[{ label: 'Any area', value: 'all' }, { label: 'Up to 1,500 sq ft', value: 'small' }, { label: '2,000+ sq ft', value: 'large' }]} testId="select-plots-area" /><FilterSelect label="Road width" value={road} onChange={setRoad} options={[{ label: 'Any road width', value: 'all' }, ...roadOptions.map((item) => ({ label: item, value: item }))]} testId="select-plots-road" /></div></div><div className="mt-8 flex items-center justify-between"><p className="text-xs text-slate-500"><span className="font-mono font-bold text-[#162943]">{filtered.length}</span> plots shown from Aanvi Heights</p><button type="button" onClick={() => { setQuery(''); setStatus('all'); setFacing('all'); setArea('all'); setRoad('all'); }} data-testid="button-reset-plots" className="text-xs font-bold text-[#159b8b]">Reset filters</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.slice(0, 48).map((plot) => <PlotListCard key={plot.id} plot={plot} compared={compared.includes(plot.id)} onCompare={() => onCompare(plot.id)} />)}</div></PageFrame>;
}
function PlotListCard({ plot, compared, onCompare }: { plot: Plot; compared: boolean; onCompare: () => void }) { return <article className={`rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md ${compared ? 'border-[#159b8b] ring-2 ring-[#159b8b]/10' : 'border-slate-200'}`}><div className="flex items-start justify-between"><div><p className="font-mono text-sm font-bold text-[#162943]">P-{String(plot.number).padStart(3, '0')}</p><p className="mt-1 text-[11px] text-slate-500">{plot.area.toLocaleString()} sq ft · {plot.facing}</p></div><StatusBadge status={plot.status} /></div><div className="mt-5 flex items-end justify-between"><div><p className="font-mono text-[9px] uppercase text-slate-400">Indicative price</p><p className="mt-1 font-mono text-sm font-bold text-[#162943]">{formatCompactPrice(plot.price)}</p></div><div className="text-right"><p className="font-mono text-[9px] uppercase text-slate-400">Road</p><p className="mt-1 text-xs font-semibold text-slate-600">{plot.road}</p></div></div><div className="mt-4 flex gap-2"><Link href={`/plots/${plot.id}`} data-testid={`link-plot-${plot.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[10px] font-bold text-[#162943] hover:border-[#159b8b]">View plot <ArrowRight size={12} /></Link><button type="button" onClick={onCompare} data-testid={`button-compare-plot-${plot.id}`} className={`rounded-lg px-2.5 text-[10px] font-bold ${compared ? 'bg-teal-50 text-[#159b8b]' : 'bg-slate-50 text-slate-500'}`}><Layers3 size={14} /></button></div></article>; }

function PlotDetailPage({ onFavorite, favorites, onBooking, onEnquiry }: { onFavorite: (id: string) => void; favorites: string[]; onBooking: (plot: Plot) => void; onEnquiry: (plot: Plot) => void }) {
  const { id } = useParams<{ id: string }>(); const plot = allPlots.find((item) => item.id === id) ?? allPlots[0]; const project = projects[0]; const saved = favorites.includes(plot.id);
  return <main className="mx-auto max-w-[1200px] px-5 pb-28 pt-12 sm:px-8 sm:pt-20"><Link href="/plots" data-testid="link-plot-detail-back" className="flex items-center gap-2 text-xs font-bold text-[#159b8b]"><ArrowRight size={13} className="rotate-180" /> Back to plots</Link><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"><div className="rounded-[24px] bg-[#162943] p-7 text-white sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#8ce0d4]">Plot detail · {project.name}</p><div className="mt-8 flex flex-wrap items-center justify-between gap-3"><h1 className="font-serif text-6xl font-semibold tracking-[-.07em]">P-{String(plot.number).padStart(3, '0')}</h1><button type="button" onClick={() => onFavorite(plot.id)} data-testid="button-plot-favorite" className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${saved ? 'border-[#8ce0d4] text-[#8ce0d4]' : 'border-white/20 text-white'}`}><Heart size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save plot'}</button></div><p className="mt-4 max-w-[520px] text-sm leading-6 text-slate-300">A live parcel inside {project.name}, listed by {project.developer.name}. Inspect the exact plot on the master plan before you decide.</p><div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4"><DarkDetail label="Area" value={`${plot.area.toLocaleString()} sq ft`} /><DarkDetail label="Facing" value={plot.facing} /><DarkDetail label="Road" value={plot.road} /><DarkDetail label="Type" value={plot.type} /></div></div><div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">Indicative price</span><StatusBadge status={plot.status} /></div><p className="mt-3 font-mono text-3xl font-bold text-[#162943]">{formatPrice(plot.price)}</p><p className="mt-2 text-xs leading-5 text-slate-500">Prices are shared as guidance and confirmed by the developer before booking.</p><div className="mt-6 grid gap-2"><button type="button" onClick={() => onEnquiry(plot)} data-testid="button-plot-detail-enquire" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold text-[#162943] hover:bg-slate-50"><MessageSquare size={14} /> Enquire about this plot</button><button type="button" disabled={plot.status !== 'Available'} onClick={() => onBooking(plot)} data-testid="button-plot-detail-book" className="flex items-center justify-center gap-2 rounded-xl bg-[#159b8b] py-3 text-xs font-bold text-white disabled:opacity-40">Start booking <ArrowRight size={14} /></button></div><Link href={`/projects/${project.slug}`} data-testid="link-plot-project" className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-xs font-bold text-[#159b8b]">Open full project map <MapIcon size={14} /></Link></div></div></main>;
}
function DarkDetail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#203957] p-3"><p className="font-mono text-[9px] uppercase text-slate-400">{label}</p><p className="mt-2 text-xs font-bold text-white">{value}</p></div>; }

function DevelopersPage({ favorites, onFavorite }: { favorites: string[]; onFavorite: (id: string) => void }) { return <PageFrame eyebrow="The people behind the parcels" title="Meet the makers of the grid." description="LandGrid keeps each developer visible, so a project never has to stand on a name you cannot investigate."><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{developers.map((developer) => <DeveloperCard key={developer.id} developer={developer} saved={favorites.includes(developer.id)} onFavorite={() => onFavorite(developer.id)} />)}</div><div className="mt-12 rounded-[24px] bg-[#162943] p-7 text-white sm:p-10"><div className="grid items-center gap-8 md:grid-cols-[1fr_auto]"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#8ce0d4]">For property teams</p><h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-.05em]">Bring your next project to the grid.</h2><p className="mt-3 max-w-[560px] text-sm leading-6 text-slate-300">Share your inventory, approvals and point of view with buyers who are actively looking.</p></div><Link href="/enquiries" data-testid="link-developer-contact" className="flex items-center justify-center gap-2 rounded-full bg-[#159b8b] px-5 py-3 text-xs font-bold text-white">Talk to LandGrid <ArrowRight size={14} /></Link></div></div></PageFrame>; }

function DeveloperPage({ favorites, onFavorite }: { favorites: string[]; onFavorite: (id: string) => void }) { const { slug } = useParams<{ slug: string }>(); const developer = developers.find((item) => item.slug === slug); if (!developer) return <NotFound />; const listed = projects.filter((project) => project.developer.id === developer.id); return <PageFrame eyebrow="Developer profile" title={developer.name} description={developer.description} action={<button type="button" onClick={() => onFavorite(developer.id)} data-testid="button-developer-favorite" className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${favorites.includes(developer.id) ? 'border-[#159b8b] bg-teal-50 text-[#159b8b]' : 'border-slate-200 text-[#162943]'}`}><Heart size={15} fill={favorites.includes(developer.id) ? 'currentColor' : 'none'} />{favorites.includes(developer.id) ? 'Saved' : 'Save developer'}</button>}><div className="mt-10 grid gap-5 sm:grid-cols-3"><Metric label="Founded" value={developer.founded} detail="years of perspective" /><Metric label="Projects" value={String(developer.projects)} detail="across the marketplace" /><Metric label="Profile" value="Verified" detail="documents reviewed" /></div><h2 className="mt-16 font-serif text-4xl font-semibold tracking-[-.05em] text-[#162943]">Projects by {developer.name}</h2><div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{listed.map((project) => <ProjectCard key={project.id} project={project} saved={favorites.includes(project.id)} onFavorite={() => onFavorite(project.id)} onCompare={() => undefined} />)}</div></PageFrame>; }
function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-slate-400">{label}</p><p className="mt-4 font-serif text-3xl font-semibold tracking-[-.05em] text-[#162943]">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>; }

function LocationsPage() { const cities = Array.from(new Set(projects.map((project) => project.city))); return <PageFrame eyebrow="Start with a place" title="Find your next address by city." description="From airport corridors to established urban edges, browse the places where plotted ownership is taking shape."><div className="mt-10 grid gap-5 md:grid-cols-2">{cities.map((city, index) => { const cityProjects = projects.filter((project) => project.city === city); return <div key={city} className={`relative overflow-hidden rounded-[24px] p-7 text-white ${index % 2 ? 'bg-[#3d6077]' : 'bg-[#162943]'}`}><div className="absolute right-[-25px] top-[-50px] h-56 w-56 rounded-full border border-white/15" /><div className="relative"><div className="flex items-center justify-between"><MapPin size={20} className="text-[#8ce0d4]" /><span className="font-mono text-[10px] uppercase tracking-[.14em] text-white/55">{cityProjects.length} projects</span></div><h2 className="mt-16 font-serif text-5xl font-semibold tracking-[-.06em]">{city}</h2><p className="mt-2 text-sm text-white/65">{Array.from(new Set(cityProjects.map((project) => project.area))).slice(0, 3).join(' · ')}</p><Link href="/projects" data-testid={`link-location-projects-${city.toLowerCase()}`} className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-bold hover:border-[#8ce0d4]">Browse projects <ArrowRight size={14} /></Link></div></div>; })}</div></PageFrame>; }
function HowItWorksPage() { const steps = [{ icon: Search, number: '01', title: 'Search with context', body: 'Start with a city, a project type or the developer you already trust. LandGrid keeps the important qualifiers close.' }, { icon: Eye, number: '02', title: 'Inspect what is real', body: 'Open the project plan, explore plot boundaries and compare area, facing, road width and availability.' }, { icon: UsersRound, number: '03', title: 'Talk to the right team', body: 'Send a focused enquiry to the developer behind the listing. Your question stays attached to the project.' }, { icon: FileCheck2, number: '04', title: 'Move when ready', body: 'Begin a guided expression of interest. Official documents, confirmation and payment stay with the developer.' }]; return <PageFrame eyebrow="A better buying rhythm" title="Clarity before commitment." description="LandGrid helps you do the thinking in the open, so the next step feels like a decision—not a leap."><div id="how-it-works" className="mt-10 grid gap-3 md:grid-cols-2">{steps.map(({ icon: Icon, number, title, body }) => <div key={number} className="group rounded-[22px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg sm:p-8"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold tracking-[.15em] text-[#159b8b]">{number}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#159b8b] transition group-hover:rotate-6"><Icon size={18} /></span></div><h2 className="mt-10 font-serif text-3xl font-semibold tracking-[-.05em] text-[#162943]">{title}</h2><p className="mt-3 max-w-[390px] text-sm leading-6 text-slate-500">{body}</p></div>)}</div><div className="mt-12 rounded-[24px] bg-[#162943] p-7 text-white sm:p-10"><div className="grid items-center gap-8 md:grid-cols-[1fr_auto]"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#8ce0d4]">Ready when you are</p><h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-.05em]">The grid is open.</h2></div><Link href="/projects" data-testid="link-how-it-works-explore" className="flex items-center justify-center gap-2 rounded-full bg-[#159b8b] px-5 py-3 text-xs font-bold text-white">Explore projects <ArrowRight size={14} /></Link></div></div></PageFrame>; }

function FavoritesPage({ favorites, onFavorite, onCompare }: { favorites: string[]; onFavorite: (id: string) => void; onCompare: (id: string) => void }) { const savedProjects = projects.filter((project) => favorites.includes(project.id)); const savedDevelopers = developers.filter((developer) => favorites.includes(developer.id)); const savedPlots = allPlots.filter((plot) => favorites.includes(plot.id)); return <PageFrame eyebrow="Your shortlist" title="Saved for a second look." description="Keep promising projects, plots and developers together while you narrow the field."><div className="flex items-center gap-3 border-b border-slate-200 pb-4 text-xs font-bold text-[#162943]"><Heart size={15} className="text-[#159b8b]" /> {favorites.length} saved items</div>{savedProjects.length > 0 && <><h2 className="mt-9 font-serif text-3xl font-semibold text-[#162943]">Projects</h2><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{savedProjects.map((project) => <ProjectCard key={project.id} project={project} saved onFavorite={() => onFavorite(project.id)} onCompare={() => onCompare(project.id)} />)}</div></>}{savedDevelopers.length > 0 && <><h2 className="mt-12 font-serif text-3xl font-semibold text-[#162943]">Developers</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{savedDevelopers.map((developer) => <DeveloperCard key={developer.id} developer={developer} saved onFavorite={() => onFavorite(developer.id)} />)}</div></>}{savedPlots.length > 0 && <><h2 className="mt-12 font-serif text-3xl font-semibold text-[#162943]">Plots</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{savedPlots.map((plot) => <PlotListCard key={plot.id} plot={plot} compared={false} onCompare={() => onFavorite(plot.id)} />)}</div></>}{favorites.length === 0 && <div className="mt-12 rounded-[24px] border border-dashed border-slate-300 bg-white p-16 text-center"><Heart className="mx-auto text-slate-300" size={34} /><h2 className="mt-4 font-serif text-3xl font-semibold text-[#162943]">Nothing saved yet</h2><p className="mx-auto mt-2 max-w-[380px] text-sm leading-6 text-slate-500">Tap the heart on a project, plot or developer to keep it close.</p><Link href="/projects" data-testid="link-empty-favorites" className="mt-6 inline-flex rounded-full bg-[#159b8b] px-5 py-3 text-xs font-bold text-white">Explore projects</Link></div>}</PageFrame>; }



function AdminWrapper({ Component }: { Component: React.ComponentType }) {
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function App() {
  const [favorites, setFavorites] = useState<string[]>([]); const [compared, setCompared] = useState<string[]>([]); const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null); const [bookingPlot, setBookingPlot] = useState<Plot | null>(null); const [enquiryPlot, setEnquiryPlot] = useState<Plot | null>(null); const [enquiries, setEnquiries] = useState<Enquiry[]>([]); const [listOpen, setListOpen] = useState(false);
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleCompare = (id: string) => setCompared((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 3 ? [...items, id] : items);
  const addEnquiry = (enquiry: Enquiry) => setEnquiries((items) => [enquiry, ...items]);
  const compareProjects = projects.filter((project) => compared.includes(project.id)); const comparePlots = allPlots.filter((plot) => compared.includes(plot.id));
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <div className="grain min-h-[100dvh] bg-[#f3f6f8] text-[#162943]">
          {!isAdminRoute && <Header favorites={favorites} onList={() => setListOpen(true)} />}
          <Switch>
            {/* Admin Platform Routes */}
            <Route path="/admin" component={() => <AdminWrapper Component={AdminDashboard} />} />
            <Route path="/admin/companies" component={() => <AdminWrapper Component={AdminCompanies} />} />
            <Route path="/admin/projects" component={() => <AdminWrapper Component={AdminProjects} />} />
            <Route path="/admin/plots" component={() => <AdminWrapper Component={AdminPlots} />} />
            <Route path="/admin/map-management" component={() => <AdminWrapper Component={AdminMapManagement} />} />
            <Route path="/admin/users" component={() => <AdminWrapper Component={AdminUsers} />} />
            <Route path="/admin/enquiries" component={() => <AdminWrapper Component={AdminEnquiries} />} />
            <Route path="/admin/bookings" component={() => <AdminWrapper Component={AdminBookings} />} />
            <Route path="/admin/payments" component={() => <AdminWrapper Component={AdminPayments} />} />
            <Route path="/admin/locations" component={() => <AdminWrapper Component={AdminLocations} />} />
            <Route path="/admin/amenities" component={() => <AdminWrapper Component={AdminAmenities} />} />
            <Route path="/admin/landmarks" component={() => <AdminWrapper Component={AdminLandmarks} />} />
            <Route path="/admin/analytics" component={() => <AdminWrapper Component={AdminAnalytics} />} />
            <Route path="/admin/reports" component={() => <AdminWrapper Component={AdminReports} />} />
            <Route path="/admin/content" component={() => <AdminWrapper Component={AdminContent} />} />
            <Route path="/admin/notifications" component={() => <AdminWrapper Component={AdminNotifications} />} />
            <Route path="/admin/activity" component={() => <AdminWrapper Component={AdminActivity} />} />
            <Route path="/admin/settings" component={() => <AdminWrapper Component={AdminSettings} />} />
            <Route path="/admin/profile" component={() => <AdminWrapper Component={AdminProfile} />} />

            {/* Customer Public Marketplace Routes */}
            <Route path="/" component={() => <HomePage favorites={favorites} onFavorite={toggleFavorite} onCompare={toggleCompare} />} />
            <Route path="/projects" component={() => <ProjectsPage favorites={favorites} onFavorite={toggleFavorite} onCompare={toggleCompare} />} />
            <Route path="/projects/:slug" component={() => <ProjectPage favorites={favorites} onFavorite={toggleFavorite} selectedPlot={selectedPlot} setSelectedPlot={setSelectedPlot} setBooking={setBookingPlot} setEnquiry={setEnquiryPlot} />} />
            <Route path="/plots" component={() => <PlotsPage compared={compared} onCompare={toggleCompare} />} />
            <Route path="/plots/:id" component={() => <PlotDetailPage favorites={favorites} onFavorite={toggleFavorite} onBooking={setBookingPlot} onEnquiry={setEnquiryPlot} />} />
            <Route path="/developers" component={() => <DevelopersPage favorites={favorites} onFavorite={toggleFavorite} />} />
            <Route path="/developers/:slug" component={() => <DeveloperPage favorites={favorites} onFavorite={toggleFavorite} />} />
            <Route path="/locations" component={LocationsPage} />
            <Route path="/how-it-works" component={HowItWorksPage} />
            <Route path="/favorites" component={() => <FavoritesPage favorites={favorites} onFavorite={toggleFavorite} onCompare={toggleCompare} />} />
            <Route path="/account" component={AccountPage} />
            <Route path="/enquiries" component={() => <EnquiriesPage enquiries={enquiries} onCreate={addEnquiry} />} />
            <Route component={NotFound} />
          </Switch>
          {!isAdminRoute && <MobileNav />}
          {compared.length > 0 && <CompareTray ids={compared} projects={compareProjects} plots={comparePlots} onRemove={toggleCompare} />}
          {bookingPlot && <BookingWizard plot={bookingPlot} onClose={() => setBookingPlot(null)} onEnquire={() => { setBookingPlot(null); setEnquiryPlot(bookingPlot); }} />}
          {enquiryPlot && <EnquiryDialog project={projects[0]} plot={enquiryPlot} onClose={() => setEnquiryPlot(null)} onSubmit={(enquiry) => { addEnquiry(enquiry); setEnquiryPlot(null); }} />}
          {listOpen && <ListPropertyDialog onClose={() => setListOpen(false)} />}
        </div>
      </AdminProvider>
    </QueryClientProvider>
  );
}
function CompareTray({ ids, projects: comparedProjects, plots: comparedPlots, onRemove }: { ids: string[]; projects: Project[]; plots: Plot[]; onRemove: (id: string) => void }) { const [open, setOpen] = useState(false); return <div className="fixed bottom-16 left-1/2 z-[1050] w-[min(94vw,720px)] -translate-x-1/2 md:bottom-5"><div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(22,41,67,.18)]"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Layers3 size={17} className="text-[#159b8b]" /><span className="text-xs font-bold text-[#162943]">{ids.length} selected to compare</span></div><div className="flex items-center gap-2"><button type="button" onClick={() => setOpen(!open)} data-testid="button-open-compare" className="rounded-full bg-[#162943] px-3 py-2 text-[10px] font-bold text-white">{open ? 'Close' : 'Compare now'}</button><button type="button" onClick={() => ids.forEach(onRemove)} aria-label="Clear comparison" data-testid="button-clear-compare" className="rounded-full p-2 text-slate-400 hover:bg-slate-50"><X size={14} /></button></div></div>{open && <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-3">{comparedProjects.map((project) => <div key={project.id} className="rounded-xl bg-slate-50 p-3"><div className="flex justify-between"><span className="text-xs font-bold text-[#162943]">{project.name}</span><button type="button" onClick={() => onRemove(project.id)} data-testid={`button-remove-compare-${project.id}`} className="text-slate-400"><X size={13} /></button></div><p className="mt-2 text-[10px] text-slate-500">{project.city} · {priceLabels[project.name]} · {project.available} available</p></div>)}{comparedPlots.map((plot) => <div key={plot.id} className="rounded-xl bg-slate-50 p-3"><div className="flex justify-between"><span className="text-xs font-bold text-[#162943]">P-{String(plot.number).padStart(3, '0')}</span><button type="button" onClick={() => onRemove(plot.id)} data-testid={`button-remove-compare-${plot.id}`} className="text-slate-400"><X size={13} /></button></div><p className="mt-2 text-[10px] text-slate-500">{plot.area.toLocaleString()} sq ft · {formatCompactPrice(plot.price)}</p></div>)}</div>}{open && <button type="button" onClick={() => window.alert('Your comparison enquiry has been queued for an advisor.')} data-testid="button-enquire-all" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#159b8b] py-2.5 text-[11px] font-bold text-white">Enquire All <MessageSquare size={13} /></button>}</div></div>; }

export default App;

function EnquiriesPage({ enquiries, onCreate }: { enquiries: Enquiry[]; onCreate: (enquiry: Enquiry) => void }) { const [open, setOpen] = useState(false); return <PageFrame eyebrow="Your conversations" title="Questions belong in the process." description="Send an enquiry to a developer, ask about a plot or request a project brief. LandGrid keeps the thread easy to find."><div className="flex justify-end"><button type="button" onClick={() => setOpen(true)} data-testid="button-new-enquiry" className="flex items-center gap-2 rounded-full bg-[#159b8b] px-4 py-2.5 text-xs font-bold text-white"><MessageSquare size={14} /> New enquiry</button></div>{enquiries.length ? <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">{enquiries.map((enquiry) => <div key={enquiry.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 last:border-0"><div><p className="text-sm font-bold text-[#162943]">{enquiry.project}{enquiry.plot ? ` · ${enquiry.plot}` : ''}</p><p className="mt-1 text-xs text-slate-500">{enquiry.developer} · {enquiry.date}</p></div><span className="rounded-full bg-teal-50 px-3 py-1.5 text-[10px] font-bold text-[#0c665c]">{enquiry.status}</span></div>)}</div> : <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-white p-16 text-center"><MessageSquare className="mx-auto text-slate-300" size={34} /><h2 className="mt-4 font-serif text-3xl font-semibold text-[#162943]">No enquiries yet</h2><p className="mt-2 text-sm text-slate-500">Start a conversation when a project catches your eye.</p><button type="button" onClick={() => setOpen(true)} data-testid="button-empty-enquiry" className="mt-6 rounded-full bg-[#162943] px-5 py-3 text-xs font-bold text-white">Ask a question</button></div>}{open && <EnquiryDialog onClose={() => setOpen(false)} onSubmit={(enquiry) => { onCreate(enquiry); setOpen(false); }} />}</PageFrame>; }

function EnquiryDialog({ onClose, onSubmit, project = projects[0], plot }: { onClose: () => void; onSubmit: (enquiry: Enquiry) => void; project?: Project; plot?: Plot | null }) { const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [message, setMessage] = useState(''); const submit = (event: FormEvent) => { event.preventDefault(); onSubmit({ id: `enquiry-${Date.now()}`, project: project.name, plot: plot ? `P-${String(plot.number).padStart(3, '0')}` : undefined, developer: project.developer.name, date: 'Just now', status: 'New' }); }; return <Modal title="Start an enquiry" onClose={onClose}><form onSubmit={submit} className="grid gap-4"><p className="text-sm leading-6 text-slate-500">Ask {project.developer.name} about {project.name}{plot ? `, plot P-${String(plot.number).padStart(3, '0')}` : ''}.</p><Field label="Your name" value={name} onChange={setName} placeholder="Name" testId="input-enquiry-name" required /><Field label="Phone or email" value={phone} onChange={setPhone} placeholder="How should we reach you?" testId="input-enquiry-contact" required /><label className="block"><span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[.12em] text-slate-400">Message</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What would you like to know?" data-testid="input-enquiry-message" className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-[#159b8b]" /></label><button type="submit" data-testid="button-submit-enquiry" className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#159b8b] py-3 text-xs font-bold text-white">Send enquiry <ArrowRight size={14} /></button></form></Modal>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-[1300] flex items-end justify-center bg-[#162943]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[90dvh] w-full max-w-[480px] overflow-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between"><h2 className="font-serif text-3xl font-semibold tracking-[-.05em] text-[#162943]">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" data-testid="button-close-dialog" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button></div><div className="mt-6">{children}</div></div></div>; }
function Field({ label, value, onChange, placeholder, testId, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; testId: string; required?: boolean }) { return <label className="block"><span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[.12em] text-slate-400">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} data-testid={testId} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-[#162943] outline-none focus:border-[#159b8b]" /></label>; }

function BookingWizard({ plot, onClose, onEnquire }: { plot: Plot; onClose: () => void; onEnquire: () => void }) { const [step, setStep] = useState(1); const [name, setName] = useState(''); const [contact, setContact] = useState(''); return <Modal title={step === 4 ? 'Interest recorded' : `Reserve P-${String(plot.number).padStart(3, '0')}`} onClose={onClose}>{step < 4 && <div className="mb-6 flex items-center gap-2">{['Confirm', 'Details', 'Summary', 'Payment'].map((label, index) => <div key={label} className="flex items-center gap-2"><span className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] font-bold ${step > index ? 'bg-[#159b8b] text-white' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</span>{index < 3 && <span className="h-px w-4 bg-slate-200" />}</div>)}</div>}{step === 1 && <div><StatusBadge status={plot.status} /><div className="mt-4 rounded-xl bg-slate-50 p-4"><SummaryRow label="Plot" value={`P-${String(plot.number).padStart(3, '0')}`} /><SummaryRow label="Area" value={`${plot.area.toLocaleString()} sq ft`} /><SummaryRow label="Indicative price" value={formatPrice(plot.price)} /></div><p className="mt-4 text-xs leading-5 text-slate-500">This begins a guided booking conversation. No payment is taken here.</p><button type="button" onClick={() => setStep(2)} data-testid="button-booking-confirm" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#159b8b] py-3 text-xs font-bold text-white">Continue <ArrowRight size={14} /></button></div>}{step === 2 && <div className="grid gap-4"><p className="text-sm text-slate-500">Tell the advisor who to prepare the details for.</p><Field label="Full name" value={name} onChange={setName} placeholder="Your name" testId="input-booking-name" required /><Field label="Phone or email" value={contact} onChange={setContact} placeholder="Your preferred contact" testId="input-booking-contact" required /><button type="button" onClick={() => setStep(3)} disabled={!name || !contact} data-testid="button-booking-details" className="rounded-xl bg-[#159b8b] py-3 text-xs font-bold text-white disabled:opacity-40">Review summary</button></div>}{step === 3 && <div><p className="text-sm leading-6 text-slate-500">Review your expression of interest. The developer will confirm availability and share the official booking documentation.</p><div className="mt-5 rounded-xl border border-slate-200 p-4"><SummaryRow label="Customer" value={name} /><SummaryRow label="Contact" value={contact} /><SummaryRow label="Project" value="Aanvi Heights · Sreeni Groups" /><SummaryRow label="Plot" value={`P-${String(plot.number).padStart(3, '0')} · ${formatPrice(plot.price)}`} /></div><button type="button" onClick={() => setStep(4)} data-testid="button-booking-submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#159b8b] py-3 text-xs font-bold text-white">Record interest <Check size={14} /></button></div>}{step === 4 && <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#159b8b]"><Check size={26} /></div><h3 className="mt-5 font-serif text-3xl font-semibold text-[#162943]">You’re on the list.</h3><p className="mt-3 text-sm leading-6 text-slate-500">An advisor will contact you about P-{String(plot.number).padStart(3, '0')}. Payment is intentionally left for the official developer process.</p><div className="mt-6 grid gap-2"><button type="button" onClick={onEnquire} data-testid="button-booking-enquire" className="rounded-xl border border-slate-200 py-3 text-xs font-bold text-[#162943]">Ask another question</button><button type="button" onClick={onClose} data-testid="button-booking-done" className="rounded-xl bg-[#162943] py-3 text-xs font-bold text-white">Done</button></div></div>}</Modal>; }
function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-slate-100 py-2.5 text-xs last:border-0"><span className="text-slate-500">{label}</span><span className="font-semibold text-[#162943]">{value}</span></div>; }

function AccountPage() { const [role, setRole] = useState<'buyer' | 'developer' | 'admin'>('buyer'); const roleOptions: { value: 'buyer' | 'developer' | 'admin'; label: string; Icon: typeof UserRound }[] = [{ value: 'buyer', label: 'Buyer view', Icon: UserRound }, { value: 'developer', label: 'Developer view', Icon: Building2 }, { value: 'admin', label: 'Platform view', Icon: ShieldCheck }]; return <PageFrame eyebrow="Your LandGrid account" title="A clearer way to keep moving." description="Manage your shortlist, conversations and booking progress in one place. Switch roles to preview the internal views LandGrid is designed to support."><div className="mt-10 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">{roleOptions.map(({ value, label, Icon }) => <button key={value} type="button" onClick={() => setRole(value)} data-testid={`button-role-${value}`} className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${role === value ? 'bg-[#162943] text-white' : 'text-slate-500 hover:bg-slate-50'}`}><Icon size={14} />{label}</button>)}</div>{role === 'buyer' && <DashboardPanel title="Buyer workspace" copy="Your saved inventory and enquiries will appear here as you explore." items={['Shortlist projects across cities', 'Compare plots side by side', 'Track every developer conversation']} icon={<Compass size={20} />} />}{role === 'developer' && <DashboardPanel title="Developer workspace" copy="A focused place to monitor your listing health and respond to high-intent buyers." items={['3 active projects', '47 new plot views this week', '8 enquiries awaiting a reply']} icon={<Building2 size={20} />} />}{role === 'admin' && <DashboardPanel title="Platform overview" copy="A lightweight operations view for keeping the marketplace trustworthy and current." items={['15 live projects', '5 verified developers', '1,700+ conceptual plots']} icon={<ShieldCheck size={20} />} />}</PageFrame>; }
function DashboardPanel({ title, copy, items, icon }: { title: string; copy: string; items: string[]; icon: ReactNode }) { return <div className="mt-8 rounded-[24px] bg-[#162943] p-7 text-white sm:p-10"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#159b8b]">{icon}</div><h2 className="mt-6 font-serif text-4xl font-semibold tracking-[-.05em]">{title}</h2><p className="mt-3 max-w-[530px] text-sm leading-6 text-slate-300">{copy}</p><div className="mt-8 grid gap-2 md:grid-cols-3">{items.map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-semibold text-slate-200">{item}</div>)}</div></div>; }
function NotFound() { return <PageFrame eyebrow="404 · Off the grid" title="That page has moved." description="Try the marketplace again or return to the homepage."><Link href="/" data-testid="link-not-found-home" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#159b8b] px-5 py-3 text-xs font-bold text-white">Back to LandGrid <ArrowRight size={14} /></Link></PageFrame>; }

function ListPropertyDialog({ onClose }: { onClose: () => void }) { const [sent, setSent] = useState(false); const [company, setCompany] = useState(''); const [email, setEmail] = useState(''); return <Modal title={sent ? 'We’ll be in touch.' : 'List your property'} onClose={onClose}>{sent ? <div className="text-center"><Check className="mx-auto text-[#159b8b]" size={32} /><p className="mt-4 text-sm leading-6 text-slate-500">Share your project details with our partnerships team and we’ll follow up shortly.</p><button type="button" onClick={onClose} data-testid="button-close-list-success" className="mt-6 rounded-xl bg-[#162943] px-5 py-3 text-xs font-bold text-white">Done</button></div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} className="grid gap-4"><p className="text-sm leading-6 text-slate-500">Tell us a little about the land or plotted development you represent.</p><Field label="Company name" value={company} onChange={setCompany} placeholder="Developer or company" testId="input-list-company" required /><Field label="Work email" value={email} onChange={setEmail} placeholder="you@company.com" testId="input-list-email" required /><button type="submit" data-testid="button-submit-list-property" className="rounded-xl bg-[#159b8b] py-3 text-xs font-bold text-white">Request a conversation</button></form>}</Modal>; }
