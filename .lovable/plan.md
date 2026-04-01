

## المشكلة
رفع صورة الإيصال بيفشل بسبب سياسات الحماية (RLS) في Supabase Storage. السياسة الحالية تسمح فقط للمستخدمين **المسجلين** بالرفع على bucket الـ `uploads`. لكن الـ Checkout بيسمح بالشراء كـ **زائر (Guest)** — والزائر مش مسجّل دخول، فبيظهر خطأ "new row violates row-level security".

**نتيجة المشكلة:**
1. صورة الإيصال مش بتترفع ← الـ `receiptUrl` فاضي
2. زر "تأكيد الطلب" معطّل (disabled) لأن الكود بيشترط وجود إيصال للدفع اليدوي
3. الزر يبان كأنه مش button لأنه disabled ومش بيستجيب

## الحل

### 1. إنشاء Edge Function لرفع الإيصالات server-side
**ملف جديد: `supabase/functions/upload-receipt/index.ts`**
- تستقبل الصورة كـ FormData
- ترفعها على bucket `uploads` باستخدام `SERVICE_ROLE_KEY` (يتجاوز RLS)
- ترجع الـ public URL
- بكده أي حد (زائر أو مسجّل) يقدر يرفع إيصال

### 2. تعديل `src/components/ui/image-upload.tsx`
- إضافة prop جديد `useEdgeFunction?: boolean`
- لما يكون `true`، بدل ما يرفع مباشرة لـ Supabase Storage، يبعت الصورة لـ Edge Function `/upload-receipt`
- الباقي يفضل زي ما هو (preview، validation، إلخ)

### 3. تعديل `src/pages/Checkout.tsx`
- تمرير `useEdgeFunction={true}` لـ `ImageUpload` component بتاع الإيصال
- كده الرفع هيشتغل سواء المستخدم مسجّل أو زائر

### التفاصيل التقنية

**Edge Function (`upload-receipt`):**
```text
POST /upload-receipt
Content-Type: multipart/form-data
Body: file (image)

→ يرفع الصورة على bucket "uploads" بمسار "receipts/timestamp-random.ext"
→ يرجع { url: "https://...publicUrl" }
```

**تعديل ImageUpload:**
- لو `useEdgeFunction` مفعّل → يبعت FormData لـ Edge Function
- لو مش مفعّل → يستخدم الطريقة الحالية (supabase.storage مباشرة)

**النتيجة:**
- الزائر يقدر يرفع إيصال ← الـ receiptUrl يتملى ← زر تأكيد الطلب يتفعّل ويشتغل

