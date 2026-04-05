

## المشكلة

صفحة المتجر (`Store.tsx`) وصفحة التصنيفات (`CategoryProducts.tsx`) تستخدم `ProductGrid` لعرض المنتجات. لكن `ProductGrid` **لا يستخدم** `ProductImageSlider` ولا يجلب الصور الإضافية من جدول `product_images` — بيعرض فقط `product.image_url` (الصورة الرئيسية).

الكومبوننت `ProductCard` اللي فيه `ProductImageSlider` **مش مستخدم في أي مكان** في المشروع حالياً.

## الحل

### تعديل `src/components/store/ProductGrid.tsx`

استبدال عرض الصورة الثابتة (`<img>`) في كل كارت منتج بـ:
1. **جلب الصور الإضافية** من `product_images` لكل منتج
2. **استخدام `ProductImageSlider`** بدل الـ `<img>` العادية

**التعديل المحدد:**
- إضافة state + useEffect لجلب كل الصور الإضافية للمنتجات المعروضة (batch query واحد بدل query لكل منتج)
- استبدال الـ `<motion.img>` الحالي (سطر 112-118) بـ `<ProductImageSlider images={additionalImages} mainImage={product.image_url} productName={product.name} />`

### النتيجة
- الصور الإضافية هتظهر في كارت المنتج مع أسهم تنقل ونقاط (dots)
- نفس السلوك الموجود حالياً في صفحة تفاصيل المنتج (`ProductDetail`)

