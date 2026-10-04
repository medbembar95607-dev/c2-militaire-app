-- Module Logistique (v1.1) : niveaux de stocks par unité et demandes de ravitaillement.
-- Voir livrables/cadrage-app-c2/03-donnees/modele-donnees.md, section Logistique.

create table stocks (
  id uuid primary key default gen_random_uuid(),
  unite_id uuid not null references unites(id),
  ressource text not null check (ressource in ('carburant','munitions','eau','vivres','sante')),
  quantite numeric not null check (quantite >= 0),
  capacite numeric not null check (capacite > 0),
  unite_mesure text not null,
  mis_a_jour_par uuid references auth.users(id),
  mis_a_jour_le timestamptz not null default now(),
  unique (unite_id, ressource),
  check (quantite <= capacite)
);

create table demandes_ravitaillement (
  id uuid primary key default gen_random_uuid(),
  unite_demandeuse_id uuid not null references unites(id),
  ressource text not null check (ressource in ('carburant','munitions','eau','vivres','sante')),
  quantite numeric not null check (quantite > 0),
  priorite text not null default 'routine' check (priorite in ('routine','urgent','vital')),
  statut text not null default 'demandee' check (statut in ('demandee','en_cours','livree','refusee')),
  commentaire text not null default '',
  demandeur_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index demandes_ravitaillement_statut_idx on demandes_ravitaillement (statut, created_at desc);

alter table stocks enable row level security;
alter table demandes_ravitaillement enable row level security;

create or replace function mon_unite_est_logistique() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from unites where id = mon_unite_id() and type_unite = 'logistique')
$$;

-- Stocks : visibles par tout le dispositif (le commandement et la logistique
-- doivent voir l'ensemble), mis à jour uniquement par l'unité elle-même
-- (compte rendu de ses propres niveaux).
create policy "lecture stocks par utilisateur authentifie"
  on stocks for select
  using (auth.role() = 'authenticated');

create policy "mise a jour de ses propres stocks"
  on stocks for update
  using (unite_id = mon_unite_id())
  with check (unite_id = mon_unite_id());

-- Demandes : visibles par l'unité demandeuse, sa chaîne de commandement et
-- les unités logistiques qui les traitent.
create policy "demandes visibles par la chaine et la logistique"
  on demandes_ravitaillement for select
  using (
    unite_demandeuse_id in (select id from mes_unites_et_descendantes())
    or mon_unite_est_logistique()
  );

create policy "demande au nom de son unite"
  on demandes_ravitaillement for insert
  with check (
    unite_demandeuse_id = mon_unite_id()
    and demandeur_id = auth.uid()
    and statut = 'demandee'
  );

-- La logistique prend en charge ou refuse. La livraison passe par
-- livrer_demande() pour mettre à jour le stock dans la même transaction.
create policy "prise en charge ou refus par la logistique"
  on demandes_ravitaillement for update
  using (mon_unite_est_logistique() and statut in ('demandee','en_cours'))
  with check (mon_unite_est_logistique() and statut in ('en_cours','refusee'));

-- Livraison : marque la demande livrée et crédite le stock de l'unité
-- demandeuse (plafonné à sa capacité). Réservée aux unités logistiques.
create or replace function livrer_demande(p_demande_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  d demandes_ravitaillement;
begin
  if not mon_unite_est_logistique() then
    raise exception 'Seule une unité logistique peut livrer une demande';
  end if;

  select * into d from demandes_ravitaillement where id = p_demande_id for update;
  if d.id is null then
    raise exception 'Demande introuvable';
  end if;
  if d.statut not in ('demandee','en_cours') then
    raise exception 'Demande déjà clôturée (%)', d.statut;
  end if;

  update stocks
    set quantite = least(capacite, quantite + d.quantite),
        mis_a_jour_par = auth.uid(),
        mis_a_jour_le = now()
    where unite_id = d.unite_demandeuse_id and ressource = d.ressource;

  update demandes_ravitaillement
    set statut = 'livree', updated_at = now()
    where id = p_demande_id;
end;
$$;

revoke execute on function livrer_demande(uuid) from public, anon;
grant execute on function livrer_demande(uuid) to authenticated;

-- Données de démonstration (fictives).
-- Capacité = capacité de base de la ressource x coefficient d'échelon.
with base(ressource, capacite, unite_mesure) as (
  values ('carburant', 2000, 'L'), ('munitions', 20, 'lots'), ('eau', 1000, 'L'),
         ('vivres', 300, 'rations'), ('sante', 10, 'lots')
),
niveaux(unite_id, coef, carburant, munitions, eau, vivres, sante) as (
  values
    ('38da5f6c-8729-47a3-908e-cee7230097f4'::uuid, 4, 80, 90, 75, 85, 90), -- PC GTIA SCORPION
    ('f4db0ab3-ba18-4896-845c-84a78b88d7f3'::uuid, 3, 65, 55, 60, 70, 80), -- BAT INF SANGLIER
    ('8e6008b2-b993-4c47-8ae4-fca69cfdafd4'::uuid, 2, 55, 40, 45, 60, 70), -- CIE INF 2
    ('a930f5a5-93c6-4ecb-829c-7ce420465c92'::uuid, 2, 70, 60, 35, 55, 75), -- CIE INF 3
    ('e18472b7-18a6-4d96-a41f-b412e5a0ab12'::uuid, 3, 60, 22, 70, 65, 85), -- BAT ART FOUDRE (munitions critiques)
    ('547cdfef-cc96-49ab-b5ae-c4903ee52db7'::uuid, 1, 18, 70, 55, 50, 60), -- SEC GÉNIE 1 (carburant critique)
    ('e3018247-10c0-47fe-870e-b36a679d556d'::uuid, 3, 90, 85, 90, 95, 90), -- CIE LOG RELAIS
    ('ca5492d7-65b7-4e62-81bb-784a280e56ee'::uuid, 1, 45, 50, 15, 40, 30)  -- SEC INF 4 (eau critique)
)
insert into stocks (unite_id, ressource, quantite, capacite, unite_mesure, mis_a_jour_le)
select n.unite_id, b.ressource,
       round(b.capacite * n.coef * case b.ressource
         when 'carburant' then n.carburant when 'munitions' then n.munitions
         when 'eau' then n.eau when 'vivres' then n.vivres else n.sante end / 100.0),
       b.capacite * n.coef, b.unite_mesure, '2026-07-02 06:00:00+00'
from niveaux n cross join base b;

insert into demandes_ravitaillement (unite_demandeuse_id, ressource, quantite, priorite, statut, commentaire, created_at, updated_at) values
  ('e18472b7-18a6-4d96-a41f-b412e5a0ab12', 'munitions', 30, 'urgent', 'en_cours',
   'Recomplètement avant l''appui feu sur PL ROUGE.', '2026-07-02 05:30:00+00', '2026-07-02 05:50:00+00'),
  ('ca5492d7-65b7-4e62-81bb-784a280e56ee', 'eau', 700, 'vital', 'demandee',
   'Section isolée, réserve d''eau pour moins de 12 h.', '2026-07-02 06:15:00+00', '2026-07-02 06:15:00+00'),
  ('547cdfef-cc96-49ab-b5ae-c4903ee52db7', 'carburant', 1200, 'urgent', 'demandee',
   'Engins de franchissement à l''arrêt sans complément.', '2026-07-02 06:35:00+00', '2026-07-02 06:35:00+00'),
  ('8e6008b2-b993-4c47-8ae4-fca69cfdafd4', 'vivres', 200, 'routine', 'livree',
   '', '2026-07-01 17:00:00+00', '2026-07-01 21:30:00+00');
