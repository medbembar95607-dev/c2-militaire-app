import { useState } from 'react'
import { MapPin, X } from 'lucide-react'
import ms from 'milsymbol'
import type { AffiliationMenace, FiabiliteSource, Renseignement, SourceRenseignement, TypeMenace, Unite } from '../types'
import {
  affiliationLabel,
  credibiliteLabel,
  fiabiliteLabel,
  sidcRenseignement,
  sourceLabel,
  typeMenaceLabel,
} from '../renseignementStyle'
import { formatMgrs } from '../data/coordonnees'
import { messageErreur } from '../erreurUtils'

interface NouveauRenseignementModalProps {
  unites: Unite[]
  uniteSourceId: string
  position: { lon: number; lat: number } | null
  // Masquée (pas démontée) pendant le placement sur la carte, pour garder la saisie.
  masquee: boolean
  onDemanderPlacement: () => void
  onFermer: () => void
  onCreer: (r: Renseignement) => Promise<void>
}

const typesMenace = Object.keys(typeMenaceLabel) as TypeMenace[]
const affiliations = Object.keys(affiliationLabel) as AffiliationMenace[]
const sources = Object.keys(sourceLabel) as SourceRenseignement[]
const fiabilites = Object.keys(fiabiliteLabel) as FiabiliteSource[]
const credibilites = [1, 2, 3, 4, 5, 6]

const libelle = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500'
const champ =
  'w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-red-500'

function maintenantLocal(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function NouveauRenseignementModal({
  unites,
  uniteSourceId,
  position,
  masquee,
  onDemanderPlacement,
  onFermer,
  onCreer,
}: NouveauRenseignementModalProps) {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [typeMenace, setTypeMenace] = useState<TypeMenace>('infanterie')
  const [affiliation, setAffiliation] = useState<AffiliationMenace>('hostile')
  const [source, setSource] = useState<SourceRenseignement>('observation')
  const [fiabilite, setFiabilite] = useState<FiabiliteSource>('B')
  const [credibilite, setCredibilite] = useState(2)
  const [horodatage, setHorodatage] = useState(maintenantLocal)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const uniteSource = unites.find((u) => u.id === uniteSourceId)
  const estValide = titre.trim().length > 0 && position !== null && horodatage !== ''

  async function soumettre() {
    if (!estValide || !position || enCours) return
    setEnCours(true)
    setErreur(null)
    try {
      await onCreer({
        id: crypto.randomUUID(),
        titre: titre.trim(),
        description: description.trim(),
        typeMenace,
        affiliation,
        source,
        fiabiliteSource: fiabilite,
        credibiliteInfo: credibilite,
        statut: 'actif',
        lon: position.lon,
        lat: position.lat,
        coordonneesMgrs: formatMgrs(position.lon, position.lat),
        horodatageObservation: new Date(horodatage).toISOString(),
        uniteSourceId,
      })
    } catch (err) {
      setErreur(messageErreur(err))
      setEnCours(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 ${masquee ? 'hidden' : ''}`}>
      <div className="flex max-h-full w-full max-w-lg flex-col rounded border border-slate-700 bg-slate-950 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <span dangerouslySetInnerHTML={{ __html: new ms.Symbol(sidcRenseignement({ typeMenace, affiliation }), { size: 22 }).asSVG() }} />
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-slate-100">Nouveau renseignement</div>
              <div className="text-xs text-slate-500">Unité source : {uniteSource?.nom ?? '—'}</div>
            </div>
          </div>
          <button onClick={onFermer} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div>
            <label className={libelle}>Titre</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. Groupe ennemi en position sur la crête"
              className={champ}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={libelle}>Type de menace</label>
              <select value={typeMenace} onChange={(e) => setTypeMenace(e.target.value as TypeMenace)} className={champ}>
                {typesMenace.map((t) => (
                  <option key={t} value={t}>
                    {typeMenaceLabel[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={libelle}>Affiliation</label>
              <div className="flex gap-1">
                {affiliations.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAffiliation(a)}
                    className={`flex-1 rounded border px-1 py-2 text-[11px] font-bold ${
                      affiliation === a ? 'border-red-500 bg-red-700 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {affiliationLabel[a]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={libelle}>Position</label>
            <div className="flex items-center gap-2">
              <div className={`${champ} flex-1 font-mono ${position ? '' : 'text-slate-500'}`}>
                {position ? formatMgrs(position.lon, position.lat) : 'Non positionné'}
              </div>
              <button
                onClick={onDemanderPlacement}
                className="flex items-center gap-1.5 rounded border border-slate-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-800"
              >
                <MapPin size={13} /> {position ? 'Déplacer' : 'Placer sur la carte'}
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={libelle}>Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as SourceRenseignement)} className={champ}>
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {sourceLabel[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={libelle}>Heure d'observation</label>
              <input
                type="datetime-local"
                value={horodatage}
                onChange={(e) => setHorodatage(e.target.value)}
                className={`${champ} [color-scheme:dark]`}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={libelle}>Fiabilité de la source</label>
              <select value={fiabilite} onChange={(e) => setFiabilite(e.target.value as FiabiliteSource)} className={champ}>
                {fiabilites.map((f) => (
                  <option key={f} value={f}>
                    {f} · {fiabiliteLabel[f]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={libelle}>Crédibilité de l'info</label>
              <select value={credibilite} onChange={(e) => setCredibilite(Number(e.target.value))} className={champ}>
                {credibilites.map((c) => (
                  <option key={c} value={c}>
                    {c} · {credibiliteLabel[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={libelle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Effectifs, armement, attitude, direction..."
              className={`${champ} resize-none`}
            />
          </div>
        </div>

        {erreur && <div className="border-t border-slate-800 px-4 py-2 text-xs text-red-400">{erreur}</div>}

        <div className="flex justify-end gap-2 border-t border-slate-800 px-4 py-3">
          <button
            onClick={onFermer}
            className="rounded border border-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:bg-slate-900"
          >
            Annuler
          </button>
          <button
            disabled={!estValide || enCours}
            onClick={soumettre}
            className="rounded bg-red-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {enCours ? 'Enregistrement…' : 'Diffuser le renseignement'}
          </button>
        </div>
      </div>
    </div>
  )
}
