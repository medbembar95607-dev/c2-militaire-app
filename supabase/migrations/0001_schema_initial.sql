-- Schéma initial v1 — voir livrables/cadrage-app-c2/03-donnees/modele-donnees.md
-- Applique le modèle validé le 2026-07-02.

create extension if not exists postgis;

create table unites (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type_unite text not null check (type_unite in ('pc','infanterie','artillerie','genie','logistique')),
  echelon text not null check (echelon in ('groupement','bataillon','compagnie','section')),
  unite_parent_id uuid references unites(id),
  statut text not null default 'active' check (statut in ('active','dissoute','en_reserve')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table positions (
  id uuid primary key default gen_random_uuid(),
  unite_id uuid not null references unites(id),
  geom geography(point, 4326) not null,
  altitude numeric,
  cap numeric,
  source text not null default 'manuel' check (source in ('manuel','gps','estime')),
  saisie_par uuid references auth.users(id),
  horodatage timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index positions_unite_horodatage_idx on positions (unite_id, horodatage desc);
create index positions_geom_idx on positions using gist (geom);

create table profils (
  id uuid primary key references auth.users(id),
  nom_complet text,
  grade text,
  role text check (role in ('admin','commandant','officier_operations','operateur','observateur')),
  unite_id uuid references unites(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ordres (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  contenu text not null,
  type_ordre text not null check (type_ordre in ('OPORD','FRAGO','WARNO')),
  priorite text not null default 'normal' check (priorite in ('normal','urgent','flash')),
  statut text not null default 'brouillon' check (statut in ('brouillon','envoye','annule')),
  unite_emettrice_id uuid not null references unites(id),
  emetteur_id uuid references profils(id),
  position_reference geography(point, 4326),
  date_limite_execution timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ordres_destinataires (
  ordre_id uuid not null references ordres(id) on delete cascade,
  unite_destinataire_id uuid not null references unites(id),
  statut text not null default 'envoye' check (statut in ('envoye','recu','accuse','execute')),
  accuse_par uuid references profils(id),
  date_statut timestamptz not null default now(),
  primary key (ordre_id, unite_destinataire_id)
);

alter table unites enable row level security;
alter table positions enable row level security;
alter table profils enable row level security;
alter table ordres enable row level security;
alter table ordres_destinataires enable row level security;

-- Policy provisoire : le roster d'unités n'est pas sensible (données fictives)
-- et il n'y a pas encore d'authentification en place. À remplacer par une
-- policy scoped à la chaîne de commandement une fois l'écran de connexion
-- et les profils réels branchés (voir livrables/cadrage-app-c2/02-architecture/decisions.md).
create policy "lecture publique unites (prototype, avant auth)"
  on unites for select
  using (true);

-- positions/profils/ordres/ordres_destinataires : RLS activée, aucune policy
-- pour l'instant -> verrouillées tant que l'auth et les vraies policies ne
-- sont pas en place.
