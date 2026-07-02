-- Bug trouvé en testant l'app réelle : "infinite recursion detected in
-- policy for relation ordres_destinataires". Les policies de 0007 se
-- référençaient mutuellement (ordres -> ordres_destinataires -> ordres) via
-- des sous-requêtes EXISTS directes, ce que Postgres ne supporte pas quand
-- une même requête touche les deux tables (cas de notre embed
-- ordres+ordres_destinataires). Fix standard : passer par des fonctions
-- SECURITY DEFINER qui contournent la RLS de la table qu'elles interrogent,
-- ce qui casse la boucle.

create or replace function mon_unite_est_destinataire(p_ordre_id uuid) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from ordres_destinataires
    where ordre_id = p_ordre_id and unite_destinataire_id = mon_unite_id()
  )
$$;

create or replace function unite_emettrice_de(p_ordre_id uuid) returns uuid
language sql security definer stable as $$
  select unite_emettrice_id from ordres where id = p_ordre_id
$$;

drop policy "ordres visibles si emetteur ou destinataire" on ordres;
create policy "ordres visibles si emetteur ou destinataire"
  on ordres for select
  using (
    unite_emettrice_id = mon_unite_id()
    or mon_unite_est_destinataire(id)
  );

drop policy "destinataires visibles si concerne" on ordres_destinataires;
create policy "destinataires visibles si concerne"
  on ordres_destinataires for select
  using (
    unite_destinataire_id = mon_unite_id()
    or unite_emettrice_de(ordre_id) = mon_unite_id()
  );

drop policy "creation destinataire par l'emetteur de l'ordre" on ordres_destinataires;
create policy "creation destinataire par l'emetteur de l'ordre"
  on ordres_destinataires for insert
  with check (unite_emettrice_de(ordre_id) = mon_unite_id());
