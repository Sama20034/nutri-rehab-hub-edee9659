import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SalesStats {
  totalSales: number;
  subscriptionRevenue: number;
  supplementsRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  activeSubscriptions: number;
  dailyTarget: number;
  tenDayTarget: number;
  monthlyTarget: number;
  dailySales: number;
  tenDaySales: number;
  monthlySales: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string | null;
  phone: string | null;
  grants_content_access: boolean;
  notes: string | null;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: string;
  created_at: string;
  sender_name: string | null;
  sender_phone: string | null;
  package_id: string | null;
  receipt_url: string | null;
  profile?: {
    full_name: string | null;
  };
}

export interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  video_url: string | null;
  usage_instructions: string | null;
  suitable_for: string | null;
  medical_followup_required: boolean;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    subscriptionRevenue: 0,
    supplementsRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    activeSubscriptions: 0,
    dailyTarget: 5000,
    tenDayTarget: 50000,
    monthlyTarget: 150000,
    dailySales: 0,
    tenDaySales: 0,
    monthlySales: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch profiles for orders
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone');

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const ordersWithProfiles = ordersData?.map(order => ({
        ...order,
        profile: profilesMap.get(order.user_id)
      })) || [];

      const paymentsWithProfiles = paymentsData?.map(payment => ({
        ...payment,
        profile: profilesMap.get(payment.user_id)
      })) || [];

      setOrders(ordersWithProfiles);
      setPayments(paymentsWithProfiles);
      setProducts(productsData || []);

      // Calculate stats
      const confirmedOrders = ordersData?.filter(o => o.status === 'confirmed' || o.status === 'delivered') || [];
      const pendingOrders = ordersData?.filter(o => o.status === 'pending') || [];
      
      const confirmedPayments = paymentsData?.filter(p => p.status === 'approved' || p.status === 'verified') || [];
      
      // Supplements revenue (from orders)
      const supplementsRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      
      // Subscription revenue (from payments with type 'subscription')
      const subscriptionRevenue = confirmedPayments
        .filter(p => p.payment_type === 'subscription')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const totalSales = supplementsRevenue + subscriptionRevenue;

      // Daily sales
      const dailySales = confirmedOrders
        .filter(o => new Date(o.created_at) >= new Date(startOfDay))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) +
        confirmedPayments
        .filter(p => new Date(p.created_at) >= new Date(startOfDay))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // 10-day sales
      const tenDaySales = confirmedOrders
        .filter(o => new Date(o.created_at) >= new Date(tenDaysAgo))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) +
        confirmedPayments
        .filter(p => new Date(p.created_at) >= new Date(tenDaysAgo))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Monthly sales
      const monthlySales = confirmedOrders
        .filter(o => new Date(o.created_at) >= new Date(startOfMonth))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) +
        confirmedPayments
        .filter(p => new Date(p.created_at) >= new Date(startOfMonth))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Active subscriptions
      const activeSubscriptions = confirmedPayments
        .filter(p => p.payment_type === 'subscription')
        .length;

      setStats({
        totalSales,
        subscriptionRevenue,
        supplementsRevenue,
        pendingOrders: pendingOrders.length,
        confirmedOrders: confirmedOrders.length,
        activeSubscriptions,
        dailyTarget: 5000,
        tenDayTarget: 50000,
        monthlyTarget: 150000,
        dailySales,
        tenDaySales,
        monthlySales
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      await fetchStats();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status, 
          verified_at: status === 'approved' ? new Date().toISOString() : null 
        })
        .eq('id', paymentId);

      if (error) throw error;
      await fetchStats();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert(product);

      if (error) throw error;
      await fetchStats();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchStats();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchStats();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, [fetchStats]);

  return {
    stats,
    orders,
    payments,
    products,
    loading,
    refreshStats: fetchStats,
    updateOrderStatus,
    updatePaymentStatus,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
