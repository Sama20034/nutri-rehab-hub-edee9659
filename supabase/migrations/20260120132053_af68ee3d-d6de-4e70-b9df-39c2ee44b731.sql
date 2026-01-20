-- Insert the original transformation stories with the existing images
INSERT INTO public.transformations (title, client_name, weight_before, weight_after, duration_text, before_image_url, after_image_url, is_combined_image, rating, is_active, display_order, use_emoji_mask, description)
VALUES 
  ('تحول أحمد', 'أحمد محمد', 95, 72, '3 أشهر', '/assets/transformation-before.png', '/assets/transformation-after.png', false, 5, true, 1, true, 'قصة نجاح مذهلة'),
  ('تحول سارة', 'سارة علي', 85, 62, '4 أشهر', '/assets/transformation2-before.png', '/assets/transformation2-after.png', false, 5, true, 2, true, 'رحلة تحول رائعة'),
  ('تحول محمد', 'محمد خالد', 110, 82, '6 أشهر', '/assets/transformation3-before.png', '/assets/transformation3-after.png', false, 5, true, 3, true, 'إنجاز كبير'),
  ('تحول نور', 'نور حسن', 78, 58, '3 أشهر', '/assets/transformation4-before.png', '/assets/transformation4-after.png', false, 5, true, 4, true, 'تحول سريع ومذهل'),
  ('تحول كريم', 'كريم أحمد', 102, 78, '5 أشهر', '/assets/transformation5-before.png', '/assets/transformation5-after.png', false, 5, true, 5, true, 'نتائج رائعة'),
  ('تحول ياسمين', 'ياسمين محمود', 88, 65, '4 أشهر', '/assets/transformation6-before.png', '/assets/transformation6-after.png', false, 5, true, 6, true, 'تحول مميز'),
  ('تحول مشترك', 'عميل مميز', 100, 75, '4 أشهر', '/assets/transformation7-combined.png', NULL, true, 5, true, 7, true, 'صورة قبل وبعد مجمعة');