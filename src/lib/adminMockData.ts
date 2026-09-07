export type VerificationStatus = 'Verified' | 'Pending' | 'Rejected' | 'Suspended';
export type ProjectApprovalStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Suspended';
export type PlotAdminStatus = 'Available' | 'On Hold' | 'Booked' | 'Registration Completed' | 'Sold' | 'Blocked';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Refunded';
export type EnquiryStatus = 'New' | 'Contacted' | 'Interested' | 'Follow-up' | 'Converted' | 'Closed' | 'Spam';

export interface DeveloperAdmin {
  id: string;
  name: string;
  slug: string;
  initials: string;
  founded: string;
  projectsCount: number;
  plotsCount: number;
  enquiriesCount: number;
  verificationStatus: VerificationStatus;
  status: 'Active' | 'Inactive' | 'Pending Review' | 'Suspended';
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  rating: number;
  createdAt: string;
  featured?: boolean;
}

export interface ProjectAdmin {
  id: string;
  slug: string;
  name: string;
  developerId: string;
  developerName: string;
  city: string;
  area: string;
  type: string;
  status: string;
  possession: string;
  priceFrom: number;
  plotCount: number;
  availableCount: number;
  acres: number;
  approvalStatus: ProjectApprovalStatus;
  featured: boolean;
  trending?: boolean;
  recommended?: boolean;
  description: string;
  lat: number;
  lng: number;
  createdAt: string;
  masterPlanUrl?: string;
}

export interface PlotAdmin {
  id: string;
  number: number;
  projectId: string;
  projectName: string;
  developerId: string;
  developerName: string;
  sector: string;
  status: PlotAdminStatus;
  facing: string;
  road: string;
  areaSqFt: number;
  areaSqYd: number;
  price: number;
  type: 'Standard' | 'Corner' | 'Premium';
  coordinates: [number, number][];
  history: { date: string; from: string; to: string; user: string; note: string }[];
  viewsCount: number;
  enquiriesCount: number;
  featured?: boolean;
}

export interface UserAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Developer' | 'Agent' | 'Admin';
  enquiriesCount: number;
  bookingsCount: number;
  savedPlotsCount: number;
  status: 'Active' | 'Suspended' | 'Pending';
  createdAt: string;
}

export interface EnquiryAdmin {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectId: string;
  projectName: string;
  plotId?: string;
  plotNumber?: number;
  developerName: string;
  message: string;
  date: string;
  status: EnquiryStatus;
  assignedTo: string;
}

export interface BookingAdmin {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  developerName: string;
  projectName: string;
  plotId: string;
  plotNumber: number;
  amount: number;
  bookingAmount: number;
  taxAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  bookingStatus: BookingStatus;
  paymentMethod: string;
  transactionId: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  date: string;
  ip: string;
  details: string;
}

// Initial Mock Developers (50 total dataset representation)
export const initialDevelopers: DeveloperAdmin[] = [
  { id: 'dev-1', name: 'Sreeni Groups', slug: 'sreeni-groups', initials: 'SG', founded: '2008', projectsCount: 8, plotsCount: 430, enquiriesCount: 1284, verificationStatus: 'Verified', status: 'Active', contactPerson: 'Rajesh Sreeni', email: 'contact@sreenigroups.com', phone: '+91 98490 12345', website: 'https://sreenigroups.com', city: 'Hyderabad', state: 'Telangana', rating: 4.8, createdAt: '2023-01-15', featured: true },
  { id: 'dev-2', name: 'Verdant Habitat', slug: 'verdant-habitat', initials: 'VH', founded: '2013', projectsCount: 12, plotsCount: 820, enquiriesCount: 1940, verificationStatus: 'Verified', status: 'Active', contactPerson: 'Ananya Rao', email: 'info@verdanthabitat.in', phone: '+91 98800 23456', website: 'https://verdanthabitat.in', city: 'Bengaluru', state: 'Karnataka', rating: 4.7, createdAt: '2023-03-20', featured: true },
  { id: 'dev-3', name: 'Arcstone Estates', slug: 'arcstone-estates', initials: 'AE', founded: '1999', projectsCount: 6, plotsCount: 310, enquiriesCount: 890, verificationStatus: 'Verified', status: 'Active', contactPerson: 'Vikram Reddy', email: 'sales@arcstone.co.in', phone: '+91 97000 34567', website: 'https://arcstone.co.in', city: 'Hyderabad', state: 'Telangana', rating: 4.6, createdAt: '2022-11-10', featured: false },
  { id: 'dev-4', name: 'Morrow Land Co.', slug: 'morrow-land-co', initials: 'ML', founded: '2020', projectsCount: 5, plotsCount: 450, enquiriesCount: 720, verificationStatus: 'Verified', status: 'Active', contactPerson: 'Karan Sharma', email: 'hello@morrowland.com', phone: '+91 99100 45678', website: 'https://morrowland.com', city: 'Bengaluru', state: 'Karnataka', rating: 4.5, createdAt: '2023-06-05', featured: false },
  { id: 'dev-5', name: 'Nestline Properties', slug: 'nestline-properties', initials: 'NP', founded: '2017', projectsCount: 4, plotsCount: 280, enquiriesCount: 510, verificationStatus: 'Verified', status: 'Active', contactPerson: 'Priya Nair', email: 'support@nestline.in', phone: '+91 98450 56789', website: 'https://nestline.in', city: 'Hyderabad', state: 'Telangana', rating: 4.4, createdAt: '2023-08-12', featured: false },
  { id: 'dev-6', name: 'GreenField Developers', slug: 'greenfield-developers', initials: 'GD', founded: '2019', projectsCount: 6, plotsCount: 310, enquiriesCount: 240, verificationStatus: 'Pending', status: 'Pending Review', contactPerson: 'Sunil Verma', email: 'sunil@greenfield.org', phone: '+91 98220 67890', website: 'https://greenfield.org', city: 'Pune', state: 'Maharashtra', rating: 4.2, createdAt: '2024-02-01', featured: false },
  { id: 'dev-7', name: 'Urban Skylines', slug: 'urban-skylines', initials: 'US', founded: '2015', projectsCount: 9, plotsCount: 640, enquiriesCount: 1120, verificationStatus: 'Verified', status: 'Active', contactPerson: 'Deepak Patel', email: 'info@urbanskylines.com', phone: '+91 98980 78901', website: 'https://urbanskylines.com', city: 'Ahmedabad', state: 'Gujarat', rating: 4.6, createdAt: '2023-04-18' },
  { id: 'dev-8', name: 'Signature Infra', slug: 'signature-infra', initials: 'SI', founded: '2011', projectsCount: 7, plotsCount: 520, enquiriesCount: 980, verificationStatus: 'Verified', status: 'Active', contactPerson: 'Manish Gupta', email: 'contact@signatureinfra.com', phone: '+91 98110 89012', website: 'https://signatureinfra.com', city: 'Gurugram', state: 'Haryana', rating: 4.7, createdAt: '2023-05-22' },
];

// Seed projects representation (126 platform total dataset)
export const initialProjects: ProjectAdmin[] = [
  { id: 'project-1', slug: 'aanvi-heights', name: 'Aanvi Heights', developerId: 'dev-1', developerName: 'Sreeni Groups', city: 'Hyderabad', area: 'Manisam Pally', type: 'Plots', status: 'Ready to build', possession: 'Immediate', priceFrom: 4800000, plotCount: 120, availableCount: 45, acres: 14.8, approvalStatus: 'Approved', featured: true, trending: true, description: 'A quiet, planned address on Hyderabad’s southern edge, with a considered green spine and flexible plot sizes.', lat: 17.2478, lng: 78.4502, createdAt: '2023-08-01' },
  { id: 'project-2', slug: 'meridian-grove', name: 'Meridian Grove', developerId: 'dev-2', developerName: 'Verdant Habitat', city: 'Hyderabad', area: 'Shamshabad', type: 'Villa plots', status: 'Launching soon', possession: 'Q4 2025', priceFrom: 3820000, plotCount: 84, availableCount: 62, acres: 11.2, approvalStatus: 'Approved', featured: true, description: 'A green-first plotted neighbourhood with wide boulevards and a short airport commute.', lat: 17.226, lng: 78.389, createdAt: '2023-09-10' },
  { id: 'project-3', slug: 'the-foundry-district', name: 'The Foundry District', developerId: 'dev-3', developerName: 'Arcstone Estates', city: 'Hyderabad', area: 'Tellapur', type: 'Urban plots', status: 'Ready to build', possession: 'Immediate', priceFrom: 7250000, plotCount: 76, availableCount: 24, acres: 9.6, approvalStatus: 'Approved', featured: true, description: 'Serviced plots for people who want a city address and the freedom to shape what comes next.', lat: 17.456, lng: 78.318, createdAt: '2023-07-15' },
  { id: 'project-4', slug: 'aster-fields', name: 'Aster Fields', developerId: 'dev-4', developerName: 'Morrow Land Co.', city: 'Bengaluru', area: 'Devanahalli', type: 'Plots', status: 'Launching soon', possession: 'Q4 2025', priceFrom: 3180000, plotCount: 132, availableCount: 96, acres: 18.4, approvalStatus: 'Approved', featured: true, description: 'A clear-title land community near Bengaluru’s northern airport corridor.', lat: 13.249, lng: 77.711, createdAt: '2023-10-05' },
  { id: 'project-5', slug: 'lakeview-28', name: 'Lakeview 28', developerId: 'dev-5', developerName: 'Nestline Properties', city: 'Hyderabad', area: 'Kondapur', type: 'Premium plots', status: 'Ready to build', possession: 'Immediate', priceFrom: 11200000, plotCount: 58, availableCount: 11, acres: 6.8, approvalStatus: 'Approved', featured: false, description: 'A compact, premium layout for a sharper city life and a slower daily rhythm.', lat: 17.47, lng: 78.36, createdAt: '2023-11-20' },
  { id: 'project-6', slug: 'greenfield-valley', name: 'Greenfield Valley', developerId: 'dev-6', developerName: 'GreenField Developers', city: 'Pune', area: 'Hinjewadi', type: 'Villa plots', status: 'Under development', possession: 'Q3 2026', priceFrom: 4200000, plotCount: 95, availableCount: 95, acres: 12.5, approvalStatus: 'Pending Review', featured: false, description: 'Nature-centric plotted development close to IT corridor.', lat: 18.59, lng: 73.71, createdAt: '2024-02-02' },
];

export const initialEnquiries: EnquiryAdmin[] = [
  { id: 'enq-101', customerName: 'Arjun Mehta', customerEmail: 'arjun.m@gmail.com', customerPhone: '+91 98765 43210', projectId: 'project-1', projectName: 'Aanvi Heights', plotId: 'plot-1', plotNumber: 1, developerName: 'Sreeni Groups', message: 'Interested in North-facing 1,650 sqft plot in Phase 1.', date: '2026-09-06 14:30', status: 'New', assignedTo: 'Platform Support' },
  { id: 'enq-102', customerName: 'Sneha Reddy', customerEmail: 'sneha.reddy@yahoo.com', customerPhone: '+91 99887 76655', projectId: 'project-1', projectName: 'Aanvi Heights', plotId: 'plot-15', plotNumber: 15, developerName: 'Sreeni Groups', message: 'Requesting site visit schedule for this weekend.', date: '2026-09-05 11:15', status: 'Contacted', assignedTo: 'Rajesh (Sreeni)' },
  { id: 'enq-103', customerName: 'Rohan Verma', customerEmail: 'rohan.v@outlook.com', customerPhone: '+91 97112 23344', projectId: 'project-2', projectName: 'Meridian Grove', developerName: 'Verdant Habitat', message: 'Need information regarding RERA documentation and loan options.', date: '2026-09-04 16:45', status: 'Interested', assignedTo: 'Platform Advisor' },
  { id: 'enq-104', customerName: 'Kavita Chawla', customerEmail: 'kavita.c@gmail.com', customerPhone: '+91 98334 45566', projectId: 'project-3', projectName: 'The Foundry District', plotId: 'plot-5', plotNumber: 5, developerName: 'Arcstone Estates', message: 'Is price negotiable for immediate booking?', date: '2026-09-03 09:20', status: 'Follow-up', assignedTo: 'Vikram (Arcstone)' },
];

export const initialBookings: BookingAdmin[] = [
  { id: 'bk-501', bookingCode: 'LG-BK-2026-089', customerName: 'Vikrant Roy', customerPhone: '+91 98201 12233', customerEmail: 'vikrant.roy@gmail.com', developerName: 'Sreeni Groups', projectName: 'Aanvi Heights', plotId: 'plot-4', plotNumber: 4, amount: 7080000, bookingAmount: 500000, taxAmount: 90000, paymentStatus: 'Paid', bookingStatus: 'Confirmed', paymentMethod: 'UPI / Razorpay', transactionId: 'TXN-984920491', date: '2026-09-02 10:15' },
  { id: 'bk-502', bookingCode: 'LG-BK-2026-090', customerName: 'Nisha Gupta', customerPhone: '+91 98440 55667', customerEmail: 'nisha.g@gmail.com', developerName: 'Verdant Habitat', projectName: 'Meridian Grove', plotId: 'plot-12', plotNumber: 12, amount: 4500000, bookingAmount: 300000, taxAmount: 54000, paymentStatus: 'Paid', bookingStatus: 'Pending', paymentMethod: 'Netbanking', transactionId: 'TXN-491029412', date: '2026-09-04 15:40' },
  { id: 'bk-503', bookingCode: 'LG-BK-2026-091', customerName: 'Sameer Rao', customerPhone: '+91 99001 88776', customerEmail: 'sameer.rao@tech.com', developerName: 'Sreeni Groups', projectName: 'Aanvi Heights', plotId: 'plot-2', plotNumber: 2, amount: 5060000, bookingAmount: 350000, taxAmount: 63000, paymentStatus: 'Paid', bookingStatus: 'Confirmed', paymentMethod: 'Credit Card', transactionId: 'TXN-102938475', date: '2026-08-28 12:00' },
];

export const initialUsers: UserAdmin[] = [
  { id: 'usr-1', name: 'Arjun Mehta', email: 'arjun.m@gmail.com', phone: '+91 98765 43210', role: 'Customer', enquiriesCount: 3, bookingsCount: 0, savedPlotsCount: 4, status: 'Active', createdAt: '2025-10-12' },
  { id: 'usr-2', name: 'Rajesh Sreeni', email: 'contact@sreenigroups.com', phone: '+91 98490 12345', role: 'Developer', enquiriesCount: 0, bookingsCount: 0, savedPlotsCount: 0, status: 'Active', createdAt: '2023-01-15' },
  { id: 'usr-3', name: 'Vikrant Roy', email: 'vikrant.roy@gmail.com', phone: '+91 98201 12233', role: 'Customer', enquiriesCount: 1, bookingsCount: 1, savedPlotsCount: 2, status: 'Active', createdAt: '2026-02-20' },
  { id: 'usr-4', name: 'Admin User', email: 'admin@landgrid.com', phone: '+91 90000 00000', role: 'Admin', enquiriesCount: 0, bookingsCount: 0, savedPlotsCount: 0, status: 'Active', createdAt: '2022-01-01' },
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 'log-1', user: 'Admin User', action: 'Approved Project', entity: 'Aanvi Heights', date: '2026-09-06 18:20', ip: '182.74.20.12', details: 'Project documentation and RERA numbers verified.' },
  { id: 'log-2', user: 'Admin User', action: 'Updated Plot Status', entity: 'Plot 4 (Aanvi Heights)', date: '2026-09-05 16:10', ip: '182.74.20.12', details: 'Status changed from Temporary Hold -> Registration Completed.' },
  { id: 'log-3', user: 'Rajesh Sreeni', action: 'Developer Login', entity: 'Sreeni Groups', date: '2026-09-05 09:00', ip: '49.205.11.45', details: 'Logged into developer portal.' },
  { id: 'log-4', user: 'Admin User', action: 'Verified Developer', entity: 'Verdant Habitat', date: '2026-09-03 11:30', ip: '182.74.20.12', details: 'Company registration and GST verified.' },
];
