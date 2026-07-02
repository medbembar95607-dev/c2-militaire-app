import { useState } from 'react'
import { supabase } from '../supabaseClient'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault()
    setEnCours(true)
    setErreur(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
    setEnCours(false)
    if (error) setErreur('Identifiants incorrects.')
  }

  return (
    <div className="flex h-full items-center justify-center bg-slate-950">
      <form
        onSubmit={seConnecter}
        className="w-full max-w-sm rounded border border-slate-700 bg-slate-900 p-6 text-slate-200"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-700 bg-slate-950 text-sm font-bold tracking-wide text-slate-300">
            C2
          </div>
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-wide text-slate-100">Poste de commandement</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Connexion</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Identifiant
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Mot de passe
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {erreur && <div className="mt-3 text-xs text-red-400">{erreur}</div>}

        <button
          type="submit"
          disabled={enCours}
          className="mt-5 w-full rounded bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enCours ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
