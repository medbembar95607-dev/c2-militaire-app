import { supabase } from '../supabaseClient'
import type {
  AffiliationMenace,
  FiabiliteSource,
  Renseignement,
  SourceRenseignement,
  StatutRenseignement,
  TypeMenace,
} from '../types'
import { formatMgrs } from './coordonnees'

interface LigneRenseignement {
  id: string
  titre: string
  description: string
  type_menace: string
  affiliation: string
  source: string
  fiabilite_source: string
  credibilite_info: number
  statut: string
  lon: number
  lat: number
  horodatage_observation: string
  unite_source_id: string
}

function versRenseignement(l: LigneRenseignement): Renseignement {
  return {
    id: l.id,
    titre: l.titre,
    description: l.description,
    typeMenace: l.type_menace as TypeMenace,
    affiliation: l.affiliation as AffiliationMenace,
    source: l.source as SourceRenseignement,
    fiabiliteSource: l.fiabilite_source as FiabiliteSource,
    credibiliteInfo: l.credibilite_info,
    statut: l.statut as StatutRenseignement,
    lon: l.lon,
    lat: l.lat,
    coordonneesMgrs: formatMgrs(l.lon, l.lat),
    horodatageObservation: l.horodatage_observation,
    uniteSourceId: l.unite_source_id,
  }
}

export async function chargerRenseignements(): Promise<Renseignement[]> {
  const { data, error } = await supabase
    .from('renseignements_carte')
    .select(
      'id, titre, description, type_menace, affiliation, source, fiabilite_source, credibilite_info, statut, lon, lat, horodatage_observation, unite_source_id',
    )
    .order('horodatage_observation', { ascending: false })

  if (error) throw error
  return (data as LigneRenseignement[]).map(versRenseignement)
}

export async function creerRenseignement(r: Renseignement, saisiPar: string): Promise<void> {
  const { error } = await supabase.from('renseignements').insert({
    id: r.id,
    titre: r.titre,
    description: r.description,
    type_menace: r.typeMenace,
    affiliation: r.affiliation,
    source: r.source,
    fiabilite_source: r.fiabiliteSource,
    credibilite_info: r.credibiliteInfo,
    statut: r.statut,
    geom: `SRID=4326;POINT(${r.lon} ${r.lat})`,
    horodatage_observation: r.horodatageObservation,
    unite_source_id: r.uniteSourceId,
    saisi_par: saisiPar,
  })
  if (error) throw error
}

export async function changerStatutRenseignement(id: string, statut: StatutRenseignement): Promise<void> {
  // select() pour détecter un refus RLS silencieux (0 ligne modifiée, pas d'erreur).
  const { data, error } = await supabase
    .from('renseignements')
    .update({ statut, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data?.length) throw new Error("Modification refusée : seule l'unité source ou sa chaîne de commandement peut changer ce statut.")
}
