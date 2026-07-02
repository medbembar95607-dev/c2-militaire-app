import { useState } from 'react'
import { X } from 'lucide-react'
import type { Ordre, Unite } from '../types'
import { prioriteStyle, statutDestinataireStyle, statutOrdreStyle } from '../ordreStyle'
import { messageErreur } from '../erreurUtils'

interface OrdreDetailModalProps {
  ordre: Ordre
  unites: Unite[]
  onFermer: () => void
  onEnvoyer: (id: string) => Promise<void>
}

export function OrdreDetailModal({ ordre, unites, onFermer, onEnvoyer }: OrdreDetailModalProps) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const uniteParId = new Map(unites.map((u) => [u.id, u]))
  const emetteur = uniteParId.get(ordre.uniteEmettriceId)

  async function envoyer() {
    setEnCours(true)
    setErreur(null)
    try {
      await onEnvoyer(ordre.id)
    } catch (err) {
      setErreur(messageErreur(err))
      setEnCours(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="flex max-h-full w-full max-w-lg flex-col rounded border border-slate-700 bg-slate-950 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${prioriteStyle[ordre.priorite]}`}
            >
              {ordre.typeOrdre} · {ordre.priorite}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${statutOrdreStyle[ordre.statut].className}`}
            >
              {statutOrdreStyle[ordre.statut].label}
            </span>
          </div>
          <button onClick={onFermer} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div>
            <div className="text-base font-bold text-slate-100">{ordre.titre}</div>
            <div className="mt-1 text-xs text-slate-500">
              Émetteur : {emetteur?.nom ?? '—'}
              {ordre.dateLimiteExecution &&
                ` · Limite d'exécution : ${new Date(ordre.dateLimiteExecution).toLocaleString('fr-FR')}`}
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Contenu</div>
            <p className="whitespace-pre-wrap rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200">
              {ordre.contenu}
            </p>
          </div>

          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Destinataires ({ordre.destinataires.length})
            </div>
            <div className="space-y-1">
              {ordre.destinataires.map((dest) => {
                const unite = uniteParId.get(dest.uniteDestinataireId)
                return (
                  <div
                    key={dest.uniteDestinataireId}
                    className="flex items-center justify-between rounded border border-slate-800 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-200">{unite?.nom ?? '—'}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${statutDestinataireStyle[dest.statut].className}`}
                    >
                      {statutDestinataireStyle[dest.statut].label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {erreur && <div className="border-t border-slate-800 px-4 py-2 text-xs text-red-400">{erreur}</div>}

        <div className="flex justify-end gap-2 border-t border-slate-800 px-4 py-3">
          <button
            onClick={onFermer}
            className="rounded border border-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:bg-slate-900"
          >
            Fermer
          </button>
          {ordre.statut === 'brouillon' && (
            <button
              disabled={enCours}
              onClick={envoyer}
              className="rounded bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {enCours ? 'Envoi…' : 'Envoyer maintenant'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
