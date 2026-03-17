

## المشاكل المكتشفة والحل

### 1. حقول الاسم والإيميل مفقودة من صفحة الدفع
في السطر 689 من `Checkout.tsx` يوجد تعليق: `"All users are now logged in - no guest fields needed"` — تم حذف حقول الاسم والإيميل بالخطأ في التعديل السابق. المفروض تكون موجودة دائماً لأن:
- الزوار (guests) محتاجين يدخلوا اسمهم وإيميلهم
- المستخدمين المسجلين المفروض تتملأ تلقائياً من بيانات حسابهم

**الحل**: إعادة حقول الاسم (`full_name`) والإيميل (`email`) في خطوة `details` من فورم Checkout، مع ملئهم تلقائياً لو المستخدم مسجل دخول (من `profile` و `user.email`). وتحديث الـ validation schema ليشمل الاسم كحقل مطلوب.

### 2. إضافة/تعديل المنتج في الداش بورد
الكود الحالي في `StoreSection.tsx` يبدو سليم من ناحية المنطق:
- `handleAddProduct` بيعمل insert في `products` ثم يعمل `window.location.reload()`
- `EditProductForm` بيعمل save عبر `onSave` callback

لكن محتاج أتأكد: هل المشكلة إن الداتا مش بتتحفظ فعلاً؟ ولا إن الفورم مش بيظهر؟ ولا إن فيه error معين؟ هحتاج أشوف الـ `onUpdateProduct` في `AdminDashboard` أو `useAdminData`.

### الملفات المستهدفة
- `src/pages/Checkout.tsx` — إضافة حقول الاسم والإيميل
- `src/components/admin/sections/StoreSection.tsx` — فحص وإصلاح أي مشكلة في إضافة/تعديل المنتجات

### التغييرات التقنية
1. **Checkout.tsx**:
   - إضافة حقل `full_name` (مطلوب) وحقل `email` (اختياري) قبل حقول العنوان
   - تحديث `checkoutSchema` ليشمل `full_name: z.string().trim().min(2)`
   - ملء تلقائي من `useAuth` profile data للمستخدمين المسجلين

2. **StoreSection.tsx**:
   - فحص إن كان `onAddProduct`/`onUpdateProduct` callbacks بتشتغل صح
   - التأكد من إن الفورم بيتريست بعد الإضافة بنجاح

