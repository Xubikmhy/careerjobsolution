import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VisitorDB {
  id: string;
  full_name: string;
  phone: string;
  address: string | null;
  skills: string[];
  preferred_work_location: string | null;
  remarks: string | null;
  created_at: string;
}

export function useVisitors() {
  const queryClient = useQueryClient();

  const { data: visitors = [], isLoading, error } = useQuery({
    queryKey: ['visitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitors' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as VisitorDB[];
    },
  });

  const addVisitor = useMutation({
    mutationFn: async (visitor: Omit<VisitorDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('visitors' as any)
        .insert(visitor as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as VisitorDB;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast.success('Visitor added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add visitor: ${error.message}`);
    },
  });

  const updateVisitor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VisitorDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('visitors' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as VisitorDB;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast.success('Visitor updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update visitor: ${error.message}`);
    },
  });

  const deleteVisitor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('visitors' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast.success('Visitor deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete visitor: ${error.message}`);
    },
  });

  return { visitors, isLoading, error, addVisitor, updateVisitor, deleteVisitor };
}
