import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CandidateDB {
  id: string;
  full_name: string;
  phone: string;
  address: string | null;
  skills: string[];
  experience_years: number;
  education_level: string | null;
  expected_salary: number;
  cv_url: string | null;
  status: string;
  date_of_birth: string | null;
  nationality: string | null;
  marital_status: string | null;
  languages: string[];
  career_objective: string | null;
  reference_info: string | null;
  remarks: string | null;
  created_at: string;
}

export function useCandidates() {
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CandidateDB[];
    },
  });

  const addCandidate = useMutation({
    mutationFn: async (candidate: Omit<CandidateDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add candidate: ${error.message}`);
    },
  });

  const updateCandidate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CandidateDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update candidate: ${error.message}`);
    },
  });

  const deleteCandidate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete candidate: ${error.message}`);
    },
  });

  return {
    candidates,
    isLoading,
    error,
    addCandidate,
    updateCandidate,
    deleteCandidate,
  };
}
