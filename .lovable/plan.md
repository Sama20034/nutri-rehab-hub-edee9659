

## المشكلة

عند إنشاء طلب من مستخدم مسجل، الـ checkout بيحفظ `shipping_address` و `phone` في جدول `orders`، لكن:
1. **الاسم** (`full_name`) اللي العميل بيكتبه في الـ checkout مش بيتحفظ في الطلب — بيتحفظ بس في `profiles.full_name` اللي ممكن يكون فاضي لو المستخدم ما دخلش اسمه وقت التسجيل
2. **الإيميل** مش بيتحفظ في الطلب خالص للمستخدمين المسجلين (حقل `guest_email` بيستخدم للزوار بس)

يعني الأدمن ممكن يشوف تلفون وإيميل (من الـ auth) بس مش هيلاقي اسم العميل ولا عنوان لو مش محفوظين صح.

## الحل

### 1. تعديل جدول `orders` — إضافة حقل `customer_name`
- إضافة عمود `customer_name` (text, nullable) لحفظ اسم العميل مباشرة في الطلب
- استخدام `guest_email` لحفظ إيميل كل المستخدمين (مش الزوار بس)

### 2. تعديل `Checkout.tsx`
- حفظ `checkoutData.full_name` في حقل `customer_name` الجديد في الطلب
- حفظ `checkoutData.email` في حقل `guest_email` لكل المستخدمين (مسجلين وزوار)
- التأكد إن `shipping_address` بيتحفظ صح (ده شغال فعلاً)

### 3. تعديل `useAdminStats.tsx`
- تحديث الـ Order interface ليشمل `customer_name`

### 4. تعديل `StoreSection.tsx` (لوحة الأدمن)
- عرض `customer_name` من الطلب مباشرة (مع fallback للـ `profile.full_name`)
- عرض `guest_email` كإيميل لكل الطلبات (مش الزوار بس)
- التأكد إن العنوان والاسم بيظهروا في جدول الطلبات وفي نافذة التفاصيل

### 5. تعديل Edge Functions
- تحديث `create-order` و `create-paymob-intention` لقبول وحفظ `customer_name`

### النتيجة
الأدمن هيشوف في كل طلب: **الاسم + التلفون + الإيميل + العنوان + المنتجات**

