

# إصلاح مشكلة فقدان التركيز في حقول إدخال التصنيفات

## المشكلة
`CategoryForm` معرّف كـ component داخل `CategoriesSection`. كل ما المستخدم يكتب حرف، `formData` state بتتغير → الـ parent بيعمل re-render → `CategoryForm` بيتعمل من أول وجديد كـ component جديد → الـ input بيفقد الـ focus.

## الحل
تحويل `CategoryForm` من component داخلي إلى JSX مباشر (inline) داخل الـ Dialog، أو استخراجه كـ component منفصل بره `CategoriesSection` ويستقبل `formData` و `setFormData` كـ props.

**الأبسط**: تحويل `CategoryForm()` إلى JSX مباشر في مكان استدعائه (في الـ Add Dialog و Edit Dialog) بدل ما يكون function component.

## الملف المتأثر
| ملف | تعديل |
|------|--------|
| `src/components/admin/sections/CategoriesSection.tsx` | استبدال `<CategoryForm />` بالـ JSX مباشرة في الـ Dialogs |

