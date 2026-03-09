import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function computeHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  ).then(key =>
    crypto.subtle.sign('HMAC', key, encoder.encode(data))
  ).then(signature => {
    const bytes = new Uint8Array(signature);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Paymob webhook received:', JSON.stringify(body, null, 2));

    const hmacSecret = Deno.env.get('PAYMOB_HMAC_SECRET');
    
    // Extract transaction data
    const obj = body.obj || body;
    const transaction = obj.type === 'TRANSACTION' ? obj : obj;
    
    const orderId = transaction.order?.merchant_order_id 
      || transaction.extras?.order_id 
      || transaction.special_reference 
      || '';
    
    const isSuccess = transaction.success === true || transaction.is_success === true;
    const isPending = transaction.pending === true || transaction.is_pending === true;
    const transactionId = transaction.id?.toString() || '';
    const amountCents = transaction.amount_cents || 0;

    console.log(`Transaction ${transactionId}: success=${isSuccess}, pending=${isPending}, orderId=${orderId}, amount=${amountCents}`);

    if (orderId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let newStatus = 'payment_failed';
      if (isSuccess) {
        newStatus = 'confirmed';
      } else if (isPending) {
        newStatus = 'pending_verification';
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          notes: `Paymob Transaction ID: ${transactionId}\nAmount: ${amountCents / 100} EGP\nStatus: ${newStatus}`,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      } else {
        console.log(`Order ${orderId} updated to status: ${newStatus}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Always return 200 to prevent retries
      }
    );
  }
});
