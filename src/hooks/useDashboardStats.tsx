import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  activeJobSeekers: number;
  openJobPositions: number;
  vacantProperties: number;
  placedCandidates: number;
  successfulRentals: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingCommissions: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch all counts in parallel
      const [
        candidatesResult,
        jobsResult,
        propertiesResult,
        placementsResult,
        transactionsResult,
      ] = await Promise.all([
        supabase.from('candidates').select('status'),
        supabase.from('job_requirements').select('status'),
        supabase.from('properties').select('status'),
        supabase.from('placements').select('commission_amount, commission_paid'),
        supabase.from('transactions').select('amount, date'),
      ]);

      const candidates = candidatesResult.data || [];
      const jobs = jobsResult.data || [];
      const properties = propertiesResult.data || [];
      const placements = placementsResult.data || [];
      const transactions = transactionsResult.data || [];

      const activeJobSeekers = candidates.filter(c => c.status === 'Active').length;
      const placedCandidates = candidates.filter(c => c.status === 'Placed').length;
      const openJobPositions = jobs.filter(j => j.status === 'Open').length;
      const vacantProperties = properties.filter(p => p.status === 'Vacant').length;
      const successfulRentals = properties.filter(p => p.status === 'Occupied').length;

      const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const thisMonthRevenue = transactions
        .filter(t => t.date >= startOfMonth)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const pendingCommissions = placements
        .filter(p => !p.commission_paid)
        .reduce((sum, p) => sum + (p.commission_amount || 0), 0);

      return {
        activeJobSeekers,
        openJobPositions,
        vacantProperties,
        placedCandidates,
        successfulRentals,
        totalRevenue,
        thisMonthRevenue,
        pendingCommissions,
      };
    },
  });
}
