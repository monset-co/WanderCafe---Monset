-- Run ONCE in the DASHBOARD's Supabase project › SQL Editor (the same project the dashboard uses).
-- Adds the What's New items to Inventory so the website can sell them and the POS can ring them up.
-- Codes must match `code` in src/data/menu.js. Safe to re-run: existing codes are left alone.
-- Afterwards set each item's food cost in the dashboard (Inventory) so profit is real.
insert into public.products (code, name, category, kind, selling_price, sort) values
  ('NW01', 'Homestyle Chicken',          'What''s New', 'made', 165, 1),
  ('NW02', 'Crispy Pata (ala carte)',    'What''s New', 'made', 665, 2),
  ('NW03', 'Crispy Pata Group Meal',     'What''s New', 'made', 799, 3),
  ('NW04', 'Vietnamese Salad',           'What''s New', 'made', 249, 4),
  ('NW05', 'Crispy Lumpia',              'What''s New', 'made', 129, 5)
on conflict (code) do nothing;
