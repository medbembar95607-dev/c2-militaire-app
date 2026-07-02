import type { Ordre, StatutDestinataire } from './types'

export const statutOrdreStyle: Record<Ordre['statut'], { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-slate-700 text-slate-200' },
  envoye: { label: 'Envoyé', className: 'bg-blue-600 text-white' },
  annule: { label: 'Annulé', className: 'bg-red-700 text-white' },
}

export const statutDestinataireStyle: Record<StatutDestinataire, { label: string; className: string }> = {
  envoye: { label: 'Envoyé', className: 'bg-blue-600 text-white' },
  recu: { label: 'Reçu', className: 'bg-orange-600 text-white' },
  accuse: { label: 'Accusé', className: 'bg-emerald-500 text-white' },
  execute: { label: 'Exécuté', className: 'bg-emerald-800 text-white' },
}

export const prioriteStyle: Record<Ordre['priorite'], string> = {
  normal: 'border-slate-700 text-slate-400',
  urgent: 'border-orange-500 text-orange-400',
  flash: 'border-red-500 text-red-400 animate-pulse',
}
