-- Update products to use correct subcategory names
UPDATE products SET category = 'Proteins' WHERE name ILIKE '%protein%' AND name NOT ILIKE '%bar%';
UPDATE products SET category = 'Omega & Fish Oil' WHERE name ILIKE '%omega%' OR name ILIKE '%fish oil%';
UPDATE products SET category = 'Vitamins & Minerals' WHERE name ILIKE '%vitamin%' OR name ILIKE '%multivitamin%';
UPDATE products SET category = 'Bcaa & Recovery' WHERE name ILIKE '%bcaa%';
UPDATE products SET category = 'Creatine' WHERE name ILIKE '%creatine%';