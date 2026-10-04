import { useState } from 'react'
import type { DemandeRavitaillement, Stock, Unite } from '../types'
import {
  formatQuantite,
  niveauStock,
  niveauStyle,
  pireNiveau,
  prioriteDemandeStyle,
  ressourceLabel,
  ressources,
  statutDemandeStyle,
} from '../logistiqueStyle'
import { formatHeure } from '../data/coordonnees'
import { messageErreur } from '../erreurUtils'

interface LogistiquePanelProps {
  unites: Unite[]
  stocks: Stock[]
  demandes: DemandeRavitaillement[]
  estLogistique: boolean
  onOuvrirUnite: (id: string) => void
  onPrendreEnCharge: (id: string) => Promise<void>
  onLivrer: (id: string) => Promise<void>
  onRefuser: (id: string) => Promise<void>
}

const rangNiveau = { critique: 0, bas: 1, ok: 2 }
const rangStatut = { demandee: 0, en_cours: 1, livree: 2, refusee: 3 }
const rangPriorite = { vital: 0, urgent: 1, routine: 2 }

export function LogistiquePanel({
  unites,
  stocks,
  demandes,
  estLogistique,
  onOuvrirUnite,
  onPrendreEnCharge,
  onLivrer,
  onRefuser,
}: LogistiquePanelProps) {
  const [enCoursId, setEnCoursId] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const uniteParId = new Map(unites.map((u) => [u.id, u]))

  // Unités les plus en difficulté d'abord.
  const lignes = unites
    .map((u) => {
      const sesStocks = stocks.filter((s) => s.uniteId === u.id)
      return { unite: u, stocks: sesStocks, niveau: pireNiveau(sesStocks) }
    })
    .sort((a, b) => rangNiveau[a.niveau] - rangNiveau[b.niveau])

  const demandesTriees = [...demandes].sort(
    (a, b) =>
      rangStatut[a.statut] - rangStatut[b.statut] ||
      rangPriorite[a.priorite] - rangPriorite[b.priorite] ||
      b.creeLe.localeCompare(a.creeLe),
  )

  async function executer(id: string, action: (id: string) => Promise<void>) {
    setEnCoursId(id)
    setErreur(null)
    try {
      await action(id)
    } catch (err) {
      setErreur(messageErreur(err))
    } finally {
      setEnCoursId(null)
    }
  }

  const sectionNiveaux = (
    <>
      <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Niveaux par unité</div>
      {lignes.map(({ unite, stocks: sesStocks, niveau }) => (
        <button
          key={unite.id}
          onClick={() => onOuvrirUnite(unite.id)}
          className="block w-full border-b border-slate-900 px-4 py-2.5 text-left hover:bg-slate-900"
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-100">{unite.nom}</span>
            <span className={`text-[10px] font-bold uppercase ${niveauStyle[niveau].texte}`}>
              {niveauStyle[niveau].label}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {ressources.map((r) => {
              const s = sesStocks.find((x) => x.ressource === r)
              const pct = s ? Math.round((s.quantite / s.capacite) * 100) : 0
              const style = s ? niveauStyle[niveauStock(s)] : niveauStyle.critique
              return (
                <div key={r} title={s ? `${ressourceLabel[r].label} : ${formatQuantite(s.quantite)} / ${formatQuantite(s.capacite)} ${s.uniteMesure}` : ''}>
                  <div className="mb-0.5 flex justify-between text-[9px] text-slate-500">
                    <span>{ressourceLabel[r].sigle}</span>
                    <span className={style.texte}>{s ? pct : '—'}</span>
                  </div>
                  <div className="h-1.5 rounded bg-slate-800">
                    <div className={`h-1.5 rounded ${style.barre}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </button>
      ))}
    </>
  )

  const sectionDemandes = (
    <>
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Demandes de ravitaillement · {demandes.filter((d) => d.statut === 'demandee' || d.statut === 'en_cours').length}
        </span>
      </div>
      {erreur && <div className="px-4 pb-2 text-xs text-red-400">{erreur}</div>}
      {demandesTriees.length === 0 && <div className="px-4 py-3 text-xs text-slate-500">Aucune demande visible.</div>}
      {demandesTriees.map((d) => {
        const unite = uniteParId.get(d.uniteDemandeuseId)
        const ouverte = d.statut === 'demandee' || d.statut === 'en_cours'
        const occupe = enCoursId === d.id
        return (
          <div key={d.id} className={`border-b border-slate-900 px-4 py-3 ${ouverte ? '' : 'opacity-60'}`}>
            <div className="mb-1 flex items-center gap-1.5">
              <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${prioriteDemandeStyle[d.priorite].className}`}>
                {prioriteDemandeStyle[d.priorite].label}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${statutDemandeStyle[d.statut].className}`}>
                {statutDemandeStyle[d.statut].label}
              </span>
              <span className="ml-auto text-[11px] text-slate-500">{formatHeure(d.creeLe)}</span>
            </div>
            <div className="text-sm font-bold text-slate-100">
              {ressourceLabel[d.ressource].label} · {formatQuantite(d.quantite)}{' '}
              {stocks.find((s) => s.uniteId === d.uniteDemandeuseId && s.ressource === d.ressource)?.uniteMesure ?? ''}
            </div>
            <div className="text-xs text-slate-500">{unite?.nom ?? '—'}</div>
            {d.commentaire && <div className="mt-1 text-xs text-slate-400">{d.commentaire}</div>}
            {estLogistique && ouverte && (
              <div className="mt-2 flex gap-1.5">
                {d.statut === 'demandee' && (
                  <button
                    disabled={occupe}
                    onClick={() => executer(d.id, onPrendreEnCharge)}
                    className="rounded border border-slate-600 px-2 py-1 text-[10px] font-bold uppercase text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                  >
                    Prendre en charge
                  </button>
                )}
                <button
                  disabled={occupe}
                  onClick={() => executer(d.id, onLivrer)}
                  className="rounded bg-emerald-700 px-2 py-1 text-[10px] font-bold uppercase text-white hover:bg-emerald-600 disabled:opacity-40"
                >
                  Livrer
                </button>
                <button
                  disabled={occupe}
                  onClick={() => executer(d.id, onRefuser)}
                  className="rounded border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-800 disabled:opacity-40"
                >
                  Refuser
                </button>
              </div>
            )}
          </div>
        )
      })}
    </>
  )

  // La logistique traite les demandes : elles passent en tête pour elle.
  return (
    <div className="flex-1 overflow-y-auto">
      {estLogistique ? sectionDemandes : sectionNiveaux}
      {estLogistique ? sectionNiveaux : sectionDemandes}
    </div>
  )
}
