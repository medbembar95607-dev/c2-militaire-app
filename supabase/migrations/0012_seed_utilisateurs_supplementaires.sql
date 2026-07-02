-- Comptes créés via l'API Admin Auth (pas de SQL direct sur auth.users),
-- un par unité restante, pour pouvoir tester la visibilité hiérarchique
-- des ordres avec plusieurs vrais utilisateurs à différents échelons.
insert into profils (id, nom_complet, grade, role, unite_id) values
  ('ff22846b-48b2-4f6f-93ce-5d61c77ce65c', 'CDT Lefèvre', 'Commandant', 'commandant', 'f4db0ab3-ba18-4896-845c-84a78b88d7f3'),
  ('63b4ef6a-67d9-420c-be67-499dcb9861c4', 'CNE Dubois', 'Capitaine', 'commandant', '8e6008b2-b993-4c47-8ae4-fca69cfdafd4'),
  ('e1212249-af64-4e91-8a65-f3bfa399bcbc', 'CNE Petit', 'Capitaine', 'commandant', 'a930f5a5-93c6-4ecb-829c-7ce420465c92'),
  ('4cf88a1d-6b46-44c6-a025-1800dc78fcd9', 'CDT Rousseau', 'Commandant', 'commandant', 'e18472b7-18a6-4d96-a41f-b412e5a0ab12'),
  ('12db4304-6218-463c-ae3b-3bf6177c103e', 'LTN Girard', 'Lieutenant', 'commandant', '547cdfef-cc96-49ab-b5ae-c4903ee52db7'),
  ('b5f362d3-66f3-48b3-a1d0-80c88b810b79', 'CNE Bernard', 'Capitaine', 'commandant', 'e3018247-10c0-47fe-870e-b36a679d556d'),
  ('f6c6341f-d88b-49c7-bb0f-75e46a62e589', 'SLT Morel', 'Sous-lieutenant', 'commandant', 'ca5492d7-65b7-4e62-81bb-784a280e56ee');
