-- Établit la hiérarchie de commandement (jusqu'ici toutes les unités
-- étaient "plates", sans unite_parent_id). Structure retenue pour le GTIA
-- Scorpion :
--   PC GTIA SCORPION (racine)
--     BAT INF « SANGLIER »
--       CIE INF 2
--       CIE INF 3
--       SEC INF 4 (section de reconnaissance rattachée directement au bataillon)
--     BAT ART « FOUDRE »
--     SEC GÉNIE 1 (rattachée directement au PC)
--     CIE LOG « RELAIS » (rattachée directement au PC)

update unites set unite_parent_id = '38da5f6c-8729-47a3-908e-cee7230097f4'
  where id in (
    'f4db0ab3-ba18-4896-845c-84a78b88d7f3', -- BAT INF SANGLIER
    'e18472b7-18a6-4d96-a41f-b412e5a0ab12', -- BAT ART FOUDRE
    '547cdfef-cc96-49ab-b5ae-c4903ee52db7', -- SEC GÉNIE 1
    'e3018247-10c0-47fe-870e-b36a679d556d'  -- CIE LOG RELAIS
  );

update unites set unite_parent_id = 'f4db0ab3-ba18-4896-845c-84a78b88d7f3' -- BAT INF SANGLIER
  where id in (
    '8e6008b2-b993-4c47-8ae4-fca69cfdafd4', -- CIE INF 2
    'a930f5a5-93c6-4ecb-829c-7ce420465c92', -- CIE INF 3
    'ca5492d7-65b7-4e62-81bb-784a280e56ee'  -- SEC INF 4
  );
