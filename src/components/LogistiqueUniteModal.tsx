import { useState } from 'react'
import { X } from 'lucide-react'
import type { DemandeRavitaillement, PrioriteDemande, Ressource, Stock, Unite } from '../types'
import { formatQuantite, niveauStock, niveauStyle, prioriteDemandeStyle, ressourceLabel, ressources } from '../logistiqueStyle'
import { messageErreur } from '../erreurUtils'

interface LogistiqueUniteModalProps {
  unite: Unite
  stocks: Stock[]
  // Seule l'unité elle-même met à jour ses stocks et demande un ravitaillement.
  estMonUnite: boolean
  onFermer: () => void
  onMettreAJour: (quantites: { id: string; quantite: number }[]) => Promise<void>
  onDemander: (d: DemandeRavitaillement) => Promise<void>
}

type Mode = 'consultation' | 'compte_rendu' | 'demande'

const libelle = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500'
const champ =
  'w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500'
const priorites: PrioriteDemande[] = ['routine', 'urgent', 'vital']

export function LogistiqueUniteModal({ unite, stocks, estMonUnite, onFermer, onMettreAJour, onDemander }: LogistiqueUniteModalProps) {
  const [mode, setMode] = useState<Mode>('consultation')
  const [saisies, setSaisies] = useState<Record<string, string>>(() =>
    Object.fromEntries(stocks.map((s) => [s.id, String(s.quantite)])),
  )
  const [ressource, setRessource] = useState<Ressource>(
    () => [...stocks].sort((a, b) => a.quantite / a.capacite - b.quantite / b.capacite)[0]?.ressource ?? 'carburant',
  )
  const [quantite, setQuantite] = useState('')
  const [priorite, setPriorite] = useState<PrioriteDemande>('routine')
  const [commentaire, setCommentaire] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const stockParRessource = new Map(stocks.map((s) => [s.ressource, s]))
  const stockDemande = stockParRessource.get(ressource)

  const saisiesValides = stocks.every((s) => {
    const v = Number(saisies[s.id])
    return saisies[s.id] !== '' && v >= 0 && v <= s.capacite
  })
  const quantiteValide = Number(quantite) > 0

  async function executer(action: () => Promise<void>) {
    setEnCours(true)
    setErreur(null)
    try {
      await action()
    } catch (err) {
      setErreur(messageErreur(err))
      setEnCours(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="flex max-h-full w-full max-w-lg flex-col rounded border border-slate-700 bg-slate-950 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-slate-100">Situation logistique</div>
            <div className="text-xs text-slate-500">{unite.nom}</div>
          </div>
          <button onClick={onFermer} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {mode !== 'demande' &&
            ressources.map((r) => {
              const s = stockParRessource.get(r)
              if (!s) return null
              const quantiteAffichee = mode === 'compte_rendu' ? Number(saisies[s.id]) || 0 : s.quantite
              const pct = Math.min(100, Math.round((quantiteAffichee / s.capacite) * 100))
              const style = niveauStyle[niveauStock({ quantite: quantiteAffichee, capacite: s.capacite })]
              return (
                <div key={r}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-200">{ressourceLabel[r].label}</span>
                    {mode === 'compte_rendu' ? (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <input
                          type="number"
                          min={0}
                          max={s.capacite}
                          value={saisies[s.id]}
                          onChange={(e) => setSaisies((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          aria-label={`Quantité ${ressourceLabel[r].label}`}
                          className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-sm text-slate-100 outline-none focus:border-blue-500"
                        />
                        / {formatQuantite(s.capacite)} {s.uniteMesure}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {formatQuantite(s.quantite)} / {formatQuantite(s.capacite)} {s.uniteMesure}
                        <span className={`ml-2 font-bold ${style.texte}`}>{pct} %</span>
                      </span>
                    )}
                  </div>
                  <div className="h-2 rounded bg-slate-800">
                    <div className={`h-2 rounded ${style.barre}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}

          {mode === 'consultation' && stocks[0] && (
            <div className="pt-1 text-[11px] text-slate-500">
              Dernier compte rendu : {new Date(Math.max(...stocks.map((s) => Date.parse(s.misAJourLe)))).toLocaleString('fr-FR')}
            </div>
          )}

          {mode === 'demande' && (
            <>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={libelle}>Ressource</label>
                  <select value={ressource} onChange={(e) => setRessource(e.target.value as Ressource)} className={champ}>
                    {ressources.map((r) => (
                      <option key={r} value={r}>
                        {ressourceLabel[r].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={libelle}>Quantité {stockDemande ? `(${stockDemande.uniteMesure})` : ''}</label>
                  <input type="number" min={1} value={quantite} onChange={(e) => setQuantite(e.target.value)} className={champ} />
                </div>
              </div>
              {stockDemande && (
                <div className="text-[11px] text-slate-500">
                  Stock actuel : {formatQuantite(stockDemande.quantite)} / {formatQuantite(stockDemande.capacite)} {stockDemande.uniteMesure}.
                  Manque pour le plein : {formatQuantite(stockDemande.capacite - stockDemande.quantite)}.
                </div>
              )}
              <div>
                <label className={libelle}>Priorité</label>
                <div className="flex gap-1">
                  {priorites.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorite(p)}
                      className={`flex-1 rounded border px-2 py-1.5 text-xs font-bold uppercase ${
                        priorite === p ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'
                      }`}
                    >
                      {prioriteDemandeStyle[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={libelle}>Commentaire (optionnel)</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={2}
                  placeholder="Contexte, point de livraison, délai..."
                  className={`${champ} resize-none`}
                />
              </div>
            </>
          )}
        </div>

        {erreur && <div className="border-t border-slate-800 px-4 py-2 text-xs text-red-400">{erreur}</div>}

        <div className="flex justify-end gap-2 border-t border-slate-800 px-4 py-3">
          {mode === 'consultation' ? (
            <>
              <button
                onClick={onFermer}
                className="mr-auto rounded border border-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:bg-slate-900"
              >
                Fermer
              </button>
              {estMonUnite && (
                <>
                  <button
                    onClick={() => setMode('compte_rendu')}
                    className="rounded border border-slate-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-800"
                  >
                    Mettre à jour
                  </button>
                  <button
                    onClick={() => setMode('demande')}
                    className="rounded bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-500"
                  >
                    Demander un ravitaillement
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setMode('consultation')
                  setErreur(null)
                }}
                className="rounded border border-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:bg-slate-900"
              >
                Retour
              </button>
              {mode === 'compte_rendu' ? (
                <button
                  disabled={!saisiesValides || enCours}
                  onClick={() =>
                    executer(() =>
                      onMettreAJour(
                        stocks
                          .filter((s) => Number(saisies[s.id]) !== s.quantite)
                          .map((s) => ({ id: s.id, quantite: Number(saisies[s.id]) })),
                      ),
                    )
                  }
                  className="rounded bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enCours ? 'Enregistrement…' : 'Envoyer le compte rendu'}
                </button>
              ) : (
                <button
                  disabled={!quantiteValide || enCours}
                  onClick={() =>
                    executer(() =>
                      onDemander({
                        id: crypto.randomUUID(),
                        uniteDemandeuseId: unite.id,
                        ressource,
                        quantite: Number(quantite),
                        priorite,
                        statut: 'demandee',
                        commentaire: commentaire.trim(),
                        creeLe: new Date().toISOString(),
                      }),
                    )
                  }
                  className="rounded bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enCours ? 'Envoi…' : 'Envoyer la demande'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
