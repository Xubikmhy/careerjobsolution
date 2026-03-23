
CREATE TABLE public.candidate_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_requirements(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  status TEXT NOT NULL,
  placed_at TEXT,
  remarks TEXT,
  follow_up_date DATE,
  follow_up_done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.candidate_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view candidate_activities" ON public.candidate_activities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert candidate_activities" ON public.candidate_activities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update candidate_activities" ON public.candidate_activities FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete candidate_activities" ON public.candidate_activities FOR DELETE TO anon, authenticated USING (true);
