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

// Helper functions to work with localStorage directly
const getStoredCart = (): GuestCartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return [];
};

const saveCartToStorage = (cart: GuestCartItem[]) => {
  if (cart.length > 0) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } else {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
};

export const useCart = () => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';
  
  // Initialize state from localStorage immediately
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredCart();
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Sync guest cart to DB when user logs in (only after auth is ready)
  useEffect(() => {
    if (authLoading || hasSynced) return;

    if (user) {
      // User is logged in — sync guest cart to DB then clear localStorage
      const savedCart = getStoredCart();
      if (savedCart.length > 0) {
        syncGuestCartToDb(savedCart, user.id).then(() => {
          setGuestCart([]);
          localStorage.removeItem(CART_STORAGE_KEY);
          queryClient.invalidateQueries({ queryKey: ['cart'] });
          setHasSynced(true);
        });
      } else {
        setHasSynced(true);
      }
    } else {
      // No user after auth is ready — guest mode
      setHasSynced(true);
    }
  }, [user, authLoading, hasSynced]);

  const syncGuestCartToDb = async (cart: GuestCartItem[], userId: string) => {
    for (const item of cart) {
      try {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', item.product_id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({ user_id: userId, product_id: item.product_id, quantity: item.quantity });
        }
      } catch (e) {
        console.error('Failed to sync cart item:', e);
      }
    }
  };

  // Save guest cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (!user && isInitialized) {
      saveCartToStorage(guestCart);
    }
  }, [guestCart, user, isInitialized]);

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
          .maybeSingle();

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
          let newCart;
          if (existing) {
            newCart = prev.map(item => 
              item.product_id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            newCart = [...prev, {
              id: `guest_${Date.now()}`,
              product_id: product.id,
              quantity: 1,
              product
            }];
          }
          // Save immediately to ensure persistence
          saveCartToStorage(newCart);
          return newCart;
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
        setGuestCart(prev => {
          let newCart;
          if (quantity <= 0) {
            newCart = prev.filter(item => item.id !== itemId);
          } else {
            newCart = prev.map(item => 
              item.id === itemId ? { ...item, quantity } : item
            );
          }
          saveCartToStorage(newCart);
          return newCart;
        });
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
        setGuestCart(prev => {
          const newCart = prev.filter(item => item.id !== itemId);
          saveCartToStorage(newCart);
          return newCart;
        });
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
