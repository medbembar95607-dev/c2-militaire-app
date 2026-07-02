import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Header } from './components/Header'
import { TacticalMap } from './components/TacticalMap'
import { SidePanel } from './components/SidePanel'
import { NouvelOrdreModal } from './components/NouvelOrdreModal'
import { OrdreDetailModal } from './components/OrdreDetailModal'
import { LoginScreen } from './components/LoginScreen'
import { EcranStatut } from './components/EcranStatut'
import { supabase } from './supabaseClient'
import { chargerUnites } from './data/unitesRepository'
import { chargerProfil } from './data/profilRepository'
import { chargerOrdres, creerOrdre as creerOrdreDb, envoyerOrdre as envoyerOrdreDb } from './data/ordresRepository'
import { messageErreur } from './erreurUtils'
import type { Ordre, Profil, Unite } from './types'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [unites, setUnites] = useState<Unite[] | null>(null)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [ordres, setOrdres] = useState<Ordre[] | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const [selectedUniteId, setSelectedUniteId] = useState<string | null>(null)
  const [enLigne, setEnLigne] = useState(true)
  const [ongletActif, setOngletActif] = useState<'unites' | 'ordres'>('unites')
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [ordreSelectionneId, setOrdreSelectionneId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    Promise.all([chargerUnites(), chargerOrdres()])
      .then(([u, o]) => {
        setUnites(u)
        setOrdres(o)
      })
      .catch((err) => {
        console.error(err)
        setErreur(messageErreur(err))
      })
  }, [session])

  useEffect(() => {
    if (!session || !unites) return
    chargerProfil(session.user.id)
      .then((p) => {
        const unite = unites.find((u) => u.id === p.uniteId)
        setProfil({ id: session.user.id, ...p, uniteNom: unite?.nom ?? '—' })
        setSelectedUniteId(p.uniteId)
      })
      .catch((err) => {
        console.error(err)
        setErreur(messageErreur(err))
      })
  }, [session, unites])

  const ordreSelectionne = ordres?.find((o) => o.id === ordreSelectionneId) ?? null

  async function creerOrdre(ordre: Ordre) {
    if (!profil) return
    await creerOrdreDb(ordre, profil.id)
    setOrdres((prev) => [ordre, ...(prev ?? [])])
    setModaleOuverte(false)
    setOngletActif('ordres')
  }

  async function envoyerOrdre(id: string) {
    await envoyerOrdreDb(id)
    setOrdres((prev) => (prev ?? []).map((o) => (o.id === id ? { ...o, statut: 'envoye' } : o)))
    setOrdreSelectionneId(null)
  }

  if (erreur) {
    return (
      <EcranStatut
        titre="Impossible de charger les données"
        sousTitre={erreur}
        erreur
        onReessayer={() => window.location.reload()}
      />
    )
  }

  if (session === undefined) {
    return <EcranStatut titre="Vérification de la session…" />
  }

  if (session === null) {
    return <LoginScreen />
  }

  if (!unites || !profil || !ordres) {
    return <EcranStatut titre="Chargement du dispositif…" />
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <Header
        profil={profil}
        zone="ORION"
        tempsEcoule="H+04:12"
        heureGmt="06:42"
        enLigne={enLigne}
        modificationsEnAttente={3}
        onBasculerLiaison={() => setEnLigne((v) => !v)}
        onDeconnexion={() => supabase.auth.signOut()}
      />
      <div className="flex min-h-0 flex-1">
        <TacticalMap unites={unites} selectedUniteId={selectedUniteId} onSelectUnite={setSelectedUniteId} />
        <SidePanel
          unites={unites}
          ordres={ordres}
          selectedUniteId={selectedUniteId}
          onSelectUnite={setSelectedUniteId}
          ongletActif={ongletActif}
          onChangerOnglet={setOngletActif}
          onNouvelOrdre={() => setModaleOuverte(true)}
          onSelectOrdre={setOrdreSelectionneId}
        />
      </div>
      {modaleOuverte && (
        <NouvelOrdreModal
          unites={unites}
          uniteEmettriceId={profil.uniteId}
          onFermer={() => setModaleOuverte(false)}
          onCreer={creerOrdre}
        />
      )}
      {ordreSelectionne && (
        <OrdreDetailModal
          ordre={ordreSelectionne}
          unites={unites}
          onFermer={() => setOrdreSelectionneId(null)}
          onEnvoyer={envoyerOrdre}
        />
      )}
    </div>
  )
}
