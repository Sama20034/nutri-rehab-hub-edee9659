import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTransformations = (activeOnly = true) => {
  return useQuery({
    queryKey: ['transformations', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('transformations')
        .select('*')
        .order('display_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
