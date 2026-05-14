CREATE TABLE public.edit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  entity_label text,
  field text NOT NULL,
  old_value text,
  new_value text,
  changed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_edit_history_entity ON public.edit_history(entity_type, entity_id, created_at DESC);
ALTER TABLE public.edit_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view edit_history" ON public.edit_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert edit_history" ON public.edit_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can delete edit_history" ON public.edit_history FOR DELETE TO anon, authenticated USING (true);