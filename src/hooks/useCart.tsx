import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  video_url: string | null;
  usage_instructions: string | null;
  usage_instructions_ar: string | null;
  suitable_for: string | null;
  suitable_for_ar: string | null;
  medical_followup_required: boolean | null;
  medical_followup_notes: string | null;
  medical_followup_notes_ar: string | null;
  category: string | null;
  stock_quantity: number | null;
}

export interface GuestCartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

const CART_STORAGE_KEY = 'guest_cart';

export const useCart = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';
  
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load guest cart from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          setGuestCart(JSON.parse(savedCart));
        } catch {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    }
  }, [user]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!user && guestCart.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(guestCart));
    } else if (!user && guestCart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [guestCart, user]);

  // Add to cart (works for both guest and logged-in users)
  const addToCart = useCallback(async (product: Product) => {
    setIsLoading(true);
    
    try {
      if (user) {
        // Logged-in user: use database
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: product.id, quantity: 1 });
          if (error) throw error;
        }
        
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        // Guest user: use localStorage
        setGuestCart(prev => {
          const existing = prev.find(item => item.product_id === product.id);
          if (existing) {
            return prev.map(item => 
              item.product_id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [...prev, {
              id: `guest_${Date.now()}`,
              product_id: product.id,
              quantity: 1,
              product
            }];
          }
        });
      }
      
      toast.success(isRTL ? 'تمت الإضافة للسلة' : 'Added to cart');
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [user, isRTL, queryClient]);

  // Update quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    
    try {
      if (user) {
        if (quantity <= 0) {
          const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
          if (error) throw error;
        }
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        if (quantity <= 0) {
          setGuestCart(prev => prev.filter(item => item.id !== itemId));
        } else {
          setGuestCart(prev => prev.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          ));
        }
      }
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [user, isRTL, queryClient]);

  // Remove from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    setIsLoading(true);
    
    try {
      if (user) {
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        setGuestCart(prev => prev.filter(item => item.id !== itemId));
      }
      
      toast.success(isRTL ? 'تم الحذف من السلة' : 'Removed from cart');
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [user, isRTL, queryClient]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        setGuestCart([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    }
  }, [user, isRTL, queryClient]);

  // Get cart items
  const getCartItems = useCallback(() => {
    return guestCart;
  }, [guestCart]);

  return {
    guestCart,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItems
  };
};
