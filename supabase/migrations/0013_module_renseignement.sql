-- Module Renseignement (v1.1) : menaces et observations sur la carte.
-- Voir livrables/cadrage-app-c2/03-donnees/modele-donnees.md, section Renseignement.

create table renseignements (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text not null default '',
  type_menace text not null check (type_menace in ('infanterie','blinde','artillerie','reconnaissance','engin_explosif','inconnu')),
  affiliation text not null default 'hostile' check (affiliation in ('hostile','suspect','inconnu')),
  source text not null check (source in ('observation','humint','sigint','imint','osint')),
  -- Cotation OTAN (code amirauté) : fiabilité de la source A-F, crédibilité de l'info 1-6.
  fiabilite_source char(1) not null check (fiabilite_source in ('A','B','C','D','E','F')),
  credibilite_info smallint not null check (credibilite_info between 1 and 6),
  statut text not null default 'actif' check (statut in ('actif','neutralise','perime')),
  geom geography(point, 4326) not null,
  horodatage_observation timestamptz not null default now(),
  unite_source_id uuid not null references unites(id),
  saisi_par uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index renseignements_geom_idx on renseignements using gist (geom);
create index renseignements_statut_idx on renseignements (statut, horodatage_observation desc);

alter table renseignements enable row level security;

-- La situation ennemie est partagée par tout le dispositif (même logique que
-- le suivi de force amie) : tout utilisateur authentifié la lit.
create policy "lecture renseignements par utilisateur authentifie"
  on renseignements for select
  using (auth.role() = 'authenticated');

-- On ne saisit un renseignement qu'au nom de sa propre unité.
create policy "saisie renseignement par son unite"
  on renseignements for insert
  with check (unite_source_id = mon_unite_id() and saisi_par = auth.uid());

-- Mise à jour (ex. statut neutralisé/périmé) par l'unité source ou sa
-- chaîne de commandement au-dessus d'elle.
create policy "mise a jour renseignement par son unite ou ses chefs"
  on renseignements for update
  using (unite_source_id in (select id from mes_unites_et_descendantes()))
  with check (unite_source_id in (select id from mes_unites_et_descendantes()));

-- Lon/lat exposés en colonnes simples pour l'API (même principe que 0004).
create view renseignements_carte with (security_invoker = true) as
  select r.*, st_x(r.geom::geometry) as lon, st_y(r.geom::geometry) as lat
  from renseignements r;

-- Données de démonstration (fictives), au nord de PL ROUGE.
insert into renseignements (titre, description, type_menace, affiliation, source, fiabilite_source, credibilite_info, statut, geom, horodatage_observation, unite_source_id) values
  ('Section d''infanterie ennemie retranchée',
   'Une vingtaine de combattants observés en position défensive sur la crête nord. Armement léger, au moins une mitrailleuse.',
   'infanterie', 'hostile', 'observation', 'A', 2, 'actif',
   geography(st_makepoint(-11.990, 18.041)), '2026-07-02 05:55:00+00', 'f4db0ab3-ba18-4896-845c-84a78b88d7f3'),
  ('Peloton blindé en mouvement vers le sud',
   'Trois à quatre véhicules blindés à roues détectés sur imagerie, cap estimé vers PL ROUGE.',
   'blinde', 'hostile', 'imint', 'B', 2, 'actif',
   geography(st_makepoint(-11.972, 18.045)), '2026-07-02 06:10:00+00', '38da5f6c-8729-47a3-908e-cee7230097f4'),
  ('Batterie d''artillerie suspectée',
   'Émissions radio caractéristiques d''un réseau de conduite de tir. Position non confirmée visuellement.',
   'artillerie', 'suspect', 'sigint', 'C', 3, 'actif',
   geography(st_makepoint(-11.951, 18.049)), '2026-07-02 05:40:00+00', 'e18472b7-18a6-4d96-a41f-b412e5a0ab12'),
  ('Engin explosif improvisé sur l''axe nord',
   'Terre fraîchement remuée et fil apparent en bord de piste, signalé par un habitant. Contourner jusqu''à intervention du génie.',
   'engin_explosif', 'hostile', 'humint', 'B', 3, 'actif',
   geography(st_makepoint(-11.996, 18.037)), '2026-07-02 06:25:00+00', '8e6008b2-b993-4c47-8ae4-fca69cfdafd4'),
  ('Véhicules non identifiés à l''ouest',
   'Deux pick-ups signalés sur les réseaux sociaux locaux. Affiliation inconnue.',
   'inconnu', 'inconnu', 'osint', 'D', 4, 'actif',
   geography(st_makepoint(-12.012, 18.028)), '2026-07-02 04:50:00+00', '38da5f6c-8729-47a3-908e-cee7230097f4'),
  ('Patrouille de reconnaissance ennemie',
   'Patrouille de 4 hommes repérée la veille, non revue depuis.',
   'reconnaissance', 'hostile', 'observation', 'A', 3, 'perime',
   geography(st_makepoint(-11.960, 18.040)), '2026-07-01 18:20:00+00', 'ca5492d7-65b7-4e62-81bb-784a280e56ee');
