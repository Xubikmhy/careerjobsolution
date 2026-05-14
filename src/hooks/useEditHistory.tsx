import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type EntityType = 'candidate' | 'job' | 'visitor' | 'placement';

export interface EditHistoryEntry {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  entity_label: string | null;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  created_at: string;
}

const norm = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const SKIP = new Set(['id', 'created_at', 'updated_at']);

/** Compare an updates patch to the previous record and write history rows. */
export async function logEdits(args: {
  entity_type: EntityType;
  entity_id: string;
  entity_label?: string | null;
  before: Record<string, any> | null | undefined;
  after: Record<string, any>;
}): Promise<void> {
  const { entity_type, entity_id, entity_label, before, after } = args;
  if (!before) return;
  const rows: Array<Omit<EditHistoryEntry, 'id' | 'created_at'>> = [];
  for (const [field, newVal] of Object.entries(after)) {
    if (SKIP.has(field)) continue;
    const o = norm(before[field]);
    const n = norm(newVal);
    if (o === n) continue;
    rows.push({
      entity_type,
      entity_id,
      entity_label: entity_label ?? null,
      field,
      old_value: o || null,
      new_value: n || null,
      changed_by: 'staff',
    });
  }
  if (rows.length === 0) return;
  await supabase.from('edit_history' as any).insert(rows as any);
}

export function useEntityEditHistory(
  entity_type: EntityType | null,
  entity_id: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['edit_history', entity_type, entity_id],
    enabled: enabled && !!entity_type && !!entity_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edit_history' as any)
        .select('*')
        .eq('entity_type', entity_type as string)
        .eq('entity_id', entity_id as string)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as EditHistoryEntry[];
    },
  });
}

export function useInvalidateEditHistory() {
  const qc = useQueryClient();
  return (entity_type: EntityType, entity_id: string) =>
    qc.invalidateQueries({ queryKey: ['edit_history', entity_type, entity_id] });
}
