import { LogOut, Wifi, WifiOff } from 'lucide-react'
import type { Profil } from '../types'

interface HeaderProps {
  profil: Profil
  zone: string
  tempsEcoule: string
  heureGmt: string
  enLigne: boolean
  modificationsEnAttente: number
  onBasculerLiaison: () => void
  onDeconnexion: () => void
}

export function Header({
  profil,
  zone,
  tempsEcoule,
  heureGmt,
  enLigne,
  modificationsEnAttente,
  onBasculerLiaison,
  onDeconnexion,
}: HeaderProps) {
  const initiale = profil.nomComplet.replace('LCL ', '').charAt(0)

  return (
    <header className="flex items-center gap-6 border-b border-slate-800 bg-slate-950 px-4 py-2 text-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-slate-700 bg-slate-900 text-xs font-bold tracking-wide text-slate-300">
          C2
        </div>
        <div>
          <div className="text-sm font-bold uppercase tracking-wide text-slate-100">
            Poste de commandement
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Situation tactique — {profil.uniteNom}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
        <span>Zone {zone}</span>
        <span className="text-slate-700">|</span>
        <span>{tempsEcoule}</span>
        <span className="text-slate-700">|</span>
        <span>GMT {heureGmt}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-bold text-slate-100">{profil.nomComplet}</div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {profil.role} · {profil.uniteNom}
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {initiale}
        </div>

        <div
          className={`flex items-center gap-2 rounded border px-3 py-1.5 text-xs ${
            enLigne
              ? 'border-emerald-700 bg-emerald-950 text-emerald-300'
              : 'border-amber-700 bg-amber-950 text-amber-300'
          }`}
        >
          {enLigne ? <Wifi size={14} /> : <WifiOff size={14} />}
          <div>
            <div className="font-bold uppercase tracking-wide">
              {enLigne ? 'En ligne' : 'Hors ligne'}
            </div>
            <div className="text-[10px] text-slate-400">
              {enLigne
                ? 'Liaison synchronisée'
                : `${modificationsEnAttente} modification${modificationsEnAttente > 1 ? 's' : ''} en attente`}
            </div>
          </div>
        </div>

        <button
          onClick={onBasculerLiaison}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-800"
        >
          Basculer liaison
        </button>

        <button
          onClick={onDeconnexion}
          title="Se déconnecter"
          className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  )
}
