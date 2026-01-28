# Cursor AI Prompt - Job & Rental Agency Management System

## Quick Start Prompt

```
Build a Job & Rental Agency Management System using React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

## Core Modules

1. **Dashboard** - Stats cards showing: active job seekers, open positions, vacant properties, placements, revenue, pending commissions

2. **Candidates** - CRUD for job seekers with fields: fullName, phone, address, skills[], experienceYears, educationLevel, expectedSalary, status (Active/Placed), dateOfBirth, nationality, languages[], workHistory[], careerObjective, references[]

3. **Jobs** - Job requisitions with embedded employer info: companyName, contactPerson, phone, location, roleTitle, requiredSkills[], salaryMin/Max, timing (Morning/Day/Night/Flexible), status (Open/Closed)

4. **Properties** - Rentals with embedded landlord info: fullName, phone, address, type (Room/Flat/Shutter), location, rentAmount, facilities[], photos[], status (Vacant/Occupied)

5. **Tenants** - People seeking rentals: fullName, phone, preferredLocation, budgetMax, typeNeeded

6. **Placements** - Job placement records linking candidate to job, tracking agreedSalary, commissionAmount (30% of first month), commissionPaid status

7. **Accounting** - Transaction log for: form_fee (NPR 200), cv_fee (NPR 150), job_commission, rental_commission

## Business Logic

- Form Fee: NPR 200 per registration
- CV Preparation Fee: NPR 150
- Job Placement Commission: 30% of first month salary
- Rental Commission: Flexible amount

## Key Features

- PDF CV generation with agency watermark using jsPDF
- Skill tags with color coding
- Status badges (Active=green, Placed=blue, Open=green, Closed=gray, Vacant=green, Occupied=blue)
- Search and filter functionality
- Responsive sidebar navigation
- Agency logo/settings stored in localStorage

## Design System

Use semantic tokens: --background, --foreground, --primary, --secondary, --muted, --accent, --destructive
Dark sidebar with light content area. Professional blue/slate color scheme.

## File Structure

src/
├── components/ (reusable UI)
├── pages/ (Dashboard, Candidates, Jobs, Properties, Tenants, Placements, Accounting, Settings)
├── types/index.ts (all TypeScript interfaces)
├── data/mockData.ts (sample data)
├── utils/pdfGenerator.ts (CV PDF logic)
└── utils/agencySettings.ts (localStorage helpers)
```

---

## Database Schema (Supabase/PostgreSQL)

```sql
-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  education_level TEXT,
  expected_salary NUMERIC DEFAULT 0,
  cv_url TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Placed')),
  date_of_birth DATE,
  nationality TEXT,
  marital_status TEXT,
  languages TEXT[] DEFAULT '{}',
  career_objective TEXT,
  references TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Work Experience (linked to candidates)
CREATE TABLE work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  duration TEXT,
  responsibilities TEXT
);

-- Job Requirements
CREATE TABLE job_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  employer_phone TEXT,
  employer_location TEXT,
  role_title TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  salary_min NUMERIC DEFAULT 0,
  salary_max NUMERIC DEFAULT 0,
  timing TEXT DEFAULT 'Day' CHECK (timing IN ('Morning', 'Day', 'Night', 'Flexible')),
  location TEXT,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_name TEXT NOT NULL,
  landlord_phone TEXT,
  landlord_address TEXT,
  type TEXT NOT NULL CHECK (type IN ('Room', 'Flat', 'Shutter')),
  location TEXT,
  rent_amount NUMERIC DEFAULT 0,
  facilities TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_location TEXT,
  budget_max NUMERIC DEFAULT 0,
  type_needed TEXT DEFAULT 'Any' CHECK (type_needed IN ('Room', 'Flat', 'Shutter', 'Any')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Placements
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES job_requirements(id),
  candidate_name TEXT,
  job_title TEXT,
  employer_name TEXT,
  placed_date DATE DEFAULT CURRENT_DATE,
  agreed_salary NUMERIC DEFAULT 0,
  commission_amount NUMERIC DEFAULT 0,
  commission_paid BOOLEAN DEFAULT false,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('form_fee', 'cv_fee', 'job_commission', 'rental_commission')),
  description TEXT,
  amount NUMERIC NOT NULL,
  related_id UUID,
  related_name TEXT,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "jspdf": "^3.0.4",
  "lucide-react": "^0.462.0",
  "date-fns": "^3.6.0",
  "react-hook-form": "^7.61.1",
  "zod": "^3.25.76",
  "@hookform/resolvers": "^3.10.0"
}
```

Add shadcn/ui: `npx shadcn@latest init` then add components: button, card, dialog, input, select, table, tabs, badge, form, toast

---

## One-Liner for Cursor

```
Create a Nepal-based job placement and rental agency management system with React/TypeScript/Tailwind. Modules: Dashboard (stats), Candidates (job seekers with PDF CV generation), Jobs (employer requisitions), Properties (rental listings), Tenants (renters), Placements (job matches with 30% commission tracking), Accounting (form fees NPR 200, CV fees NPR 150, commissions). Use shadcn/ui, react-router-dom, jsPDF. Dark sidebar, light content. Store settings in localStorage initially.
```
