import { supabase } from '../supabaseClient'
import type { EchelonUnite, TypeUnite, Unite } from '../types'
import { formatHeure, formatMgrs } from './coordonnees'

export async function chargerUnites(): Promise<Unite[]> {
  const [{ data: unites, error: erreurUnites }, { data: positions, error: erreurPositions }] = await Promise.all([
    supabase.from('unites').select('id, nom, type_unite, echelon, statut, unite_parent_id'),
    supabase.from('dernieres_positions').select('unite_id, lon, lat, horodatage'),
  ])

  if (erreurUnites) throw erreurUnites
  if (erreurPositions) throw erreurPositions

  const positionParUnite = new Map((positions ?? []).map((p) => [p.unite_id, p]))

  return (unites ?? []).map((u): Unite => {
    const position = positionParUnite.get(u.id)
    const lon = position?.lon ?? 0
    const lat = position?.lat ?? 0
    return {
      id: u.id,
      nom: u.nom,
      typeUnite: u.type_unite as TypeUnite,
      echelon: u.echelon as EchelonUnite,
      statut: u.statut as Unite['statut'],
      uniteParentId: u.unite_parent_id,
      lon,
      lat,
      coordonneesMgrs: position ? formatMgrs(lon, lat) : '—',
      vuA: position ? formatHeure(position.horodatage) : '—',
    }
  })
}
