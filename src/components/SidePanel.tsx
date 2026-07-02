import { ChevronRight } from 'lucide-react'
import type { Ordre, Unite } from '../types'
import { echelonLabel, typeUniteStyle } from '../uniteStyle'
import { prioriteStyle, statutDestinataireStyle, statutOrdreStyle } from '../ordreStyle'

interface SidePanelProps {
  unites: Unite[]
  ordres: Ordre[]
  selectedUniteId: string | null
  onSelectUnite: (id: string) => void
  ongletActif: 'unites' | 'ordres'
  onChangerOnglet: (onglet: 'unites' | 'ordres') => void
  onNouvelOrdre: () => void
  onSelectOrdre: (id: string) => void
}

export function SidePanel({
  unites,
  ordres,
  selectedUniteId,
  onSelectUnite,
  ongletActif,
  onChangerOnglet,
  onNouvelOrdre,
  onSelectOrdre,
}: SidePanelProps) {
  const uniteParId = new Map(unites.map((u) => [u.id, u]))

  return (
    <aside className="flex w-80 flex-col border-l border-slate-800 bg-slate-950 text-slate-200">
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => onChangerOnglet('unites')}
          className={`flex-1 border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide ${
            ongletActif === 'unites' ? 'border-blue-500 text-slate-100' : 'border-transparent text-slate-500'
          }`}
        >
          Unités <span className="ml-1 text-xs text-slate-500">{unites.length}</span>
        </button>
        <button
          onClick={() => onChangerOnglet('ordres')}
          className={`flex-1 border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide ${
            ongletActif === 'ordres' ? 'border-blue-500 text-slate-100' : 'border-transparent text-slate-500'
          }`}
        >
          Ordres <span className="ml-1 text-xs text-slate-500">{ordres.length}</span>
        </button>
      </div>

      {ongletActif === 'unites' ? (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Unités amies · {unites.length}
          </div>
          {unites.map((unite) => {
            const style = typeUniteStyle[unite.typeUnite]
            return (
              <button
                key={unite.id}
                onClick={() => onSelectUnite(unite.id)}
                className={`flex w-full items-center gap-3 border-b border-slate-900 px-4 py-3 text-left hover:bg-slate-900 ${
                  unite.id === selectedUniteId ? 'bg-slate-900' : ''
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${style.border} ${style.text} text-[10px] font-bold`}
                >
                  {style.sigle}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold leading-tight text-slate-100">{unite.nom}</div>
                  <div className="truncate text-xs text-slate-500">
                    {echelonLabel[unite.echelon]} · {style.label}
                  </div>
                </div>
                <div className="shrink-0 text-right text-[11px] text-slate-500">
                  <div>{unite.coordonneesMgrs}</div>
                  <div>Vu {unite.vuA}</div>
                </div>
                <ChevronRight size={14} className="shrink-0 text-slate-600" />
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Ordres · {ordres.length}
            </span>
            <button
              onClick={onNouvelOrdre}
              className="rounded bg-blue-600 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-blue-500"
            >
              Nouvel ordre
            </button>
          </div>
          {ordres.map((ordre) => {
            const emetteur = uniteParId.get(ordre.uniteEmettriceId)
            return (
              <button
                key={ordre.id}
                onClick={() => onSelectOrdre(ordre.id)}
                className="block w-full border-b border-slate-900 px-4 py-3 text-left hover:bg-slate-900"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
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
                <div className="mb-1 text-sm font-bold text-slate-100">{ordre.titre}</div>
                <div className="mb-2 text-xs text-slate-500">Émetteur : {emetteur?.nom ?? '—'}</div>
                <div className="flex flex-wrap gap-1">
                  {ordre.destinataires.map((dest) => {
                    const unite = uniteParId.get(dest.uniteDestinataireId)
                    return (
                      <span
                        key={dest.uniteDestinataireId}
                        className={`rounded px-1.5 py-0.5 text-[10px] ${statutDestinataireStyle[dest.statut].className}`}
                      >
                        {unite?.nom ?? '—'} · {statutDestinataireStyle[dest.statut].label}
                      </span>
                    )
                  })}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
