-- Compte de démonstration créé via l'API Admin Auth (pas de SQL direct sur
-- auth.users) : lcl.moreau@gtia-scorpion.demo, id b9fc2f6f-ce4e-4cd9-9461-f80d1d361544
-- Ce fichier ne recrée que le profil applicatif lié.
insert into profils (id, nom_complet, grade, role, unite_id) values
  ('b9fc2f6f-ce4e-4cd9-9461-f80d1d361544', 'LCL Moreau', 'Lieutenant-colonel', 'commandant', '38da5f6c-8729-47a3-908e-cee7230097f4');
