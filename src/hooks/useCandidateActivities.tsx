import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CandidateActivity {
  id: string;
  candidate_id: string;
  job_id: string | null;
  activity_type: string; // 'registered' | 'sent_for_interview' | 'interview_returned' | 'placed' | 'follow_up' | 'remark'
  status: string;
  placed_at: string | null;
  remarks: string | null;
  follow_up_date: string | null;
  follow_up_done: boolean;
  created_at: string;
}

export function useCandidateActivities(candidateId?: string) {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['candidate_activities', candidateId],
    queryFn: async () => {
      let query = supabase
        .from('candidate_activities')
        .select('*')
        .order('created_at', { ascending: true });

      if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CandidateActivity[];
    },
  });

  const { data: allActivities = [] } = useQuery({
    queryKey: ['candidate_activities_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CandidateActivity[];
    },
  });

  // Get follow-ups that are due (within 2 days or overdue)
  const pendingFollowUps = allActivities.filter(a => {
    if (a.follow_up_done || !a.follow_up_date) return false;
    const followUpDate = new Date(a.follow_up_date);
    const now = new Date();
    return followUpDate <= new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  });

  const addActivity = useMutation({
    mutationFn: async (activity: Omit<CandidateActivity, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('candidate_activities')
        .insert(activity)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate_activities'] });
      queryClient.invalidateQueries({ queryKey: ['candidate_activities_all'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to log activity: ${error.message}`);
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CandidateActivity> & { id: string }) => {
      const { data, error } = await supabase
        .from('candidate_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate_activities'] });
      queryClient.invalidateQueries({ queryKey: ['candidate_activities_all'] });
    },
  });

  return { activities, allActivities, pendingFollowUps, isLoading, addActivity, updateActivity };
}
