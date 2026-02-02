import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/lib/supabase-types';

export function useProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true);

      if (options?.categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', options.categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      if (options?.searchQuery) {
        query = query.ilike('name', `%${options.searchQuery}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });
}
