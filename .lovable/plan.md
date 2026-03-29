

## المشكلة
لما المستخدم بيدوس على تصنيف في صفحة المتجر، بيتم فلترة المنتجات في نفس الصفحة وبينزل لتحت. لو داس "رجوع" بيروح للصفحة الرئيسية بالكامل (مش المتجر) — فبيخسر العميل.

## الحل
إنشاء صفحة مستقلة لكل تصنيف (`/store/category/:categoryId`) بحيث:
- الضغط على تصنيف = navigate لصفحة جديدة
- زرار "رجوع" = يرجع لصفحة المتجر الأصلية
- في آخر الصفحة: اقتراحات منتجات من تصنيفات تانية

## الملفات والتغييرات

### 1. ملف جديد: `src/pages/CategoryProducts.tsx`
- صفحة مستقلة تستقبل `categoryId` من URL params
- تجلب بيانات التصنيف الرئيسي + تصنيفاته الفرعية من `store_categories`
- تجلب المنتجات اللي `category` بتاعتها تطابق أسماء التصنيفات الفرعية (عربي + إنجليزي)
- تعرض:
  - Header بالاسم + صورة التصنيف + زرار رجوع للمتجر
  - شريط بحث + فلترة بالسعر
  - Grid المنتجات
  - **قسم "منتجات قد تعجبك"**: يجلب 4-6 منتجات عشوائية من تصنيفات مختلفة
- نفس theme (light) ونفس `useCart` و `Layout` المستخدمين في Store

### 2. تعديل: `src/App.tsx`
- إضافة route جديد: `<Route path="/store/category/:categoryId" element={<CategoryProducts />} />`

### 3. تعديل: `src/components/store/ShopByCategories.tsx`
- تغيير `handleShopNow` من استدعاء `onCategorySelect` + scroll → إلى `navigate(`/store/category/${category.id}`)`
- حذف prop `onCategorySelect` (لم يعد مطلوب)

### 4. تعديل: `src/pages/Store.tsx`
- حذف `onCategorySelect` handler من `<ShopByCategories>` (أصبح التنقل داخلي في المكون)
- إبقاء باقي الصفحة كما هي (كل المنتجات + الفلاتر)

### 5. تعديل: `src/components/layout/Navbar.tsx` (اختياري)
- روابط Mega Menu للتصنيفات تشير لـ `/store/category/:id` بدل query params

## التفاصيل التقنية

```text
صفحة المتجر (/store)
  └── كل المنتجات + Shop By Categories cards
        │
        ▼ (click category card)
صفحة التصنيف (/store/category/:id)  ← صفحة جديدة
  ├── Header + breadcrumb (المتجر > اسم التصنيف)
  ├── منتجات التصنيف
  └── اقتراحات من تصنيفات أخرى
        │
        ▼ (back button / browser back)
صفحة المتجر (/store)  ← يرجع هنا مش الرئيسية
```

### صفحة التصنيف الجديدة ستشمل:
- `useEffect` لجلب التصنيف + subcategories بالـ ID
- `useQuery` لجلب المنتجات المفلترة
- `useQuery` ثاني لجلب منتجات مقترحة من تصنيفات أخرى (limit 6)
- نفس `ProductGrid` + `addToCart` المستخدمين حالياً
- Breadcrumb: المتجر › اسم التصنيف
- زرار "عرض الكل" يرجع لـ `/store`

