import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef } from 'react';
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

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartReady: boolean;
  isLoading: boolean;
  addToCart: (product: Product) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'guest_cart';

const getStoredCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  if (cart.length > 0) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } else {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';

  const [cartItems, setCartItems] = useState<CartItem[]>(() => getStoredCart());
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const syncedForUserRef = useRef<string | null>(null);

  const isCartReady = !authLoading && (syncStatus === 'synced' || syncStatus === 'error');

  // Fetch DB cart for a user
  const fetchDbCart = async (userId: string): Promise<CartItem[]> => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.product as unknown as Product,
    }));
  };

  // Sync guest cart items to DB, then load full DB cart
  const syncGuestCartToDb = async (guestItems: CartItem[], userId: string) => {
    for (const item of guestItems) {
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
        throw e; // propagate so we don't clear localStorage on failure
      }
    }
  };

  // Main sync effect — runs when auth state settles or user changes
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?.id || null;

    // Already synced for this user (or guest)
    if (syncedForUserRef.current === (currentUserId || '__guest__')) {
      return;
    }

    const doSync = async () => {
      setSyncStatus('syncing');

      try {
        if (currentUserId) {
          // User logged in — merge guest cart then load DB cart
          const guestItems = getStoredCart();
          if (guestItems.length > 0) {
            await syncGuestCartToDb(guestItems, currentUserId);
            localStorage.removeItem(CART_STORAGE_KEY);
          }
          const dbCart = await fetchDbCart(currentUserId);
          setCartItems(dbCart);
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        } else {
          // Guest mode — use localStorage
          setCartItems(getStoredCart());
        }
        syncedForUserRef.current = currentUserId || '__guest__';
        setSyncStatus('synced');
      } catch (err) {
        console.error('Cart sync failed:', err);
        // On failure, keep whatever is in state (guest items preserved)
        setSyncStatus('error');
        syncedForUserRef.current = currentUserId || '__guest__';
        toast.error(isRTL ? 'فشل مزامنة السلة' : 'Failed to sync cart');
      }
    };

    doSync();
  }, [authLoading, user?.id]);

  // Save to localStorage when cart changes (guest only)
  useEffect(() => {
    if (!user && syncStatus === 'synced') {
      saveCartToStorage(cartItems);
    }
  }, [cartItems, user, syncStatus]);

  // Refresh cart from DB (for logged-in users)
  const refreshCart = useCallback(async () => {
    if (user) {
      try {
        const dbCart = await fetchDbCart(user.id);
        setCartItems(dbCart);
      } catch (err) {
        console.error('Failed to refresh cart:', err);
      }
    }
  }, [user]);

  const addToCart = useCallback(async (product: Product) => {
    setIsLoading(true);
    try {
      if (user) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: product.id, quantity: 1 });
        }
        await refreshCart();
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        setCartItems(prev => {
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
  }, [user, isRTL, queryClient, refreshCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      if (user) {
        if (quantity <= 0) {
          await supabase.from('cart_items').delete().eq('id', itemId);
        } else {
          await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
        }
        await refreshCart();
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        setCartItems(prev => {
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
  }, [user, isRTL, queryClient, refreshCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      if (user) {
        await supabase.from('cart_items').delete().eq('id', itemId);
        await refreshCart();
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        setCartItems(prev => {
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
  }, [user, isRTL, queryClient, refreshCart]);

  const clearCart = useCallback(async () => {
    try {
      if (user) {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      setCartItems([]);
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    }
  }, [user, isRTL, queryClient]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      isCartReady,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
