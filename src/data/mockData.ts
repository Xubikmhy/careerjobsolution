import { Candidate, JobReq, Property, Tenant, DashboardStats, Placement, RentalPlacement, Transaction } from '@/types';

// Mock Candidates with enhanced CV fields
export const mockCandidates: Candidate[] = [
  {
    id: '1',
    fullName: 'Ram Bahadur Gurung',
    phone: '+977-9841234567',
    address: 'Lakeside, Pokhara',
    skills: ['Cooking', 'Customer Service', 'English'],
    experienceYears: 3,
    educationLevel: 'SLC',
    expectedSalary: 18000,
    status: 'Active',
    references: 'Hotel Barahi - Mr. Sharma',
    createdAt: new Date('2024-01-15'),
    dateOfBirth: '1995-05-15',
    nationality: 'Nepali',
    maritalStatus: 'Married',
    languages: ['Nepali', 'English', 'Hindi'],
    careerObjective: 'Seeking a challenging position in the hospitality industry where I can utilize my culinary skills and customer service experience.',
    workHistory: [
      {
        company: 'Hotel Mountain View',
        position: 'Cook',
        duration: '2021 - Present',
        responsibilities: 'Prepared authentic Nepali and Continental cuisines for hotel guests.',
      },
    ],
    referenceContacts: [
      { name: 'Mr. Sharma', company: 'Hotel Barahi', phone: '+977-9841111111', relationship: 'Former Manager' },
    ],
  },
  {
    id: '2',
    fullName: 'Sita Tamang',
    phone: '+977-9856789012',
    address: 'Bagar, Pokhara',
    skills: ['Housekeeping', 'Laundry', 'Nepali Cooking'],
    experienceYears: 5,
    educationLevel: 'Class 8',
    expectedSalary: 15000,
    status: 'Active',
    createdAt: new Date('2024-02-01'),
    nationality: 'Nepali',
    languages: ['Nepali'],
  },
  {
    id: '3',
    fullName: 'Bishnu Poudel',
    phone: '+977-9867890123',
    address: 'Mahendrapul, Pokhara',
    skills: ['Driving', 'Mechanic', 'Delivery'],
    experienceYears: 7,
    educationLevel: '+2',
    expectedSalary: 25000,
    status: 'Placed',
    createdAt: new Date('2024-01-20'),
    nationality: 'Nepali',
    languages: ['Nepali', 'English'],
  },
  {
    id: '4',
    fullName: 'Maya Shrestha',
    phone: '+977-9845678901',
    address: 'New Road, Pokhara',
    skills: ['Receptionist', 'Computer', 'English', 'Hindi'],
    experienceYears: 2,
    educationLevel: 'Bachelor',
    expectedSalary: 22000,
    status: 'Active',
    createdAt: new Date('2024-02-10'),
    nationality: 'Nepali',
    languages: ['Nepali', 'English', 'Hindi'],
  },
];

// Mock Job Requirements (employer info embedded)
export const mockJobReqs: JobReq[] = [
  {
    id: '1',
    employerInfo: {
      companyName: 'Hotel Barahi',
      contactPerson: 'Mr. Sharma',
      phone: '+977-61-460617',
      location: 'Lakeside, Pokhara',
    },
    roleTitle: 'Kitchen Helper',
    requiredSkills: ['Cooking', 'Cleaning'],
    salaryMin: 15000,
    salaryMax: 20000,
    timing: 'Day',
    location: 'Lakeside',
    status: 'Open',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '2',
    employerInfo: {
      companyName: 'Busy Bee Cafe',
      contactPerson: 'Ms. Rai',
      phone: '+977-9801234567',
      location: 'Lakeside, Pokhara',
    },
    roleTitle: 'Waiter/Waitress',
    requiredSkills: ['Customer Service', 'English'],
    salaryMin: 12000,
    salaryMax: 18000,
    timing: 'Flexible',
    location: 'Lakeside',
    status: 'Open',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    employerInfo: {
      companyName: 'Pokhara Transport',
      contactPerson: 'Mr. Thapa',
      phone: '+977-9812345678',
      location: 'Prithvi Chowk, Pokhara',
    },
    roleTitle: 'Driver',
    requiredSkills: ['Driving'],
    salaryMin: 20000,
    salaryMax: 28000,
    timing: 'Morning',
    location: 'Prithvi Chowk',
    status: 'Open',
    createdAt: new Date('2024-02-25'),
  },
];

// Mock Properties (landlord info embedded)
export const mockProperties: Property[] = [
  {
    id: '1',
    landlordInfo: {
      fullName: 'Hari Prasad Sharma',
      phone: '+977-9841111111',
      address: 'New Road, Pokhara',
    },
    type: 'Flat',
    location: 'New Road, Pokhara',
    rentAmount: 12000,
    facilities: ['Water', 'Wifi', 'Parking'],
    photos: [],
    status: 'Vacant',
    description: '2BHK flat with balcony, good sunlight',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '2',
    landlordInfo: {
      fullName: 'Hari Prasad Sharma',
      phone: '+977-9841111111',
      address: 'New Road, Pokhara',
    },
    type: 'Room',
    location: 'New Road, Pokhara',
    rentAmount: 5000,
    facilities: ['Water', 'Electricity'],
    photos: [],
    status: 'Vacant',
    description: 'Single room, attached bathroom',
    createdAt: new Date('2024-02-05'),
  },
  {
    id: '3',
    landlordInfo: {
      fullName: 'Kamala Devi Thapa',
      phone: '+977-9852222222',
      address: 'Mahendrapul, Pokhara',
    },
    type: 'Shutter',
    location: 'Mahendrapul, Pokhara',
    rentAmount: 15000,
    facilities: ['Electricity', 'Water'],
    photos: [],
    status: 'Vacant',
    description: 'Ground floor shutter, good for retail',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '4',
    landlordInfo: {
      fullName: 'Kamala Devi Thapa',
      phone: '+977-9852222222',
      address: 'Mahendrapul, Pokhara',
    },
    type: 'Flat',
    location: 'Mahendrapul, Pokhara',
    rentAmount: 18000,
    facilities: ['Water', 'Wifi', 'Parking', 'Garden'],
    photos: [],
    status: 'Occupied',
    description: '3BHK flat with garden view',
    createdAt: new Date('2024-02-12'),
  },
];

// Mock Tenants
export const mockTenants: Tenant[] = [
  {
    id: '1',
    fullName: 'Raju Adhikari',
    phone: '+977-9867778899',
    preferredLocation: 'New Road',
    budgetMax: 15000,
    typeNeeded: 'Flat',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '2',
    fullName: 'Sunita Karki',
    phone: '+977-9845556677',
    preferredLocation: 'Lakeside',
    budgetMax: 8000,
    typeNeeded: 'Room',
    createdAt: new Date('2024-02-22'),
  },
];

// Mock Placements
export const mockPlacements: Placement[] = [
  {
    id: '1',
    candidateId: '3',
    candidateName: 'Bishnu Poudel',
    jobId: '3',
    jobTitle: 'Driver',
    employerName: 'Pokhara Transport',
    placedDate: new Date('2024-02-28'),
    agreedSalary: 25000,
    commissionAmount: 7500, // 30% of 25000
    commissionPaid: true,
    notes: 'Successfully placed. Employee started on March 1st.',
  },
];

// Mock Rental Placements
export const mockRentalPlacements: RentalPlacement[] = [
  {
    id: '1',
    tenantId: '1',
    tenantName: 'Raju Adhikari',
    propertyId: '4',
    propertyType: 'Flat',
    landlordName: 'Kamala Devi Thapa',
    rentStartDate: new Date('2024-02-25'),
    monthlyRent: 18000,
    commissionAmount: 9000, // Flexible - one half month
    commissionPaid: true,
    notes: 'Tenant moved in successfully.',
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'form_fee',
    description: 'Registration Form Fee',
    amount: 200,
    relatedId: '1',
    relatedName: 'Ram Bahadur Gurung',
    date: new Date('2024-01-15'),
  },
  {
    id: '2',
    type: 'form_fee',
    description: 'Registration Form Fee',
    amount: 200,
    relatedId: '2',
    relatedName: 'Sita Tamang',
    date: new Date('2024-02-01'),
  },
  {
    id: '3',
    type: 'cv_fee',
    description: 'CV Generation Fee',
    amount: 150,
    relatedId: '1',
    relatedName: 'Ram Bahadur Gurung',
    date: new Date('2024-01-16'),
  },
  {
    id: '4',
    type: 'job_commission',
    description: 'Placement Commission (30%)',
    amount: 7500,
    relatedId: '1',
    relatedName: 'Bishnu Poudel - Driver at Pokhara Transport',
    date: new Date('2024-02-28'),
  },
  {
    id: '5',
    type: 'rental_commission',
    description: 'Rental Commission',
    amount: 9000,
    relatedId: '1',
    relatedName: 'Raju Adhikari - Flat at Mahendrapul',
    date: new Date('2024-02-25'),
  },
  {
    id: '6',
    type: 'form_fee',
    description: 'Registration Form Fee',
    amount: 200,
    relatedId: '3',
    relatedName: 'Bishnu Poudel',
    date: new Date('2024-01-20'),
  },
  {
    id: '7',
    type: 'form_fee',
    description: 'Registration Form Fee',
    amount: 200,
    relatedId: '4',
    relatedName: 'Maya Shrestha',
    date: new Date('2024-02-10'),
  },
];

// Dashboard Stats
export const getDashboardStats = (): DashboardStats => {
  const totalRevenue = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthRevenue = mockTransactions
    .filter((t) => t.date >= thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingJobCommissions = mockPlacements
    .filter((p) => !p.commissionPaid)
    .reduce((sum, p) => sum + p.commissionAmount, 0);
  const pendingRentalCommissions = mockRentalPlacements
    .filter((r) => !r.commissionPaid)
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  return {
    activeJobSeekers: mockCandidates.filter((c) => c.status === 'Active').length,
    openJobPositions: mockJobReqs.filter((j) => j.status === 'Open').length,
    vacantProperties: mockProperties.filter((p) => p.status === 'Vacant').length,
    placedCandidates: mockPlacements.length,
    successfulRentals: mockRentalPlacements.length,
    totalRevenue,
    thisMonthRevenue,
    pendingCommissions: pendingJobCommissions + pendingRentalCommissions,
  };
};
