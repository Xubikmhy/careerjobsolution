
-- Drop existing authenticated-only policies and replace with anon+authenticated access

-- candidates
DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can delete candidates" ON public.candidates;
CREATE POLICY "Anyone can view candidates" ON public.candidates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert candidates" ON public.candidates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update candidates" ON public.candidates FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete candidates" ON public.candidates FOR DELETE TO anon, authenticated USING (true);

-- job_requirements
DROP POLICY IF EXISTS "Authenticated users can view job_requirements" ON public.job_requirements;
DROP POLICY IF EXISTS "Authenticated users can insert job_requirements" ON public.job_requirements;
DROP POLICY IF EXISTS "Authenticated users can update job_requirements" ON public.job_requirements;
DROP POLICY IF EXISTS "Authenticated users can delete job_requirements" ON public.job_requirements;
CREATE POLICY "Anyone can view job_requirements" ON public.job_requirements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert job_requirements" ON public.job_requirements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update job_requirements" ON public.job_requirements FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete job_requirements" ON public.job_requirements FOR DELETE TO anon, authenticated USING (true);

-- properties
DROP POLICY IF EXISTS "Authenticated users can view properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON public.properties;
CREATE POLICY "Anyone can view properties" ON public.properties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert properties" ON public.properties FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update properties" ON public.properties FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete properties" ON public.properties FOR DELETE TO anon, authenticated USING (true);

-- tenants
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can update tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can delete tenants" ON public.tenants;
CREATE POLICY "Anyone can view tenants" ON public.tenants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert tenants" ON public.tenants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update tenants" ON public.tenants FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete tenants" ON public.tenants FOR DELETE TO anon, authenticated USING (true);

-- placements
DROP POLICY IF EXISTS "Authenticated users can view placements" ON public.placements;
DROP POLICY IF EXISTS "Authenticated users can insert placements" ON public.placements;
DROP POLICY IF EXISTS "Authenticated users can update placements" ON public.placements;
DROP POLICY IF EXISTS "Authenticated users can delete placements" ON public.placements;
CREATE POLICY "Anyone can view placements" ON public.placements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert placements" ON public.placements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update placements" ON public.placements FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete placements" ON public.placements FOR DELETE TO anon, authenticated USING (true);

-- transactions
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON public.transactions;
CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete transactions" ON public.transactions FOR DELETE TO anon, authenticated USING (true);

-- work_experiences
DROP POLICY IF EXISTS "Authenticated users can view work_experiences" ON public.work_experiences;
DROP POLICY IF EXISTS "Authenticated users can insert work_experiences" ON public.work_experiences;
DROP POLICY IF EXISTS "Authenticated users can update work_experiences" ON public.work_experiences;
DROP POLICY IF EXISTS "Authenticated users can delete work_experiences" ON public.work_experiences;
CREATE POLICY "Anyone can view work_experiences" ON public.work_experiences FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert work_experiences" ON public.work_experiences FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update work_experiences" ON public.work_experiences FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete work_experiences" ON public.work_experiences FOR DELETE TO anon, authenticated USING (true);

-- agency_settings
DROP POLICY IF EXISTS "Authenticated users can view agency_settings" ON public.agency_settings;
DROP POLICY IF EXISTS "Authenticated users can update agency_settings" ON public.agency_settings;
CREATE POLICY "Anyone can view agency_settings" ON public.agency_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update agency_settings" ON public.agency_settings FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert agency_settings" ON public.agency_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
