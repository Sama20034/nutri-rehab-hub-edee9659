
المشكلة اللي باينة من الكود الحالي مش نقطة واحدة، لكن 4 أسباب مترابطة:
1) `useCart` مش global state (بيتنده في Navbar + Store + Checkout كـ instances منفصلة)  
2) `hasSynced` بيتحسب مرة واحدة ومش مربوط بتغيّر المستخدم (guest → logged-in)  
3) `syncGuestCartToDb` بيبلع الأخطاء ثم بيمسح `localStorage` حتى لو المزامنة فشلت  
4) `Checkout/Store` بيحوّل المصدر مباشرة لـ DB لما `user` يظهر، فممكن يشوف سلة فاضية لحظيًا قبل المزامنة

الخطة المقترحة (تنفيذ مباشر بدون تغييرات DB):
- إعادة هيكلة `src/hooks/useCart.tsx` ليكون **Cart Provider + shared context** (singleton) بدل hook state منفصل.
- إضافة state machine واضحة:
  - `authReady`
  - `syncStatus: idle | syncing | synced | error`
  - `isCartReady` (عشان الصفحات ما تعتبرش السلة فاضية بدري)
- إصلاح merge logic:
  - مزامنة guest cart إلى `cart_items` بشكل آمن
  - عدم مسح `guest_cart` إلا بعد نجاح كامل
  - في حالة الفشل: الاحتفاظ بالسلة المحلية + retry لاحق + toast واضح
- إزالة ازدواجية جلب السلة من `Store.tsx` و`Checkout.tsx` (مصدر واحد من `useCart`)
- تحديث `Navbar.tsx` لاستخدام `cartCount` من نفس الـ context بدل query منفصل
- تعديل redirect logic في `Checkout.tsx`: ما يحصلش “Cart is empty” إلا بعد `isCartReady === true`
- الإبقاء على guest browsing + guest checkout، ومع تسجيل الدخول يتم الدمج تلقائيًا بدون فقدان عناصر

الملفات المستهدفة:
- `src/hooks/useCart.tsx` (إعادة بناء المنطق)
- `src/App.tsx` (لف التطبيق بـ `CartProvider`)
- `src/components/layout/Navbar.tsx`
- `src/pages/Store.tsx`
- `src/pages/Checkout.tsx`

التفاصيل التقنية المختصرة:
- استبدال `hasSynced` boolean بـ tracking مرتبط بـ `user.id` + sync state.
- منع race condition عبر gating (`authReady` + `isCartReady`).
- توحيد read/write/update/remove على نفس مصدر بيانات موحّد داخل provider.
- لا حاجة لأي migration أو تعديل RLS حاليًا.

معيار النجاح بعد التنفيذ:
1) ضيف يضيف منتجات → يفتح السلة بدون تسجيل دخول  
2) بعد تسجيل الدخول في نفس الجلسة: نفس المنتجات تظهر (ممشط/merged)  
3) ما فيش حالة “سلة فاضية” خاطئة أثناء الانتقال  
4) العداد في Navbar يطابق نفس عناصر السلة دائمًا  
5) اختبار end-to-end: Guest add → login → checkout بدون فقدان بيانات
