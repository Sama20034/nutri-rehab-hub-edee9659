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
    const secretKey = Deno.env.get('PAYMOB_SECRET_KEY');
    const integrationId = Deno.env.get('PAYMOB_INTEGRATION_ID');
    if (!secretKey) throw new Error('PAYMOB_SECRET_KEY not configured');
    if (!integrationId) throw new Error('PAYMOB_INTEGRATION_ID not configured');

    const { amount, currency = 'EGP', items, billing_data, extras, order_data } = await req.json();

    if (!amount || !billing_data) {
      throw new Error('Missing required fields: amount, billing_data');
    }

    // Create order in DB using service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let orderId: string;

    if (order_data) {
      console.log('Creating order in DB with service role...');
      
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert(order_data.order)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      orderId = order.id;

      // Create order items - validate product_ids first
      if (order_data.items && order_data.items.length > 0) {
        const productIds = order_data.items.map((item: any) => item.product_id);
        const { data: validProducts } = await supabaseAdmin
          .from('products')
          .select('id')
          .in('id', productIds);
        
        const validProductIds = new Set((validProducts || []).map((p: any) => p.id));
        const validItems = order_data.items.filter((item: any) => validProductIds.has(item.product_id));

        if (validItems.length === 0) {
          console.error('No valid products found for order items. Product IDs:', productIds);
          throw new Error('None of the products in your cart exist anymore. Please refresh your cart.');
        }

        const orderItems = validItems.map((item: any) => ({
          ...item,
          order_id: orderId,
        }));

        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Order items error:', itemsError);
          throw new Error(`Failed to create order items: ${itemsError.message}`);
        }
      }

      console.log('Order created successfully:', orderId);
    } else {
      orderId = '';
    }

    // Build intention items
    const intentionItems = (items || []).map((item: any) => ({
      name: item.name?.substring(0, 100) || 'Product',
      amount: Math.round(item.amount * 100),
      description: item.description?.substring(0, 200) || '',
      quantity: item.quantity || 1,
    }));

    if (intentionItems.length === 0) {
      intentionItems.push({
        name: 'Order',
        amount: Math.round(amount * 100),
        description: 'Store order',
        quantity: 1,
      });
    }

    const intentionPayload = {
      amount: Math.round(amount * 100),
      currency,
      payment_methods: [parseInt(integrationId)],
      items: intentionItems,
      billing_data: {
        first_name: billing_data.first_name || 'N/A',
        last_name: billing_data.last_name || 'N/A',
        email: billing_data.email || 'N/A',
        phone_number: billing_data.phone || 'N/A',
        street: billing_data.street || billing_data.address || 'N/A',
        city: billing_data.city || 'Cairo',
        country: billing_data.country || 'EG',
        state: billing_data.state || 'Cairo',
        apartment: billing_data.apartment || 'N/A',
        floor: billing_data.floor || 'N/A',
        building: billing_data.building || 'N/A',
      },
      extras: {
        ...(extras || {}),
        order_id: orderId || '',
      },
      special_reference: orderId || undefined,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paymob-webhook`,
      redirection_url: `${req.headers.get('origin') || 'https://nutri-rehab-hub.lovable.app'}/order-success`,
    };

    console.log('Creating Paymob intention...');

    const response = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${secretKey}`,
      },
      body: JSON.stringify(intentionPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paymob API error:', JSON.stringify(data));
      throw new Error(`Paymob API error: ${JSON.stringify(data)}`);
    }

    console.log('Paymob intention created successfully');

    return new Response(
      JSON.stringify({
        client_secret: data.client_secret,
        intention_id: data.id,
        payment_keys: data.payment_keys,
        order_id: orderId,
      }),
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
