

# تحليل المشكلة والحل النهائي

## الوضع الحالي
بعد فحص قاعدة البيانات مباشرة، الـ RLS policies على جدول `orders` **تم إصلاحها بالفعل** وهي الآن `PERMISSIVE` (وليست `RESTRICTIVE`):

```text
Policy                              | Type       | Command
------------------------------------|------------|--------
Admins can manage all orders        | PERMISSIVE | ALL
Authenticated users can create orders| PERMISSIVE | INSERT
Guest can create orders             | PERMISSIVE | INSERT
Users can update own orders         | PERMISSIVE | UPDATE
Users can view own orders           | PERMISSIVE | SELECT
```

حسابك (admin2@gmail.com) لديه دور `admin` وسياسة "Admins can manage all orders" المسموحة تتيح لك كل العمليات.

## المشكلة المحتملة
الخطأ في الصورة قد يكون من محاولة قبل تطبيق آخر migration. لكن لو لسه المشكلة موجودة فعلاً، الحل النهائي هو **نقل إنشاء الطلب لـ Edge Function** بدل إنشائه مباشرة من الكود (client-side). كده نتجنب أي مشكلة RLS نهائياً.

## الخطة

### 1. تعديل Edge Function `create-paymob-intention`
- نضيف إنشاء الطلب (order + order_items) داخل الـ Edge Function باستخدام `SERVICE_ROLE_KEY` (يتجاوز RLS)
- الـ Edge Function هتستقبل بيانات الطلب + بيانات الدفع وتعمل كل حاجة في خطوة واحدة

### 2. تعديل `Checkout.tsx`
- بدل ما الكود ينشئ الطلب في قاعدة البيانات مباشرة ثم يستدعي الـ Edge Function، هيبعت كل البيانات للـ Edge Function مرة واحدة
- نفس الشيء لعملية `placeOrder` (الدفع اليدوي) - ننقلها لـ Edge Function جديدة

### 3. إنشاء Edge Function `create-order`
- Edge Function جديدة للدفع اليدوي (فودافون كاش / إنستا باي)
- تنشئ الطلب باستخدام service role key
- ترجع بيانات الطلب

## التفاصيل التقنية

**`create-paymob-intention/index.ts`**: يستقبل بيانات الطلب + الدفع → ينشئ الطلب في DB بـ service role → يستدعي Paymob API → يرجع client_secret

**`create-order/index.ts`**: Edge Function جديدة للدفع اليدوي → ينشئ الطلب في DB بـ service role → يرجع order data

**`Checkout.tsx`**: يرسل كل البيانات للـ Edge Functions بدل التعامل المباشر مع Supabase

