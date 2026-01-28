import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JobDB {
  id: string;
  company_name: string;
  contact_person: string | null;
  employer_phone: string | null;
  employer_location: string | null;
  role_title: string;
  required_skills: string[];
  salary_min: number;
  salary_max: number;
  timing: string;
  location: string | null;
  status: string;
  remarks: string | null;
  created_at: string;
}

export function useJobs() {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JobDB[];
    },
  });

  const addJob = useMutation({
    mutationFn: async (job: Omit<JobDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('job_requirements')
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job posted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to post job: ${error.message}`);
    },
  });

  const updateJob = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('job_requirements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_requirements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete job: ${error.message}`);
    },
  });

  return {
    jobs,
    isLoading,
    error,
    addJob,
    updateJob,
    deleteJob,
  };
}
