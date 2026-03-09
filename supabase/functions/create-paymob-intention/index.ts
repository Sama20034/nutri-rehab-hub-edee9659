import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!secretKey) {
      throw new Error('PAYMOB_SECRET_KEY not configured');
    }
    if (!integrationId) {
      throw new Error('PAYMOB_INTEGRATION_ID not configured');
    }

    const { amount, currency = 'EGP', items, billing_data, order_id, extras } = await req.json();

    if (!amount || !billing_data) {
      throw new Error('Missing required fields: amount, billing_data');
    }

    // Build intention items from cart items
    const intentionItems = (items || []).map((item: any) => ({
      name: item.name?.substring(0, 100) || 'Product',
      amount: Math.round(item.amount * 100), // Paymob expects amount in cents
      description: item.description?.substring(0, 200) || '',
      quantity: item.quantity || 1,
    }));

    // If no items provided, create a single item
    if (intentionItems.length === 0) {
      intentionItems.push({
        name: 'Order',
        amount: Math.round(amount * 100),
        description: 'Store order',
        quantity: 1,
      });
    }

    const intentionPayload = {
      amount: Math.round(amount * 100), // Paymob expects amount in cents
      currency,
      payment_methods: [], // Empty array = all available methods
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
        order_id: order_id || '',
      },
      special_reference: order_id || undefined,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paymob-webhook`,
      redirection_url: `${req.headers.get('origin') || 'https://nutri-rehab-hub.lovable.app'}/#/store?payment_status=success`,
    };

    console.log('Creating Paymob intention with payload:', JSON.stringify(intentionPayload, null, 2));

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

    console.log('Paymob intention created successfully:', data.client_secret ? 'client_secret received' : 'no client_secret');

    return new Response(
      JSON.stringify({
        client_secret: data.client_secret,
        intention_id: data.id,
        payment_keys: data.payment_keys,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating Paymob intention:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
