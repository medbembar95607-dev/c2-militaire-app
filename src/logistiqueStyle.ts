import type { PrioriteDemande, Ressource, StatutDemande, Stock } from './types'

export const ressources: Ressource[] = ['carburant', 'munitions', 'eau', 'vivres', 'sante']

export const ressourceLabel: Record<Ressource, { label: string; sigle: string }> = {
  carburant: { label: 'Carburant', sigle: 'CARB' },
  munitions: { label: 'Munitions', sigle: 'MUN' },
  eau: { label: 'Eau', sigle: 'EAU' },
  vivres: { label: 'Vivres', sigle: 'VIV' },
  sante: { label: 'Santé', sigle: 'SAN' },
}

export type NiveauStock = 'ok' | 'bas' | 'critique'

// Seuils fixes pour le MVP : sous 25 % critique, sous 50 % bas.
export function niveauStock(s: Pick<Stock, 'quantite' | 'capacite'>): NiveauStock {
  const pct = s.quantite / s.capacite
  if (pct < 0.25) return 'critique'
  if (pct < 0.5) return 'bas'
  return 'ok'
}

export function pireNiveau(stocks: Stock[]): NiveauStock {
  const niveaux = stocks.map(niveauStock)
  if (niveaux.includes('critique')) return 'critique'
  if (niveaux.includes('bas')) return 'bas'
  return 'ok'
}

export const niveauStyle: Record<NiveauStock, { label: string; barre: string; texte: string; pastille: string }> = {
  ok: { label: 'Correct', barre: 'bg-emerald-500', texte: 'text-emerald-400', pastille: '#10b981' },
  bas: { label: 'Bas', barre: 'bg-amber-500', texte: 'text-amber-400', pastille: '#f59e0b' },
  critique: { label: 'Critique', barre: 'bg-red-500', texte: 'text-red-400', pastille: '#ef4444' },
}

export const prioriteDemandeStyle: Record<PrioriteDemande, { label: string; className: string }> = {
  routine: { label: 'Routine', className: 'border-slate-700 text-slate-400' },
  urgent: { label: 'Urgent', className: 'border-orange-500 text-orange-400' },
  vital: { label: 'Vital', className: 'border-red-500 text-red-400 animate-pulse' },
}

export const statutDemandeStyle: Record<StatutDemande, { label: string; className: string }> = {
  demandee: { label: 'Demandée', className: 'bg-blue-600 text-white' },
  en_cours: { label: 'En cours', className: 'bg-orange-600 text-white' },
  livree: { label: 'Livrée', className: 'bg-emerald-800 text-white' },
  refusee: { label: 'Refusée', className: 'bg-slate-700 text-slate-300' },
}

export function formatQuantite(q: number): string {
  return q.toLocaleString('fr-FR')
}
