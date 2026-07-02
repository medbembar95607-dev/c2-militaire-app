-- Ordres de démonstration, mêmes contenus que ceux affichés jusqu'ici côté
-- mock front. emetteur_id = profil de LCL Moreau quand l'unité émettrice
-- est la sienne (PC GTIA SCORPION) ; laissé NULL pour FRAGO 13 (émis par
-- BAT ART FOUDRE, qui n'a pas encore de profil réel/utilisateur associé).

insert into ordres (id, titre, contenu, type_ordre, priorite, statut, unite_emettrice_id, emetteur_id) values
  ('3f905657-44c6-4654-afa4-345c37dfae54', 'OPORD 04 – Prise de zone Orion',
   'Prise de la zone Orion selon dispositif joint. Bataillon Sanglier en tête, Bataillon Foudre en appui, Cie Log Relais en soutien logistique à l''arrière.',
   'OPORD', 'normal', 'envoye', '38da5f6c-8729-47a3-908e-cee7230097f4', 'b9fc2f6f-ce4e-4cd9-9461-f80d1d361544'),
  ('717e81b9-3287-4333-ad31-da71cb60ac27', 'FRAGO 12 – Repli Sec Génie 1',
   'Repli immédiat de la Section Génie 1 vers le PC GTIA Scorpion suite à évolution de la situation sur PL Rouge.',
   'FRAGO', 'urgent', 'envoye', '38da5f6c-8729-47a3-908e-cee7230097f4', 'b9fc2f6f-ce4e-4cd9-9461-f80d1d361544'),
  ('b08a57ad-c7be-4a72-8627-cf4decd31e98', 'WARNO – Reconnaissance axe nord',
   'Préparer une reconnaissance de l''axe nord avec CIE INF 2 et CIE INF 3. Ordre détaillé à suivre.',
   'WARNO', 'normal', 'envoye', '38da5f6c-8729-47a3-908e-cee7230097f4', 'b9fc2f6f-ce4e-4cd9-9461-f80d1d361544'),
  ('4ca031bf-7bdd-470a-afeb-3222a4d9b6bd', 'FRAGO 13 – Appui feu sur PL Rouge',
   'Appui feu demandé sur PL Rouge en soutien du Bataillon Sanglier. Priorité flash.',
   'FRAGO', 'flash', 'envoye', 'e18472b7-18a6-4d96-a41f-b412e5a0ab12', null),
  ('25f77c0d-b62f-400d-a5ec-916a68ef4785', 'OPORD 05 – Relève Sec Inf 4',
   'Relève de la Section INF 4 prévue en fin de créneau H+06:00. Modalités à préciser.',
   'OPORD', 'normal', 'brouillon', '38da5f6c-8729-47a3-908e-cee7230097f4', 'b9fc2f6f-ce4e-4cd9-9461-f80d1d361544');

insert into ordres_destinataires (ordre_id, unite_destinataire_id, statut) values
  ('3f905657-44c6-4654-afa4-345c37dfae54', 'f4db0ab3-ba18-4896-845c-84a78b88d7f3', 'accuse'),
  ('3f905657-44c6-4654-afa4-345c37dfae54', 'e18472b7-18a6-4d96-a41f-b412e5a0ab12', 'recu'),
  ('3f905657-44c6-4654-afa4-345c37dfae54', 'e3018247-10c0-47fe-870e-b36a679d556d', 'envoye'),
  ('717e81b9-3287-4333-ad31-da71cb60ac27', '547cdfef-cc96-49ab-b5ae-c4903ee52db7', 'accuse'),
  ('b08a57ad-c7be-4a72-8627-cf4decd31e98', '8e6008b2-b993-4c47-8ae4-fca69cfdafd4', 'recu'),
  ('b08a57ad-c7be-4a72-8627-cf4decd31e98', 'a930f5a5-93c6-4ecb-829c-7ce420465c92', 'envoye'),
  ('4ca031bf-7bdd-470a-afeb-3222a4d9b6bd', '38da5f6c-8729-47a3-908e-cee7230097f4', 'accuse'),
  ('25f77c0d-b62f-400d-a5ec-916a68ef4785', 'ca5492d7-65b7-4e62-81bb-784a280e56ee', 'envoye');
