

## المشكلة
زرار "اشترك الان عبر الدفع الالكتروني" في الصفحة الرئيسية بيوصل لصفحة `/payment` اللي فيها Paymob مكتوب عليه "قريباً..." لأن `available: false` في السطر 93.

الـ Paymob شغال فعلاً في صفحة Register وفي Checkout (المتجر)، فالمطلوب بس تفعيله في صفحة Payment للاشتراكات.

## الحل

### ملف: `src/pages/Payment.tsx`

1. **تفعيل Paymob**: تغيير `available: false` إلى `available: true` في الـ `electronicPaymentMethods` array (السطر 93).

2. **تنفيذ `handleElectronicPayment`**: بدل ما بيعرض toast "قيد التجهيز"، هيعمل نفس flow الموجود في Register.tsx:
   - يطلب من المستخدم بيانات أساسية (اسم + إيميل + موبايل) لو مش مسجل دخول، أو ياخدهم من الـ profile لو مسجل.
   - يقرأ الـ package والمبلغ من URL params (`?package=...&amount=...`).
   - يستدعي `create-paymob-intention` edge function.
   - يعمل redirect لصفحة Paymob checkout باستخدام `client_secret` + `VITE_PAYMOB_PUBLIC_KEY`.

3. **إضافة UI لجمع بيانات الدفع**: قبل ما يعمل redirect، لو مفيش بيانات كافية (اسم/إيميل/موبايل)، يعرض فورم صغير يجمعهم.

4. **حالة Tap Payments**: تظل `available: false` (قريباً) زي ما هي.

### التغييرات التقنية
- إضافة state للفورم: `payerName`, `payerEmail`, `payerPhone`, `isProcessingPayment`
- إضافة state: `showPayerForm` لعرض فورم البيانات قبل الدفع
- ملء تلقائي من `profile` و `user` لو مسجل دخول
- استدعاء `create-paymob-intention` بنفس pattern الموجود في Register.tsx
- Redirect إلى Paymob unified checkout

### ملفات مستهدفة
- `src/pages/Payment.tsx` فقط

