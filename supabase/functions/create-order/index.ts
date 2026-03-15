import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order, items, clear_cart_user_id } = await req.json();

    if (!order || !items || items.length === 0) {
      throw new Error('Missing required fields: order, items');
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create order
    const { data: createdOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Validate product_ids exist before inserting order items
    const productIds = items.map((item: any) => item.product_id);
    const { data: validProducts } = await supabaseAdmin
      .from('products')
      .select('id')
      .in('id', productIds);
    
    const validProductIds = new Set((validProducts || []).map((p: any) => p.id));
    const validItems = items.filter((item: any) => validProductIds.has(item.product_id));

    if (validItems.length === 0) {
      console.error('No valid products found. Product IDs:', productIds);
      throw new Error('None of the products in your cart exist anymore. Please refresh your cart.');
    }

    const orderItems = validItems.map((item: any) => ({
      ...item,
      order_id: createdOrder.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Clear cart if user is logged in
    if (clear_cart_user_id) {
      await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', clear_cart_user_id);
    }

    console.log('Order created successfully:', createdOrder.id);

    return new Response(
      JSON.stringify({ order: createdOrder }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
