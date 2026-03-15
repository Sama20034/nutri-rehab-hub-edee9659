

# تحديث HMAC Secret

## المشكلة
الـ HMAC Secret كان متسجل بنفس قيمة الـ Secret Key، لكن القيمة الصحيحة مختلفة:
- **HMAC Secret**: `D1BEF52EA82DE158C7C92A645AEAE938`
- **Secret Key**: `egy_sk_live_dbb04bb6000e51e7900479a0d6afaf5209a8e06b2f7849b94804a5cd2fa8fa4b`

## الخطة
تحديث الـ Supabase secret `PAYMOB_HMAC_SECRET` للقيمة الصحيحة `D1BEF52EA82DE158C7C92A645AEAE938`.

هذا مهم لأن الـ webhook بيستخدم الـ HMAC للتحقق من صحة الإشعارات من Paymob.

