# 🚀 Complete Replication Guide: Career Job Solution

## Quick Start for AI Coding Tools

Copy this entire document or the "Master Prompt" section into Cursor, Windsurf, Bolt.new, or any AI coding tool.

---

# MASTER PROMPT

```
Build a complete internal admin dashboard for "Career Job Solution" - a dual-service agency in Pokhara, Nepal managing both Recruitment (Job Agency) and Real Estate (Rentals).

## TECH STACK
- React 18 + TypeScript + Vite
- Tailwind CSS with custom design system (HSL color tokens)
- shadcn/ui components (Radix primitives)
- React Router DOM for routing
- React Hook Form + Zod for form validation
- jsPDF for client-side PDF CV generation
- Lucide React for icons
- date-fns for date formatting

## PROJECT STRUCTURE
```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── AppSidebar.tsx         # Main navigation
│   ├── DashboardLayout.tsx    # Page wrapper
│   ├── CandidateFormModal.tsx # Multi-tab candidate form
│   ├── PageHeader.tsx         # Page titles with actions
│   ├── SearchFilterBar.tsx    # Search + filter controls
│   ├── StatCard.tsx           # Dashboard stat cards
│   ├── StatusBadge.tsx        # Status indicators
│   └── SkillTag.tsx           # Skill chips
├── pages/
│   ├── Dashboard.tsx          # Analytics overview
│   ├── Candidates.tsx         # Candidate management + CV
│   ├── Jobs.tsx               # Job postings
│   ├── Properties.tsx         # Property listings
│   ├── Tenants.tsx            # Tenant management
│   ├── Placements.tsx         # Track hires/rentals
│   ├── Accounting.tsx         # Revenue tracking
│   └── Settings.tsx           # Agency branding
├── types/index.ts             # All TypeScript interfaces
├── data/mockData.ts           # Mock data (replace with DB)
├── utils/
│   ├── pdfGenerator.ts        # CV generation logic
│   └── agencySettings.ts      # Logo/settings storage
└── lib/utils.ts               # Tailwind merge utility
```

## CORE FEATURES

### 1. RECRUITMENT MODULE
- **Candidates**: Full CRUD with comprehensive profiles
  - Personal info: name, phone, address, DOB, nationality, marital status
  - Professional: skills, experience years, education level, expected salary
  - CV data: career objective, work history (company, position, duration, responsibilities)
  - References: name, company, phone, relationship
- **Job Openings**: Employer info embedded directly (no separate employer table)
  - Employer: company name, contact person, phone, location
  - Job: role title, required skills, salary range, timing (Morning/Day/Night/Flexible), status
- **CV Generation**: Professional PDF with:
  - Agency logo watermark (centered, 8% opacity)
  - Sections: header, career objective, professional summary, work experience, education, skills (3-column), expected salary, references, declaration
  - Footer: agency name, generation date

### 2. REAL ESTATE MODULE
- **Properties**: Landlord info embedded directly
  - Landlord: full name, phone, address
  - Property: type (Room/Flat/Shutter), location, rent amount, facilities, photos (max 3), status, description
- **Tenants**: name, phone, preferred location, max budget, type needed

### 3. OPERATIONS MODULE
- **Placements**: Track successful job placements
  - Links candidate to job, records agreed salary
  - Auto-calculates 30% commission of first month salary
  - Commission paid status, follow-up dates, notes
- **Rental Placements**: Track property rentals
  - Links tenant to property
  - Flexible commission amount (manually entered)
  - Commission paid status, follow-up dates

### 4. ACCOUNTING MODULE
Track all revenue streams:
- **Form Fee**: NPR 200 per candidate registration
- **CV Fee**: NPR 150 per CV generation
- **Job Commission**: 30% of first month salary (calculated)
- **Rental Commission**: Flexible amount (manual entry)

Transaction fields: type, description, amount, related entity, date, notes

### 5. DASHBOARD
Display key metrics:
- Active Job Seekers, Open Positions, Vacant Properties, Total Revenue
- Job Placements count, Rentals Closed count, Pending Commissions, Placement Rate
- Recent Candidates list, Open Positions list, Vacant Properties list
- Recent Placements with commission status
- Recent Transactions

### 6. SETTINGS
- Agency name configuration
- Logo upload (displays in sidebar + CV watermark)
- Contact details

## DESIGN SYSTEM

### Color Tokens (HSL format in index.css)
```css
:root {
  --background: 210 20% 98%;
  --foreground: 222 47% 11%;
  --primary: 217 91% 60%;       /* Blue */
  --primary-foreground: 0 0% 100%;
  --success: 142 76% 36%;        /* Green */
  --warning: 38 92% 50%;         /* Orange */
  --destructive: 0 84% 60%;      /* Red */
  --sidebar-background: 222 47% 11%;  /* Dark */
}
```

### Typography
- Font: DM Sans (Google Fonts)
- Use semantic sizing: text-sm, text-base, text-lg, text-xl, text-2xl

### Components
- Cards with subtle borders and shadows
- Rounded corners (--radius: 0.625rem)
- Status badges: success (green), warning (orange), default (gray)
- Skill tags: outlined chips

## TYPE DEFINITIONS

```typescript
interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  responsibilities: string;
}

interface Candidate {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  expectedSalary: number;
  status: 'Active' | 'Placed';
  references?: string;
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

interface EmployerInfo {
  companyName: string;
  contactPerson: string;
  phone: string;
  location: string;
}

interface JobReq {
  id: string;
  employerInfo: EmployerInfo;
  roleTitle: string;
  requiredSkills: string[];
  salaryMin: number;
  salaryMax: number;
  timing: 'Morning' | 'Day' | 'Night' | 'Flexible';
  location: string;
  status: 'Open' | 'Closed';
  createdAt: Date;
}

interface LandlordInfo {
  fullName: string;
  phone: string;
  address: string;
}

interface Property {
  id: string;
  landlordInfo: LandlordInfo;
  type: 'Room' | 'Flat' | 'Shutter';
  location: string;
  rentAmount: number;
  facilities: string[];
  photos: string[];
  status: 'Vacant' | 'Occupied';
  description?: string;
  createdAt: Date;
}

interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  preferredLocation: string;
  budgetMax: number;
  typeNeeded: 'Room' | 'Flat' | 'Shutter' | 'Any';
  createdAt: Date;
}

interface Placement {
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

interface RentalPlacement {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyType: string;
  landlordName: string;
  rentStartDate: Date;
  monthlyRent: number;
  commissionAmount: number; // Flexible
  commissionPaid: boolean;
  followUpDate?: Date;
  notes?: string;
}

type TransactionType = 'form_fee' | 'cv_fee' | 'job_commission' | 'rental_commission';

interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  relatedId?: string;
  relatedName?: string;
  date: Date;
  notes?: string;
}

const FEES = {
  FORM_FEE: 200,
  CV_FEE: 150,
  JOB_COMMISSION_PERCENT: 30,
} as const;
```

## SIDEBAR NAVIGATION

Categories:
- **RECRUITMENT**: Dashboard, Candidates, Job Openings
- **REAL ESTATE**: Properties, Tenants
- **OPERATIONS**: Placements, Accounting
- **SYSTEM**: Settings

## BUSINESS LOGIC

### Commission Calculation
```typescript
// Job placement: 30% of agreed first month salary
const commissionAmount = agreedSalary * 0.30;

// Rental: flexible (entered manually per deal)
```

### Status Flows
- Candidate: Active → Placed (when matched to job)
- Job: Open → Closed (when filled or cancelled)
- Property: Vacant → Occupied (when rented)

### CV PDF Generation Logic
1. Load agency settings (logo, name)
2. Add centered watermark (logo at 8% opacity)
3. Build sections: header, contact, personal details, career objective, professional summary, work experience, education, skills (3-column layout), expected salary, references, declaration
4. Add footer with agency name and date
5. Download as `CV_[Name].pdf`

## ROUTING

```typescript
const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/candidates', element: <Candidates /> },
  { path: '/jobs', element: <Jobs /> },
  { path: '/properties', element: <Properties /> },
  { path: '/tenants', element: <Tenants /> },
  { path: '/placements', element: <Placements /> },
  { path: '/accounting', element: <Accounting /> },
  { path: '/settings', element: <Settings /> },
];
```

## CURRENCY
All amounts in NPR (Nepali Rupees). Format with toLocaleString().

## RESPONSIVE DESIGN
- Mobile-first approach
- Sidebar: collapsible on mobile (hamburger menu)
- Tables: horizontal scroll on mobile, hide non-essential columns
- Cards: stack vertically on mobile

Now build this complete application step by step.
```

---

# DATABASE SCHEMA (For Backend)

When migrating to a real database (Supabase, PostgreSQL, etc.):

```sql
-- CANDIDATES
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  skills TEXT[],
  experience_years INTEGER DEFAULT 0,
  education_level VARCHAR(100),
  expected_salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Placed')),
  references_text TEXT,
  date_of_birth DATE,
  nationality VARCHAR(100) DEFAULT 'Nepali',
  marital_status VARCHAR(50),
  career_objective TEXT,
  languages TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- WORK EXPERIENCES
CREATE TABLE work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  duration VARCHAR(100),
  responsibilities TEXT
);

-- REFERENCE CONTACTS
CREATE TABLE reference_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  relationship VARCHAR(100)
);

-- JOB REQUIREMENTS (employer embedded)
CREATE TABLE job_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_company_name VARCHAR(255) NOT NULL,
  employer_contact_person VARCHAR(255),
  employer_phone VARCHAR(50),
  employer_location TEXT,
  role_title VARCHAR(255) NOT NULL,
  required_skills TEXT[],
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  timing VARCHAR(50) CHECK (timing IN ('Morning', 'Day', 'Night', 'Flexible')),
  location TEXT,
  status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROPERTIES (landlord embedded)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_full_name VARCHAR(255) NOT NULL,
  landlord_phone VARCHAR(50),
  landlord_address TEXT,
  type VARCHAR(50) CHECK (type IN ('Room', 'Flat', 'Shutter')),
  location TEXT,
  rent_amount DECIMAL(10,2),
  facilities TEXT[],
  photos TEXT[],  -- URLs to stored images
  status VARCHAR(20) DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TENANTS
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  preferred_location TEXT,
  budget_max DECIMAL(10,2),
  type_needed VARCHAR(50) CHECK (type_needed IN ('Room', 'Flat', 'Shutter', 'Any')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- JOB PLACEMENTS
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES job_requirements(id),
  candidate_name VARCHAR(255),
  job_title VARCHAR(255),
  employer_name VARCHAR(255),
  placed_date DATE,
  agreed_salary DECIMAL(10,2),
  commission_amount DECIMAL(10,2),  -- Auto: 30% of salary
  commission_paid BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  notes TEXT
);

-- RENTAL PLACEMENTS
CREATE TABLE rental_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  property_id UUID REFERENCES properties(id),
  tenant_name VARCHAR(255),
  property_type VARCHAR(50),
  landlord_name VARCHAR(255),
  rent_start_date DATE,
  monthly_rent DECIMAL(10,2),
  commission_amount DECIMAL(10,2),  -- Flexible amount
  commission_paid BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  notes TEXT
);

-- TRANSACTIONS (Accounting)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) CHECK (type IN ('form_fee', 'cv_fee', 'job_commission', 'rental_commission')),
  description TEXT,
  amount DECIMAL(10,2),
  related_id UUID,
  related_name VARCHAR(255),
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT
);

-- AGENCY SETTINGS
CREATE TABLE agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name VARCHAR(255) DEFAULT 'Career Job Solution',
  logo_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: USER ROLES for authentication
CREATE TYPE app_role AS ENUM ('admin', 'staff');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security function for role checking
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

---

# DEPLOYMENT OPTIONS

## Option 1: Vercel (Frontend Only)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

## Option 2: Netlify
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `dist`

## Option 3: Railway (Full-Stack)
- Deploy frontend + Supabase/PostgreSQL

## Option 4: DigitalOcean App Platform
- Docker or Node.js buildpack

---

# BACKEND OPTIONS

## Supabase (Recommended)
```bash
npm install @supabase/supabase-js
```
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)
```

## Firebase
```bash
npm install firebase
```

## Custom Express Backend
```
backend/
├── routes/
│   ├── candidates.js
│   ├── jobs.js
│   ├── properties.js
│   └── transactions.js
├── models/
└── server.js
```

---

# FILE STORAGE

For property photos and agency logo:
- **Supabase Storage**: Create buckets for `property-photos` and `agency-assets`
- **Cloudinary**: For image optimization
- **AWS S3**: For enterprise scale

Replace base64 localStorage with proper file storage URLs.

---

# AUTHENTICATION

Simple admin login (internal use only):

```typescript
// Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@careerjob.com',
  password: 'secure-password'
})
```

For role-based access, use the `user_roles` table with RLS policies.

---

# EXPORTING FROM LOVABLE

1. Go to Settings → GitHub → Connect
2. Authorize Lovable GitHub App
3. Create Repository
4. Clone locally: `git clone <repo-url>`
5. Install: `npm install`
6. Run: `npm run dev`

---

# USING WITH OTHER AI TOOLS

| Tool | Steps |
|------|-------|
| **Cursor** | Open cloned folder, paste master prompt |
| **Windsurf** | Import from GitHub, iterate |
| **Bolt.new** | Paste master prompt, generate |
| **Copilot** | Use in VS Code with repo |
| **Codeium** | IDE integration with repo |

---

# DEPENDENCIES

```json
{
  "dependencies": {
    "@fontsource/dm-sans": "^5.2.8",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-tooltip": "^1.2.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "jspdf": "^3.0.4",
    "lucide-react": "^0.462.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-router-dom": "^6.30.1",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.25.76"
  }
}
```

---

Created by Career Job Solution, Pokhara, Nepal
