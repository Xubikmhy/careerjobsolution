// Type definitions for the Job & Rental Management System

// Recruitment Module Types
export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  responsibilities: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  expectedSalary: number;
  cvUrl?: string;
  status: 'Active' | 'Placed' | 'Sent for Interview';
  references?: string;
  remarks?: string;
  createdAt: Date;
  // Enhanced CV fields
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  languages?: string[];
  workHistory?: WorkExperience[];
  careerObjective?: string;
  referenceContacts?: {
    name: string;
    company: string;
    phone: string;
    relationship: string;
  }[];
}

// Employer info is now embedded in JobReq
export interface EmployerInfo {
  companyName: string;
  contactPerson: string;
  phone: string;
  location: string;
}

export interface JobReq {
  id: string;
  employerInfo: EmployerInfo;
  roleTitle: string;
  requiredSkills: string[];
  salaryMin: number;
  salaryMax: number;
  timing: 'Morning' | 'Day' | 'Night' | 'Flexible';
  location: string;
  status: 'Open' | 'Closed';
  remarks?: string;
  createdAt: Date;
}

// Landlord info is now embedded in Property
export interface LandlordInfo {
  fullName: string;
  phone: string;
  address: string;
}

export interface Property {
  id: string;
  landlordInfo: LandlordInfo;
  type: 'Room' | 'Flat' | 'Shutter';
  location: string;
  rentAmount: number;
  facilities: string[];
  photos: string[];
  status: 'Vacant' | 'Occupied';
  description?: string;
  remarks?: string;
  createdAt: Date;
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  preferredLocation: string;
  budgetMax: number;
  typeNeeded: 'Room' | 'Flat' | 'Shutter' | 'Any';
  remarks?: string;
  createdAt: Date;
}

// Placement & Rental Records
export interface Placement {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  placedDate: Date;
  agreedSalary: number;
  commissionAmount: number; // 30% of first month
  commissionPaid: boolean;
  followUpDate?: Date;
  notes?: string;
}

export interface RentalPlacement {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyType: string;
  landlordName: string;
  rentStartDate: Date;
  monthlyRent: number;
  commissionAmount: number; // Flexible amount
  commissionPaid: boolean;
  followUpDate?: Date;
  notes?: string;
}

// Accounting Types
export type TransactionType = 'form_fee' | 'cv_fee' | 'job_commission' | 'rental_commission';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  relatedId?: string; // candidateId, placementId, etc.
  relatedName?: string;
  date: Date;
  notes?: string;
}

// Fee Constants
export const FEES = {
  FORM_FEE: 200,
  CV_FEE: 150,
  JOB_COMMISSION_PERCENT: 30,
} as const;

// Dashboard Stats
export interface DashboardStats {
  activeJobSeekers: number;
  openJobPositions: number;
  vacantProperties: number;
  placedCandidates: number;
  successfulRentals: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingCommissions: number;
}
