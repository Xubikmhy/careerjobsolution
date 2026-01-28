import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgencySettingsDB {
  id: string;
  agency_name: string | null;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  updated_at: string;
}

export function useAgencySettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['agency_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AgencySettingsDB | null;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<AgencySettingsDB, 'id' | 'updated_at'>>) => {
      // First get the existing settings id
      const { data: existing } = await supabase
        .from('agency_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('agency_settings')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('agency_settings')
          .insert(updates)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency_settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
}
