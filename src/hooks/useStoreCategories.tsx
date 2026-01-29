import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
}

interface CategoryWithChildren extends Category {
  subcategories: string[];
}

export const useStoreCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('store_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const getMainCategories = () => {
    return categories.filter(c => !c.parent_id);
  };

  const getSubcategories = (parentId: string) => {
    return categories.filter(c => c.parent_id === parentId);
  };

  const getCategoryTree = (isRTL: boolean): { name: string; subcategories: string[] }[] => {
    const mainCats = getMainCategories();
    return mainCats.map(main => ({
      name: isRTL ? main.name_ar || main.name : main.name,
      subcategories: getSubcategories(main.id).map(sub => 
        isRTL ? sub.name_ar || sub.name : sub.name
      )
    }));
  };

  const getAllSubcategories = (isRTL: boolean): string[] => {
    return categories
      .filter(c => c.parent_id)
      .map(c => isRTL ? c.name_ar || c.name : c.name);
  };

  const getCategoryByName = (name: string): Category | undefined => {
    return categories.find(c => 
      c.name.toLowerCase() === name.toLowerCase() || 
      c.name_ar?.toLowerCase() === name.toLowerCase()
    );
  };

  return {
    categories,
    loading,
    getMainCategories,
    getSubcategories,
    getCategoryTree,
    getAllSubcategories,
    getCategoryByName,
    refetch: fetchCategories
  };
};
