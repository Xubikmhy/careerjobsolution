import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay(); // 0 (Sun) - 6
  const diff = (day + 6) % 7; // make Monday the start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function startOfMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

export interface RecruiterMetrics {
  contactedToday: number;
  jobsFilledThisWeek: number;
  commissionEarnedThisMonth: number;
}

export function useRecruiterMetrics() {
  return useQuery({
    queryKey: ['recruiter_metrics'],
    queryFn: async (): Promise<RecruiterMetrics> => {
      const [contacted, filled, commissions] = await Promise.all([
        supabase
          .from('candidate_activities')
          .select('id', { count: 'exact', head: true })
          .eq('activity_type', 'contact')
          .gte('created_at', startOfTodayISO()),
        supabase
          .from('placements')
          .select('id', { count: 'exact', head: true })
          .gte('placed_date', startOfWeekISO()),
        supabase
          .from('placements')
          .select('commission_amount')
          .gte('placed_date', startOfMonthISO()),
      ]);

      const commissionEarnedThisMonth = (commissions.data || [])
        .reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0);

      return {
        contactedToday: contacted.count ?? 0,
        jobsFilledThisWeek: filled.count ?? 0,
        commissionEarnedThisMonth,
      };
    },
    refetchInterval: 60_000,
  });
}
