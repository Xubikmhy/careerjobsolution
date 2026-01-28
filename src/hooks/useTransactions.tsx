import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransactionDB {
  id: string;
  type: string;
  description: string | null;
  amount: number;
  related_id: string | null;
  related_name: string | null;
  date: string;
  notes: string | null;
  created_at: string;
}

export function useTransactions() {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as TransactionDB[];
    },
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<TransactionDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record transaction: ${error.message}`);
    },
  });

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
  };
}
