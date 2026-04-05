

## المشكلة
جدول `store_categories` في قاعدة البيانات **مفيهوش عمود وصف** (`description` / `description_ar`). لذلك:
1. مفيش مكان لكتابة وصف متعدد الفقرات
2. حتى لو كتبت وصف، مفيش مكان يتخزن فيه ولا يتعرض

## الحل

### 1. إضافة أعمدة الوصف لقاعدة البيانات (Migration)
```sql
ALTER TABLE store_categories 
ADD COLUMN description TEXT DEFAULT NULL,
ADD COLUMN description_ar TEXT DEFAULT NULL;
```

### 2. تعديل فورم الأدمن (`CategoriesSection.tsx`)
- إضافة `description` و `description_ar` للـ `formData`
- إضافة حقل `<Textarea>` لكل وصف (إنجليزي + عربي) في فورم الإضافة/التعديل
- الـ Textarea يدعم كتابة فقرات متعددة (multi-line)
- تحديث `saveCategory` و `updateCategory` ليرسلوا الوصف لقاعدة البيانات

### 3. عرض الوصف في المتجر
- **`ShopByCategories.tsx`**: عرض وصف مختصر تحت اسم التصنيف على الكارت
- **`CategoryProducts.tsx`**: عرض الوصف الكامل في هيدر صفحة التصنيف تحت الاسم
- الوصف يتعرض بـ `whitespace-pre-line` عشان الفقرات المتعددة تظهر صح

### التفاصيل التقنية
- الوصف يُخزن كـ `TEXT` (بدون حد أقصى) عشان يدعم فقرات متعددة
- `whitespace-pre-line` في CSS بيحافظ على الأسطر الجديدة اللي المستخدم كتبها
- كل الأماكن اللي بتعرض التصنيفات هتجيب الوصف من الداتابيز وتعرضه

