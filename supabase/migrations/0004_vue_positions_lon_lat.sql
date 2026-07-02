-- Expose lon/lat en colonnes numériques simples plutôt que le type
-- geography brut, pour un JSON prévisible côté client (PostgREST).
drop view if exists dernieres_positions;
create view dernieres_positions as
select distinct on (unite_id)
  id,
  unite_id,
  geom,
  st_x(geom::geometry) as lon,
  st_y(geom::geometry) as lat,
  altitude,
  cap,
  source,
  horodatage
from positions
order by unite_id, horodatage desc;
