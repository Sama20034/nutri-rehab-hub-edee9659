

## المشكلة
بعد إتمام طلب المتجر، الزر بيعمل toast بس ويرجع للمتجر — مفيش صفحة "شكراً لك" (Thank You Page) زي الأنظمة. المستخدم محتاج URL مخصص لصفحة شكراً عشان يستخدمه في Facebook Pixel Events للإعلانات.

## الحل

### 1. إنشاء صفحة Order Success جديدة
**ملف جديد: `src/pages/OrderSuccess.tsx`**
- صفحة شكراً مخصصة للمتجر على route `/order-success`
- تعرض: أيقونة نجاح، رسالة "تم استلام طلبك بنجاح"، رقم الطلب (لو متاح)، مدة التوصيل المتوقعة
- زرارين: "تسوق المزيد" (يرجع للمتجر) + "متابعة طلبي" (يروح للداشبورد)
- الصفحة ليها URL ثابت (`/#/order-success`) يقدر يستخدمه في إعداد Facebook Pixel

### 2. تعديل Checkout.tsx
- في `onSuccess` بعد نجاح الطلب، بدل `navigate('/store')` → `navigate('/order-success', { state: { orderId: order?.id } })`
- نفس الشيء لـ Paymob لو رجع بنجاح

### 3. تسجيل الراوت في App.tsx
- إضافة `<Route path="/order-success" element={<OrderSuccess />} />`

### التفاصيل التقنية
- الصفحة تستقبل `orderId` من `location.state` لعرض رقم الطلب
- تتضمن `trackPurchase` pixel event تلقائياً
- لو حد فتح الصفحة مباشرة بدون طلب، تعرض رسالة عامة مع زر للمتجر
- تصميم مشابه لصفحة `PendingApproval` (نفس الستايل والأنيميشن)

