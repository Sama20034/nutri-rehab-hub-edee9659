

# إصلاح النظام اليومي - عرض بيانات الوجبات الحقيقية للعملاء

## المشكلة
تاب "اليومي" في قسم التغذية بيعرض **بيانات ثابتة (demo)** دايماً ومش بيستخدم بيانات الوجبات الحقيقية المحفوظة في `mealPlans` اللي بتتجاب من `client_meal_plans`. السطر 376 بيعمل `demoMeals.find(m => m.type === type)` بدل ما يستخدم الـ meal plans الفعلية.

## الحل
تعديل `src/components/dashboard/sections/NutritionSection.tsx`:

1. **ربط اليوم المحدد بالبيانات الحقيقية**: فلترة `mealPlans` حسب `day_number === selectedDay` للحصول على وجبات اليوم الفعلية.

2. **عرض الوجبات الحقيقية بدل الـ demo**: لو فيه meal plan لليوم المحدد، نعرض بيانات `breakfast`, `lunch`, `dinner`, `snacks` منه. لو مفيش، نعرض رسالة "لا يوجد نظام لهذا اليوم" بدل الـ demo data.

3. **تحديث السعرات الإجمالية**: عرض `total_calories` الحقيقي من الـ meal plan بدل القيم الثابتة (1500/1800).

4. **إزالة الـ demo data** من تاب اليومي (الـ demo recipes تفضل في تاب الوصفات كـ fallback).

## الملف المتأثر
| ملف | تعديل |
|------|--------|
| `src/components/dashboard/sections/NutritionSection.tsx` | استبدال الـ demo meals بالبيانات الحقيقية من `mealPlans` في تاب "اليومي" |

