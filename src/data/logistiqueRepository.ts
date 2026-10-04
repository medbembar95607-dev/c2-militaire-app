import { supabase } from '../supabaseClient'
import type { DemandeRavitaillement, PrioriteDemande, Ressource, StatutDemande, Stock } from '../types'

export async function chargerStocks(): Promise<Stock[]> {
  const { data, error } = await supabase
    .from('stocks')
    .select('id, unite_id, ressource, quantite, capacite, unite_mesure, mis_a_jour_le')
  if (error) throw error
  return (data ?? []).map(
    (l): Stock => ({
      id: l.id,
      uniteId: l.unite_id,
      ressource: l.ressource as Ressource,
      quantite: Number(l.quantite),
      capacite: Number(l.capacite),
      uniteMesure: l.unite_mesure,
      misAJourLe: l.mis_a_jour_le,
    }),
  )
}

export async function chargerDemandes(): Promise<DemandeRavitaillement[]> {
  const { data, error } = await supabase
    .from('demandes_ravitaillement')
    .select('id, unite_demandeuse_id, ressource, quantite, priorite, statut, commentaire, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(
    (l): DemandeRavitaillement => ({
      id: l.id,
      uniteDemandeuseId: l.unite_demandeuse_id,
      ressource: l.ressource as Ressource,
      quantite: Number(l.quantite),
      priorite: l.priorite as PrioriteDemande,
      statut: l.statut as StatutDemande,
      commentaire: l.commentaire,
      creeLe: l.created_at,
    }),
  )
}

export async function mettreAJourStocks(quantites: { id: string; quantite: number }[], par: string): Promise<void> {
  const misAJourLe = new Date().toISOString()
  for (const { id, quantite } of quantites) {
    // select() pour détecter un refus RLS silencieux (0 ligne modifiée, pas d'erreur).
    const { data, error } = await supabase
      .from('stocks')
      .update({ quantite, mis_a_jour_par: par, mis_a_jour_le: misAJourLe })
      .eq('id', id)
      .select('id')
    if (error) throw error
    if (!data?.length) throw new Error('Modification refusée : une unité ne met à jour que ses propres stocks.')
  }
}

export async function creerDemande(d: DemandeRavitaillement, demandeurId: string): Promise<void> {
  const { error } = await supabase.from('demandes_ravitaillement').insert({
    id: d.id,
    unite_demandeuse_id: d.uniteDemandeuseId,
    ressource: d.ressource,
    quantite: d.quantite,
    priorite: d.priorite,
    statut: 'demandee',
    commentaire: d.commentaire,
    demandeur_id: demandeurId,
  })
  if (error) throw error
}

export async function changerStatutDemande(id: string, statut: 'en_cours' | 'refusee'): Promise<void> {
  const { data, error } = await supabase
    .from('demandes_ravitaillement')
    .update({ statut, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data?.length) throw new Error('Modification refusée : seule une unité logistique traite les demandes.')
}

// Livraison côté base : clôt la demande et crédite le stock dans la même transaction.
export async function livrerDemande(id: string): Promise<void> {
  const { error } = await supabase.rpc('livrer_demande', { p_demande_id: id })
  if (error) throw error
}
