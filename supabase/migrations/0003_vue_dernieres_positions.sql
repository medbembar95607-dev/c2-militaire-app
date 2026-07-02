-- Vue documentée dans 03-donnees/modele-donnees.md : dernière position par unité.
create view dernieres_positions as
select distinct on (unite_id) *
from positions
order by unite_id, horodatage desc;

-- Même raisonnement provisoire que pour unites (voir 0001) : données fictives,
-- pas encore d'auth, on ouvre la lecture pour que la carte fonctionne.
-- À remplacer par une policy scoped à la chaîne de commandement avec l'auth.
create policy "lecture publique positions (prototype, avant auth)"
  on positions for select
  using (true);
