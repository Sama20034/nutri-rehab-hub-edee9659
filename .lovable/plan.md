

# Fix: Add Paymob Integration ID to Payment Intention

## Problem
The `create-paymob-intention` edge function sends `payment_methods: []` (empty array) to Paymob's API. Paymob requires the **Integration ID** (`5485097`) to be passed in this array to identify which payment method to use. Without it, the intention may fail or not show any payment options.

## Solution
Add the Integration ID as a Supabase secret (`PAYMOB_INTEGRATION_ID`) and use it in the edge function's `payment_methods` array.

## Changes

### 1. Add Secret
- Store `PAYMOB_INTEGRATION_ID = 5485097` as a Supabase secret.

### 2. Update `supabase/functions/create-paymob-intention/index.ts`
- Read `PAYMOB_INTEGRATION_ID` from environment.
- Change `payment_methods: []` to `payment_methods: [parseInt(integrationId)]`.
- Add better error logging to capture the full Paymob response for debugging.

### 3. Deploy Edge Function
- Redeploy the updated `create-paymob-intention` function.

