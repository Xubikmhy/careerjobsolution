-- Create Candidates table
CREATE TABLE public.candidates (
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
  reference_info TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Work Experiences table (linked to candidates)
CREATE TABLE public.work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  duration TEXT,
  responsibilities TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Job Requirements table
CREATE TABLE public.job_requirements (
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
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Properties table
CREATE TABLE public.properties (
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
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_location TEXT,
  budget_max NUMERIC DEFAULT 0,
  type_needed TEXT DEFAULT 'Any' CHECK (type_needed IN ('Room', 'Flat', 'Shutter', 'Any')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Placements table
CREATE TABLE public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.job_requirements(id) ON DELETE SET NULL,
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

-- Create Transactions table
CREATE TABLE public.transactions (
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

-- Create Profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Agency Settings table
CREATE TABLE public.agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name TEXT DEFAULT 'Career Job Solution',
  logo_url TEXT,
  phone TEXT,
  address TEXT,
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default agency settings
INSERT INTO public.agency_settings (agency_name, phone, address, email)
VALUES ('Career Job Solution', '+977-61-XXXXXX', 'Pokhara, Nepal', 'info@careerjobsolution.com');

-- Enable RLS on all tables
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users (agency staff)
-- Candidates
CREATE POLICY "Authenticated users can view candidates" ON public.candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert candidates" ON public.candidates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update candidates" ON public.candidates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete candidates" ON public.candidates FOR DELETE TO authenticated USING (true);

-- Work Experiences
CREATE POLICY "Authenticated users can view work_experiences" ON public.work_experiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert work_experiences" ON public.work_experiences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update work_experiences" ON public.work_experiences FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete work_experiences" ON public.work_experiences FOR DELETE TO authenticated USING (true);

-- Job Requirements
CREATE POLICY "Authenticated users can view job_requirements" ON public.job_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert job_requirements" ON public.job_requirements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update job_requirements" ON public.job_requirements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete job_requirements" ON public.job_requirements FOR DELETE TO authenticated USING (true);

-- Properties
CREATE POLICY "Authenticated users can view properties" ON public.properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update properties" ON public.properties FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete properties" ON public.properties FOR DELETE TO authenticated USING (true);

-- Tenants
CREATE POLICY "Authenticated users can view tenants" ON public.tenants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tenants" ON public.tenants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tenants" ON public.tenants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tenants" ON public.tenants FOR DELETE TO authenticated USING (true);

-- Placements
CREATE POLICY "Authenticated users can view placements" ON public.placements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert placements" ON public.placements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update placements" ON public.placements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete placements" ON public.placements FOR DELETE TO authenticated USING (true);

-- Transactions
CREATE POLICY "Authenticated users can view transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete transactions" ON public.transactions FOR DELETE TO authenticated USING (true);

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Agency Settings (readable by all authenticated, editable by all authenticated for now)
CREATE POLICY "Authenticated users can view agency_settings" ON public.agency_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update agency_settings" ON public.agency_settings FOR UPDATE TO authenticated USING (true);

-- Create trigger for profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for agency settings timestamp updates
CREATE TRIGGER update_agency_settings_updated_at
  BEFORE UPDATE ON public.agency_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();