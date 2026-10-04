import { useState } from 'react'
import { Crosshair, X } from 'lucide-react'
import ms from 'milsymbol'
import type { Renseignement, StatutRenseignement, Unite } from '../types'
import {
  affiliationLabel,
  cotationClassName,
  credibiliteLabel,
  fiabiliteLabel,
  sidcRenseignement,
  sourceLabel,
  statutRenseignementStyle,
  typeMenaceLabel,
} from '../renseignementStyle'
import { messageErreur } from '../erreurUtils'

interface RenseignementDetailModalProps {
  renseignement: Renseignement
  unites: Unite[]
  // L'unité source fait partie de ma chaîne de commandement (moi ou mes unités filles).
  peutModifier: boolean
  onFermer: () => void
  onLocaliser: (id: string) => void
  onChangerStatut: (id: string, statut: StatutRenseignement) => Promise<void>
}

const actionsStatut: { statut: StatutRenseignement; label: string; className: string }[] = [
  { statut: 'neutralise', label: 'Marquer neutralisé', className: 'bg-emerald-800 text-white hover:bg-emerald-700' },
  { statut: 'perime', label: 'Marquer périmé', className: 'border border-slate-600 text-slate-300 hover:bg-slate-800' },
  { statut: 'actif', label: 'Réactiver', className: 'bg-red-700 text-white hover:bg-red-600' },
]

export function RenseignementDetailModal({
  renseignement: r,
  unites,
  peutModifier,
  onFermer,
  onLocaliser,
  onChangerStatut,
}: RenseignementDetailModalProps) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const uniteSource = unites.find((u) => u.id === r.uniteSourceId)

  async function changerStatut(statut: StatutRenseignement) {
    setEnCours(true)
    setErreur(null)
    try {
      await onChangerStatut(r.id, statut)
    } catch (err) {
      setErreur(messageErreur(err))
      setEnCours(false)
    }
  }

  const lignes: [string, string][] = [
    ['Type', `${typeMenaceLabel[r.typeMenace]} · ${affiliationLabel[r.affiliation]}`],
    ['Position', r.coordonneesMgrs],
    ['Observé le', new Date(r.horodatageObservation).toLocaleString('fr-FR')],
    ['Source', `${sourceLabel[r.source]} · ${uniteSource?.nom ?? '—'}`],
    ['Fiabilité source', `${r.fiabiliteSource} · ${fiabiliteLabel[r.fiabiliteSource]}`],
    ['Crédibilité info', `${r.credibiliteInfo} · ${credibiliteLabel[r.credibiliteInfo]}`],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="flex max-h-full w-full max-w-lg flex-col rounded border border-slate-700 bg-slate-950 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span dangerouslySetInnerHTML={{ __html: new ms.Symbol(sidcRenseignement(r), { size: 20 }).asSVG() }} />
            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${cotationClassName(r)}`}>
              {r.fiabiliteSource}
              {r.credibiliteInfo}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${statutRenseignementStyle[r.statut].className}`}
            >
              {statutRenseignementStyle[r.statut].label}
            </span>
          </div>
          <button onClick={onFermer} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="text-base font-bold text-slate-100">{r.titre}</div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {lignes.map(([cle, valeur]) => (
              <div key={cle} className="contents">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{cle}</dt>
                <dd className="text-slate-200">{valeur}</dd>
              </div>
            ))}
          </dl>

          {r.description && (
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Description</div>
              <p className="whitespace-pre-wrap rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200">
                {r.description}
              </p>
            </div>
          )}
        </div>

        {erreur && <div className="border-t border-slate-800 px-4 py-2 text-xs text-red-400">{erreur}</div>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 px-4 py-3">
          <button
            onClick={() => onLocaliser(r.id)}
            className="mr-auto flex items-center gap-1.5 rounded border border-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-900"
          >
            <Crosshair size={13} /> Localiser
          </button>
          {!peutModifier && (
            <span className="self-center text-[11px] text-slate-500">Statut modifiable par l'unité source et ses chefs</span>
          )}
          {actionsStatut
            .filter((a) => peutModifier && a.statut !== r.statut)
            .map((a) => (
              <button
                key={a.statut}
                disabled={enCours}
                onClick={() => changerStatut(a.statut)}
                className={`rounded px-3 py-2 text-xs font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40 ${a.className}`}
              >
                {a.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
