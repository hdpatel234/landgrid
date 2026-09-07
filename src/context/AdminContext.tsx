import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  DeveloperAdmin, ProjectAdmin, PlotAdmin, UserAdmin, EnquiryAdmin, BookingAdmin, ActivityLog,
  initialDevelopers, initialProjects, initialEnquiries, initialBookings, initialUsers, initialActivityLogs
} from '../lib/adminMockData';

interface AdminContextType {
  developers: DeveloperAdmin[];
  projects: ProjectAdmin[];
  plots: PlotAdmin[];
  users: UserAdmin[];
  enquiries: EnquiryAdmin[];
  bookings: BookingAdmin[];
  activityLogs: ActivityLog[];
  notificationsCount: number;

  // Developer Actions
  approveDeveloper: (id: string) => void;
  rejectDeveloper: (id: string) => void;
  suspendDeveloper: (id: string) => void;
  addDeveloper: (dev: Partial<DeveloperAdmin>) => void;

  // Project Actions
  approveProject: (id: string) => void;
  rejectProject: (id: string) => void;
  suspendProject: (id: string) => void;
  addProject: (proj: Partial<ProjectAdmin>) => void;
  toggleFeaturedProject: (id: string) => void;

  // Plot Actions
  updatePlotStatus: (plotId: string, status: PlotAdmin['status'], note?: string) => void;
  addPlot: (plot: Partial<PlotAdmin>) => void;
  updatePlotGeometry: (plotId: string, coords: [number, number][]) => void;

  // Enquiry & Booking Actions
  updateEnquiryStatus: (id: string, status: EnquiryAdmin['status']) => void;
  updateBookingStatus: (id: string, status: BookingAdmin['bookingStatus']) => void;

  // Activity log helper
  logAction: (action: string, entity: string, details: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [developers, setDevelopers] = useState<DeveloperAdmin[]>(initialDevelopers);
  const [projects, setProjects] = useState<ProjectAdmin[]>(initialProjects);
  const [enquiries, setEnquiries] = useState<EnquiryAdmin[]>(initialEnquiries);
  const [bookings, setBookings] = useState<BookingAdmin[]>(initialBookings);
  const [users, setUsers] = useState<UserAdmin[]>(initialUsers);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);

  // Generate initial plots list for admin (combines Aanvi Heights and additional projects)
  const [plots, setPlots] = useState<PlotAdmin[]>(() => {
    const generatedPlots: PlotAdmin[] = [];
    const statuses: PlotAdmin['status'][] = ['Available', 'On Hold', 'Booked', 'Registration Completed', 'Sold', 'Blocked'];
    const facings = ['North', 'South', 'East', 'West'];
    const roads = ["30' Road", "33' Road", "40' Road", "Proposed 100' Wide Road"];

    let idCount = 1;

    // Generate plots for Project 1 (Aanvi Heights - 120 plots)
    for (let i = 1; i <= 120; i++) {
      const row = Math.floor((i - 1) / 10);
      const col = (i - 1) % 10;
      const baseLat = 17.2470 + row * 0.00045;
      const baseLng = 78.4485 + col * 0.00055;
      const status = statuses[i % statuses.length];
      const areaSqFt = 1500 + (i % 5) * 150;

      generatedPlots.push({
        id: `plot-${i}`,
        number: i,
        projectId: 'project-1',
        projectName: 'Aanvi Heights',
        developerId: 'dev-1',
        developerName: 'Sreeni Groups',
        sector: `Phase ${Math.floor(i / 20) + 1}`,
        status,
        facing: facings[i % 4],
        road: roads[i % 4],
        areaSqFt,
        areaSqYd: Math.round(areaSqFt / 9),
        price: areaSqFt * 3200,
        type: i % 5 === 0 ? 'Corner' : i % 7 === 0 ? 'Premium' : 'Standard',
        coordinates: [
          [baseLat, baseLng],
          [baseLat + 0.00035, baseLng],
          [baseLat + 0.00035, baseLng + 0.00048],
          [baseLat, baseLng + 0.00048]
        ],
        history: [
          { date: '2026-08-01', from: 'Draft', to: 'Available', user: 'System', note: 'Plot added to inventory' }
        ],
        viewsCount: 140 + i * 3,
        enquiriesCount: 12 + (i % 8)
      });
      idCount++;
    }

    return generatedPlots;
  });

  const logAction = (action: string, entity: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user: 'Super Admin',
      action,
      entity,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ip: '127.0.0.1 (Local Session)',
      details
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const approveDeveloper = (id: string) => {
    setDevelopers((prev) => prev.map((d) => d.id === id ? { ...d, verificationStatus: 'Verified', status: 'Active' } : d));
    logAction('Approved Developer', id, 'Developer verification and business documents approved.');
  };

  const rejectDeveloper = (id: string) => {
    setDevelopers((prev) => prev.map((d) => d.id === id ? { ...d, verificationStatus: 'Rejected', status: 'Inactive' } : d));
    logAction('Rejected Developer', id, 'Developer verification rejected due to incomplete compliance.');
  };

  const suspendDeveloper = (id: string) => {
    setDevelopers((prev) => prev.map((d) => d.id === id ? { ...d, verificationStatus: 'Suspended', status: 'Suspended' } : d));
    logAction('Suspended Developer', id, 'Developer platform account temporarily suspended.');
  };

  const addDeveloper = (dev: Partial<DeveloperAdmin>) => {
    const newDev: DeveloperAdmin = {
      id: `dev-${Date.now()}`,
      name: dev.name || 'New Developer',
      slug: (dev.name || 'new-dev').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      initials: (dev.name || 'ND').split(' ').map(w => w[0]).join('').slice(0, 2),
      founded: dev.founded || '2024',
      projectsCount: 0,
      plotsCount: 0,
      enquiriesCount: 0,
      verificationStatus: 'Pending',
      status: 'Pending Review',
      contactPerson: dev.contactPerson || 'Contact Person',
      email: dev.email || 'dev@landgrid.com',
      phone: dev.phone || '+91 99000 00000',
      website: dev.website || 'https://landgrid.com',
      city: dev.city || 'Hyderabad',
      state: dev.state || 'Telangana',
      rating: 5.0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setDevelopers((prev) => [newDev, ...prev]);
    logAction('Added Developer', newDev.name, 'New developer onboarding submitted.');
  };

  const approveProject = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, approvalStatus: 'Approved', status: 'Ready to build' } : p));
    logAction('Approved Project', id, 'Project listing approved for marketplace publication.');
  };

  const rejectProject = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, approvalStatus: 'Rejected' } : p));
    logAction('Rejected Project', id, 'Project review rejected.');
  };

  const suspendProject = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, approvalStatus: 'Suspended' } : p));
    logAction('Suspended Project', id, 'Project temporarily taken off public listings.');
  };

  const addProject = (proj: Partial<ProjectAdmin>) => {
    const newProj: ProjectAdmin = {
      id: `project-${Date.now()}`,
      slug: (proj.name || 'new-project').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: proj.name || 'New Project Venture',
      developerId: proj.developerId || 'dev-1',
      developerName: proj.developerName || 'Sreeni Groups',
      city: proj.city || 'Hyderabad',
      area: proj.area || 'Shamshabad',
      type: proj.type || 'Plots',
      status: 'Ready to build',
      possession: 'Q1 2026',
      priceFrom: proj.priceFrom || 3500000,
      plotCount: proj.plotCount || 50,
      availableCount: proj.plotCount || 50,
      acres: proj.acres || 10,
      approvalStatus: 'Approved',
      featured: false,
      description: proj.description || 'Modern plotted land development.',
      lat: proj.lat || 17.2478,
      lng: proj.lng || 78.4502,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setProjects((prev) => [newProj, ...prev]);
    logAction('Added Project', newProj.name, 'New project created.');
  };

  const toggleFeaturedProject = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, featured: !p.featured } : p));
    logAction('Toggled Featured Project', id, 'Featured highlight status updated.');
  };

  const updatePlotStatus = (plotId: string, status: PlotAdmin['status'], note = 'Status changed by platform administrator') => {
    setPlots((prev) => prev.map((plot) => {
      if (plot.id === plotId) {
        const newHistory = [
          ...plot.history,
          { date: new Date().toISOString().replace('T', ' ').slice(0, 16), from: plot.status, to: status, user: 'Admin', note }
        ];
        return { ...plot, status, history: newHistory };
      }
      return plot;
    }));
    logAction('Updated Plot Status', plotId, `Plot status changed to ${status}`);
  };

  const addPlot = (plotData: Partial<PlotAdmin>) => {
    const newPlot: PlotAdmin = {
      id: `plot-${Date.now()}`,
      number: plotData.number || plots.length + 1,
      projectId: plotData.projectId || 'project-1',
      projectName: plotData.projectName || 'Aanvi Heights',
      developerId: plotData.developerId || 'dev-1',
      developerName: plotData.developerName || 'Sreeni Groups',
      sector: plotData.sector || 'Phase 1 - North Greens',
      status: plotData.status || 'Available',
      facing: plotData.facing || 'East',
      road: plotData.road || "33' Road",
      areaSqFt: plotData.areaSqFt || 1650,
      areaSqYd: Math.round((plotData.areaSqFt || 1650) / 9),
      price: plotData.price || 5200000,
      type: plotData.type || 'Standard',
      coordinates: plotData.coordinates || [[17.2475, 78.4490], [17.24785, 78.4490], [17.24785, 78.44948], [17.2475, 78.44948]],
      history: [{ date: new Date().toISOString().slice(0, 10), from: 'Draft', to: 'Available', user: 'Admin', note: 'Created via Map Editor' }],
      viewsCount: 1,
      enquiriesCount: 0
    };
    setPlots((prev) => [newPlot, ...prev]);
    logAction('Created Plot Polygon', `P-${newPlot.number}`, `New plot created in ${newPlot.projectName}`);
  };

  const updatePlotGeometry = (plotId: string, coords: [number, number][]) => {
    setPlots((prev) => prev.map((p) => p.id === plotId ? { ...p, coordinates: coords } : p));
    logAction('Updated Plot GeoJSON', plotId, 'Polygon coordinates adjusted on map editor.');
  };

  const updateEnquiryStatus = (id: string, status: EnquiryAdmin['status']) => {
    setEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    logAction('Updated Enquiry Status', id, `Status updated to ${status}`);
  };

  const updateBookingStatus = (id: string, status: BookingAdmin['bookingStatus']) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, bookingStatus: status } : b));
    logAction('Updated Booking Status', id, `Booking status changed to ${status}`);
  };

  return (
    <AdminContext.Provider value={{
      developers, projects, plots, users, enquiries, bookings, activityLogs,
      notificationsCount: 5,
      approveDeveloper, rejectDeveloper, suspendDeveloper, addDeveloper,
      approveProject, rejectProject, suspendProject, addProject, toggleFeaturedProject,
      updatePlotStatus, addPlot, updatePlotGeometry,
      updateEnquiryStatus, updateBookingStatus, logAction
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
}
