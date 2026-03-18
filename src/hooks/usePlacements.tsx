import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlacementDB {
  id: string;
  candidate_id: string | null;
  job_id: string | null;
  candidate_name: string | null;
  job_title: string | null;
  employer_name: string | null;
  placed_date: string;
  agreed_salary: number;
  commission_amount: number;
  commission_paid: boolean;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
}

export function usePlacements() {
  const queryClient = useQueryClient();

  const { data: placements = [], isLoading, error } = useQuery({
    queryKey: ['placements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('placements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlacementDB[];
    },
  });

  const addPlacement = useMutation({
    mutationFn: async (placement: Omit<PlacementDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('placements')
        .insert(placement)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Auto-update candidate status to 'Placed' and job status to 'Filled'
      if (data.candidate_id) {
        await supabase.from('candidates').update({ status: 'Placed' }).eq('id', data.candidate_id);
        queryClient.invalidateQueries({ queryKey: ['candidates'] });
      }
      if (data.job_id) {
        await supabase.from('job_requirements').update({ status: 'Filled' }).eq('id', data.job_id);
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
      }
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Placement recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record placement: ${error.message}`);
    },
  });

  const updatePlacement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlacementDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('placements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      toast.success('Placement updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update placement: ${error.message}`);
    },
  });

  const deletePlacement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('placements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      toast.success('Placement deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete placement: ${error.message}`);
    },
  });

  return {
    placements,
    isLoading,
    error,
    addPlacement,
    updatePlacement,
    deletePlacement,
  };
}
