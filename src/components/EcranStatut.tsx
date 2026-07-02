interface EcranStatutProps {
  titre: string
  sousTitre?: string
  erreur?: boolean
  onReessayer?: () => void
}

export function EcranStatut({ titre, sousTitre, erreur, onReessayer }: EcranStatutProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-950">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded border text-sm font-bold tracking-wide ${
          erreur ? 'border-red-700 bg-red-950 text-red-300' : 'border-slate-700 bg-slate-900 text-slate-300 animate-pulse'
        }`}
      >
        C2
      </div>
      <div className={erreur ? 'text-sm text-red-400' : 'text-sm text-slate-400'}>{titre}</div>
      {sousTitre && <div className="max-w-xs text-center text-xs text-slate-600">{sousTitre}</div>}
      {onReessayer && (
        <button
          onClick={onReessayer}
          className="mt-2 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-800"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}
