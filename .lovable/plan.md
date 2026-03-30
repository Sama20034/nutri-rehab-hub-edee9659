

## المشكلة
لما بتشارك لينك المتجر (`Alligatorfit.com/#/store`) على واتساب أو فيسبوك أو أي منصة، بعض المنصات بتشيل الـ `#` من الرابط فالشخص اللي بيفتح اللينك بيروح للصفحة الرئيسية مش المتجر.

السبب: الموقع بيستخدم `HashRouter` اللي بيحط `#` في كل الروابط. الحل هو التحويل لـ `BrowserRouter` اللي بيخلي الروابط نظيفة (`Alligatorfit.com/store`).

**ملاحظة**: الـ `.htaccess` على Hostinger جاهز بالفعل لدعم `BrowserRouter` (بيوجه كل المسارات لـ `index.html`).

## الحل — تحويل من HashRouter إلى BrowserRouter

### 1. ملف `src/App.tsx`
- تغيير `HashRouter` → `BrowserRouter`
- تحديث الـ import
- حذف `RouteDebugger` (كان لتتبع الـ hash)

### 2. ملف `index.html`
- حذف سكريبت route persistence بالكامل (مش محتاجينه مع BrowserRouter لأن المسار بيتحفظ في الـ URL نفسه)
- حذف event listeners بتاعت `hashchange` و `popstate`

### 3. ملف `src/hooks/useFacebookPixel.tsx`
- تعديل `currentPath` من `window.location.pathname + window.location.hash` إلى `window.location.pathname` فقط

### 4. ملف `supabase/functions/create-paymob-intention/index.ts`
- تعديل `redirection_url` من `/#/order-success` إلى `/order-success`

### النتيجة
```text
قبل: Alligatorfit.com/#/store     ← الـ # بيتشال لما بتشارك اللينك
بعد:  Alligatorfit.com/store      ← لينك نظيف يشتغل في كل مكان
```

كل الروابط هتفضل شغالة زي ما هي بالظبط — بس بدون `#`.

