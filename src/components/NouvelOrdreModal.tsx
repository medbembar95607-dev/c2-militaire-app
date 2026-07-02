import { useState } from 'react'
import { X } from 'lucide-react'
import type { Ordre, PrioriteOrdre, TypeOrdre, Unite } from '../types'
import { messageErreur } from '../erreurUtils'

interface NouvelOrdreModalProps {
  unites: Unite[]
  uniteEmettriceId: string
  onFermer: () => void
  onCreer: (ordre: Ordre) => Promise<void>
}

const typesOrdre: TypeOrdre[] = ['OPORD', 'FRAGO', 'WARNO']
const priorites: PrioriteOrdre[] = ['normal', 'urgent', 'flash']

const prioriteActiveStyle: Record<PrioriteOrdre, string> = {
  normal: 'border-slate-500 bg-slate-600 text-white',
  urgent: 'border-orange-500 bg-orange-600 text-white',
  flash: 'border-red-500 bg-red-600 text-white',
}

export function NouvelOrdreModal({ unites, uniteEmettriceId, onFermer, onCreer }: NouvelOrdreModalProps) {
  const [titre, setTitre] = useState('')
  const [typeOrdre, setTypeOrdre] = useState<TypeOrdre>('FRAGO')
  const [priorite, setPriorite] = useState<PrioriteOrdre>('normal')
  const [contenu, setContenu] = useState('')
  const [dateLimiteExecution, setDateLimiteExecution] = useState('')
  const [destinatairesIds, setDestinatairesIds] = useState<string[]>([])
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const uniteEmettrice = unites.find((u) => u.id === uniteEmettriceId)
  const unitesDestinatairesPossibles = unites.filter((u) => u.id !== uniteEmettriceId)
  const estValide = titre.trim().length > 0 && contenu.trim().length > 0 && destinatairesIds.length > 0

  function basculerDestinataire(id: string) {
    setDestinatairesIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  async function soumettre(statut: 'brouillon' | 'envoye') {
    if (!estValide || enCours) return
    setEnCours(true)
    setErreur(null)
    try {
      await onCreer({
        id: crypto.randomUUID(),
        titre: titre.trim(),
        typeOrdre,
        priorite,
        statut,
        uniteEmettriceId,
        contenu: contenu.trim(),
        dateLimiteExecution: dateLimiteExecution || undefined,
        destinataires: destinatairesIds.map((id) => ({ uniteDestinataireId: id, statut: 'envoye' as const })),
      })
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
            <div className="text-sm font-bold uppercase tracking-wide text-slate-100">Nouvel ordre</div>
            <div className="text-xs text-slate-500">Émetteur : {uniteEmettrice?.nom ?? '—'}</div>
          </div>
          <button onClick={onFermer} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Titre</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. FRAGO 14 – ..."
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Type</label>
              <div className="flex gap-1">
                {typesOrdre.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeOrdre(type)}
                    className={`flex-1 rounded border px-2 py-1.5 text-xs font-bold ${
                      typeOrdre === type
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Priorité</label>
              <div className="flex gap-1">
                {priorites.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorite(p)}
                    className={`flex-1 rounded border px-2 py-1.5 text-xs font-bold uppercase ${
                      priorite === p ? prioriteActiveStyle[p] : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Contenu</label>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              rows={4}
              placeholder="Texte de l'ordre..."
              className="w-full resize-none rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Date limite d'exécution (optionnel)
            </label>
            <input
              type="datetime-local"
              value={dateLimiteExecution}
              onChange={(e) => setDateLimiteExecution(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Destinataires ({destinatairesIds.length})
            </label>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-slate-800 p-2">
              {unitesDestinatairesPossibles.map((unite) => (
                <label
                  key={unite.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={destinatairesIds.includes(unite.id)}
                    onChange={() => basculerDestinataire(unite.id)}
                    className="accent-blue-600"
                  />
                  {unite.nom}
                </label>
              ))}
            </div>
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
            onClick={() => soumettre('brouillon')}
            className="rounded border border-slate-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enregistrer brouillon
          </button>
          <button
            disabled={!estValide || enCours}
            onClick={() => soumettre('envoye')}
            className="rounded bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {enCours ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  )
}
