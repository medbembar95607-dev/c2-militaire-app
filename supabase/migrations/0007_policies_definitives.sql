-- Remplace les policies "prototype, avant auth" par des règles définitives
-- maintenant que l'authentification et les profils réels existent.

drop policy "lecture publique unites (prototype, avant auth)" on unites;
drop policy "lecture publique positions (prototype, avant auth)" on positions;

-- Toute unité amie reste visible par tout utilisateur authentifié (logique
-- de suivi de force amie/blue force tracking : un commandant a besoin de
-- voir l'ensemble du dispositif, pas seulement sa propre sous-chaîne).
-- Ce qui change : anonyme -> authentifié seulement.
create policy "lecture unites par utilisateur authentifie"
  on unites for select
  using (auth.role() = 'authenticated');

create policy "lecture positions par utilisateur authentifie"
  on positions for select
  using (auth.role() = 'authenticated');

-- Aide pour les policies ordres : l'unité de rattachement de l'utilisateur connecté.
create or replace function mon_unite_id() returns uuid
language sql security definer stable as $$
  select unite_id from profils where id = auth.uid()
$$;

-- Les ordres, contrairement aux unités, sont du need-to-know : visibles
-- seulement si mon unité est émettrice ou destinataire. Pas encore de
-- remontée hiérarchique (unité parente voit les ordres des unités filles) :
-- volontairement laissé pour plus tard, personne à tester dessus pour l'instant.
create policy "ordres visibles si emetteur ou destinataire"
  on ordres for select
  using (
    unite_emettrice_id = mon_unite_id()
    or exists (
      select 1 from ordres_destinataires od
      where od.ordre_id = ordres.id and od.unite_destinataire_id = mon_unite_id()
    )
  );

create policy "creation d'ordre par son unite"
  on ordres for insert
  with check (unite_emettrice_id = mon_unite_id());

create policy "modification d'un ordre par son unite emettrice"
  on ordres for update
  using (unite_emettrice_id = mon_unite_id());

create policy "destinataires visibles si concerne"
  on ordres_destinataires for select
  using (
    unite_destinataire_id = mon_unite_id()
    or exists (
      select 1 from ordres o
      where o.id = ordres_destinataires.ordre_id and o.unite_emettrice_id = mon_unite_id()
    )
  );

create policy "creation destinataire par l'emetteur de l'ordre"
  on ordres_destinataires for insert
  with check (
    exists (
      select 1 from ordres o
      where o.id = ordres_destinataires.ordre_id and o.unite_emettrice_id = mon_unite_id()
    )
  );
