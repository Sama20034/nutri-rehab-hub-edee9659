

## المطلوب

1. إضافة سكشن فيديو في الصفحة الرئيسية بين **أسعار الباقات** و**قصص النجاح**
2. التحكم في رابط الفيديو من الداشبورد
3. إصلاح أخطاء البناء (build errors) في ملفين

---

## الخطة

### 1. إصلاح أخطاء البناء (Build Errors)

**ملف `src/hooks/useAdminExercisesData.tsx`** (سطر 146):
- تغيير `Record<string, unknown>` إلى النوع الصحيح من Supabase types

**ملف `src/hooks/useAuth.tsx`** (سطر 158):
- نفس التعديل — استبدال `Record<string, unknown>` بالنوع المحدد

### 2. إضافة سكشن الفيديو في الصفحة الرئيسية

**ملف `src/pages/Index.tsx`:**
- إنشاء كومبوننت `HomepageVideo` جديد
- يجلب رابط الفيديو من جدول `site_settings` (المفتاح: `homepage_video_url`)
- يدعم يوتيوب وجوجل درايف (نفس منطق باقي الموقع)
- لو مفيش فيديو محفوظ → السكشن مش هيظهر خالص
- يتحط بين `<SubscriptionPlans />` و `<TransformationsCarousel />`

### 3. إضافة إدارة الفيديو في الداشبورد

**ملف `src/components/admin/sections/HomepageVideoSection.tsx`** (ملف جديد):
- واجهة بسيطة: حقل إدخال لرابط الفيديو + زر حفظ + زر حذف
- يستخدم جدول `site_settings` بمفتاح `homepage_video_url` (نفس طريقة الـ Pixel)
- معاينة للفيديو بعد الحفظ

**ملف `src/pages/dashboard/AdminDashboard.tsx`:**
- إضافة case `'homepage-video'` في `renderSection`

**ملف `src/components/admin/AdminSidebar.tsx`:**
- إضافة عنصر جديد "فيديو الصفحة الرئيسية" في القائمة الجانبية

### النتيجة

```text
الصفحة الرئيسية:
  Hero → Countdown → Mission → اسعار الباقات → [فيديو] → قصص النجاح → ...

الداشبورد:
  قائمة جانبية → "فيديو الرئيسية" → حقل رابط + حفظ/حذف + معاينة
```

