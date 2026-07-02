import { forward } from 'mgrs'
import { supabase } from '../supabaseClient'
import type { EchelonUnite, TypeUnite, Unite } from '../types'

function formatMgrs(lon: number, lat: number): string {
  const brut = forward([lon, lat], 3)
  const zoneBande = brut.slice(0, 3)
  const carre = brut.slice(3, 5)
  const reste = brut.slice(5)
  const milieu = reste.length / 2
  return `${zoneBande} ${carre} ${reste.slice(0, milieu)} ${reste.slice(milieu)}`
}

function formatHeure(horodatage: string): string {
  const d = new Date(horodatage)
  return `${String(d.getUTCHours()).padStart(2, '0')}${String(d.getUTCMinutes()).padStart(2, '0')}`
}

export async function chargerUnites(): Promise<Unite[]> {
  const [{ data: unites, error: erreurUnites }, { data: positions, error: erreurPositions }] = await Promise.all([
    supabase.from('unites').select('id, nom, type_unite, echelon, statut'),
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
      lon,
      lat,
      coordonneesMgrs: position ? formatMgrs(lon, lat) : '—',
      vuA: position ? formatHeure(position.horodatage) : '—',
    }
  })
}
