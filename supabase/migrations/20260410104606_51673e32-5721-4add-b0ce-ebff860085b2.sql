
CREATE TABLE public.visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text,
  skills text[] DEFAULT '{}'::text[],
  preferred_work_location text,
  remarks text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visitors" ON public.visitors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert visitors" ON public.visitors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update visitors" ON public.visitors FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete visitors" ON public.visitors FOR DELETE TO anon, authenticated USING (true);
