-- Remontée hiérarchique : un commandant voit aussi les ordres de ses
-- unités filles (directes et indirectes), pas seulement de sa propre unité.
-- Testable maintenant que la hiérarchie existe (0010) et qu'il y a
-- plusieurs comptes réels à différents échelons.

create or replace function mes_unites_et_descendantes() returns table(id uuid)
language sql security definer stable as $$
  with recursive descendantes as (
    select u.id from unites u where u.id = mon_unite_id()
    union all
    select u.id from unites u inner join descendantes d on u.unite_parent_id = d.id
  )
  select id from descendantes
$$;

create or replace function mon_unite_est_destinataire(p_ordre_id uuid) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from ordres_destinataires od
    where od.ordre_id = p_ordre_id
      and od.unite_destinataire_id in (select id from mes_unites_et_descendantes())
  )
$$;

drop policy "ordres visibles si emetteur ou destinataire" on ordres;
create policy "ordres visibles si emetteur/destinataire, soi ou unites filles"
  on ordres for select
  using (
    unite_emettrice_id in (select id from mes_unites_et_descendantes())
    or mon_unite_est_destinataire(id)
  );

drop policy "destinataires visibles si concerne" on ordres_destinataires;
create policy "destinataires visibles si concerne, soi ou unites filles"
  on ordres_destinataires for select
  using (
    unite_destinataire_id in (select id from mes_unites_et_descendantes())
    or unite_emettrice_de(ordre_id) in (select id from mes_unites_et_descendantes())
  );

-- La création d'ordre reste stricte (pas hiérarchique) : on ne peut émettre
-- qu'au nom de sa propre unité, pas de celle d'un subordonné.
