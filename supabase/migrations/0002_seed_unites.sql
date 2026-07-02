-- Données de démonstration (fictives) pour la table unites.
-- IDs fixes pour rester cohérents avec les ordres encore mockés côté front
-- (voir src/data/mockData.ts) tant que l'auth/profils réels ne sont pas branchés.

insert into unites (id, nom, type_unite, echelon, statut) values
  ('38da5f6c-8729-47a3-908e-cee7230097f4', 'PC GTIA SCORPION', 'pc', 'groupement', 'active'),
  ('f4db0ab3-ba18-4896-845c-84a78b88d7f3', 'BAT INF « SANGLIER »', 'infanterie', 'bataillon', 'active'),
  ('8e6008b2-b993-4c47-8ae4-fca69cfdafd4', 'CIE INF 2', 'infanterie', 'compagnie', 'active'),
  ('a930f5a5-93c6-4ecb-829c-7ce420465c92', 'CIE INF 3', 'infanterie', 'compagnie', 'active'),
  ('e18472b7-18a6-4d96-a41f-b412e5a0ab12', 'BAT ART « FOUDRE »', 'artillerie', 'bataillon', 'active'),
  ('547cdfef-cc96-49ab-b5ae-c4903ee52db7', 'SEC GÉNIE 1', 'genie', 'section', 'active'),
  ('e3018247-10c0-47fe-870e-b36a679d556d', 'CIE LOG « RELAIS »', 'logistique', 'compagnie', 'active'),
  ('ca5492d7-65b7-4e62-81bb-784a280e56ee', 'SEC INF 4', 'infanterie', 'section', 'active');

insert into positions (unite_id, geom, source, horodatage) values
  ('38da5f6c-8729-47a3-908e-cee7230097f4', geography(st_makepoint(-11.981, 18.019)), 'manuel', '2026-07-02 06:42:00+00'),
  ('f4db0ab3-ba18-4896-845c-84a78b88d7f3', geography(st_makepoint(-11.992, 18.031)), 'manuel', '2026-07-02 06:31:00+00'),
  ('8e6008b2-b993-4c47-8ae4-fca69cfdafd4', geography(st_makepoint(-11.997, 18.015)), 'manuel', '2026-07-02 06:29:00+00'),
  ('a930f5a5-93c6-4ecb-829c-7ce420465c92', geography(st_makepoint(-11.986, 18.007)), 'manuel', '2026-07-02 06:37:00+00'),
  ('e18472b7-18a6-4d96-a41f-b412e5a0ab12', geography(st_makepoint(-11.968, 18.032)), 'manuel', '2026-07-02 06:20:00+00'),
  ('547cdfef-cc96-49ab-b5ae-c4903ee52db7', geography(st_makepoint(-11.975, 18.010)), 'manuel', '2026-07-02 06:44:00+00'),
  ('e3018247-10c0-47fe-870e-b36a679d556d', geography(st_makepoint(-11.964, 18.005)), 'manuel', '2026-07-02 06:05:00+00'),
  ('ca5492d7-65b7-4e62-81bb-784a280e56ee', geography(st_makepoint(-11.958, 18.022)), 'manuel', '2026-07-02 06:40:00+00');
