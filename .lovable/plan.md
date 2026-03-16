

# إضافة إدارة Facebook Pixel من لوحة التحكم

## المشكلة
الـ Pixel ID حالياً hardcoded في `index.html` ومش سهل تغييره أو إزالته بدون تعديل الكود.

## الحل
إضافة قسم "Facebook Pixel" في الـ Admin Dashboard يسمح بـ:
- عرض الـ Pixel ID الحالي
- تغييره لـ ID جديد
- إزالته بالكامل (تعطيل التتبع)
- إعادة تفعيله بـ ID جديد

## التفاصيل التقنية

### 1. جدول Supabase جديد: `site_settings`
جدول key-value بسيط لتخزين إعدادات الموقع:
- `key` (text, primary key) — مثل `facebook_pixel_id`
- `value` (text)
- `updated_at` (timestamp)
- RLS: الأدمن فقط يقدر يعدل، والكل يقدر يقرأ

### 2. ملف جديد: `src/components/admin/sections/PixelSection.tsx`
- يعرض الـ Pixel ID الحالي
- Input لتغيير الـ ID
- زر حفظ / زر حذف (تعطيل)
- يوضح حالة البكسل (مفعل/معطل)

### 3. تعديل `index.html`
- إزالة الـ Pixel hardcoded بالكامل
- سكريبت صغير يقرأ الـ Pixel ID من Supabase عند تحميل الصفحة ويحمل الـ SDK ديناميكياً

### 4. تعديل `src/hooks/useFacebookPixel.tsx`
- بدل ما يعتمد على `window.fbq` موجود دايماً، يتحقق إن الـ pixel اتحمل ديناميكياً

### 5. تعديل `AdminSidebar.tsx`
- إضافة عنصر "Facebook Pixel" في القائمة الجانبية

### 6. تعديل `AdminDashboard.tsx`
- إضافة `case 'pixel'` في `renderSection()`

## ملخص الملفات
| ملف | تعديل |
|------|--------|
| `index.html` | إزالة pixel hardcoded + سكريبت تحميل ديناميكي |
| `src/components/admin/sections/PixelSection.tsx` | **جديد** — واجهة إدارة البكسل |
| `src/components/admin/AdminSidebar.tsx` | إضافة عنصر pixel |
| `src/pages/dashboard/AdminDashboard.tsx` | إضافة case pixel |
| `src/hooks/useFacebookPixel.tsx` | تعديل طفيف للتوافق |
| Supabase migration | إنشاء جدول `site_settings` |

