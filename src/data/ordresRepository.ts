import { supabase } from '../supabaseClient'
import type { Ordre, OrdreDestinataire, PrioriteOrdre, StatutDestinataire, StatutOrdre, TypeOrdre } from '../types'

interface LigneOrdre {
  id: string
  titre: string
  contenu: string
  type_ordre: string
  priorite: string
  statut: string
  unite_emettrice_id: string
  date_limite_execution: string | null
  ordres_destinataires: { unite_destinataire_id: string; statut: string }[]
}

function versOrdre(ligne: LigneOrdre): Ordre {
  return {
    id: ligne.id,
    titre: ligne.titre,
    contenu: ligne.contenu,
    typeOrdre: ligne.type_ordre as TypeOrdre,
    priorite: ligne.priorite as PrioriteOrdre,
    statut: ligne.statut as StatutOrdre,
    uniteEmettriceId: ligne.unite_emettrice_id,
    dateLimiteExecution: ligne.date_limite_execution ?? undefined,
    destinataires: ligne.ordres_destinataires.map(
      (d): OrdreDestinataire => ({
        uniteDestinataireId: d.unite_destinataire_id,
        statut: d.statut as StatutDestinataire,
      }),
    ),
  }
}

export async function chargerOrdres(): Promise<Ordre[]> {
  const { data, error } = await supabase
    .from('ordres')
    .select('*, ordres_destinataires(unite_destinataire_id, statut)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as LigneOrdre[]).map(versOrdre)
}

export async function creerOrdre(ordre: Ordre, emetteurId: string): Promise<void> {
  const { error: erreurOrdre } = await supabase.from('ordres').insert({
    id: ordre.id,
    titre: ordre.titre,
    contenu: ordre.contenu,
    type_ordre: ordre.typeOrdre,
    priorite: ordre.priorite,
    statut: ordre.statut,
    unite_emettrice_id: ordre.uniteEmettriceId,
    emetteur_id: emetteurId,
    date_limite_execution: ordre.dateLimiteExecution ?? null,
  })
  if (erreurOrdre) throw erreurOrdre

  const { error: erreurDestinataires } = await supabase.from('ordres_destinataires').insert(
    ordre.destinataires.map((d) => ({
      ordre_id: ordre.id,
      unite_destinataire_id: d.uniteDestinataireId,
      statut: d.statut,
    })),
  )
  if (erreurDestinataires) throw erreurDestinataires
}

export async function envoyerOrdre(id: string): Promise<void> {
  const { error } = await supabase.from('ordres').update({ statut: 'envoye' }).eq('id', id)
  if (error) throw error
}
