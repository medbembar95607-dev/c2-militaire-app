-- Policy définitive (pas un contournement provisoire) : un utilisateur
-- connecté ne peut lire que son propre profil. Nécessaire maintenant que
-- l'authentification existe.
create policy "un utilisateur lit son propre profil"
  on profils for select
  using (auth.uid() = id);
