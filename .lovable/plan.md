

# إصلاح وميض الثيم في المتصفحات الداخلية (Instagram/Facebook)

## المشكلة
المشكلة من مكانين:
1. **`next-themes` بيعمل hydration** وبيغير الثيم بعد ما الـ inline script خلاص طبّقه — ده بيعمل flash
2. **صفحة المتجر** بتفرض light theme وبترجّع dark لما تخرج منها — لو المستخدم جاي من المتجر للرئيسية، بيحصل وميض

## الحل

### 1. منع `next-themes` من عمل flash أثناء الـ hydration
- إضافة `disableTransitionOnChange` للـ ThemeProvider في `App.tsx`
- إضافة `suppressHydrationWarning` على الـ `html` element في `index.html`

### 2. إصلاح Store.tsx — ثيم أذكى
- بدل ما نفرض light theme على مستوى الموقع كله، نلف محتوى المتجر في `div` بكلاس `light` ونشيل الـ global theme switching
- أو على الأقل نحفظ الثيم السابق صح ونستعيده

### 3. إضافة CSS transition prevention
- إضافة كلاس `[data-theme-switching]` على `html` يمنع أي transitions أثناء تغيير الثيم

## الملفات المتأثرة

| ملف | تعديل |
|------|--------|
| `src/App.tsx` | إضافة `disableTransitionOnChange` للـ ThemeProvider |
| `index.html` | إضافة `suppressHydrationWarning` |
| `src/index.css` | إضافة CSS لمنع الـ transition أثناء تغيير الثيم |
| `src/pages/Store.tsx` | إصلاح theme switching ليكون أنعم |
| `src/pages/Packages.tsx` | نفس الإصلاح |

