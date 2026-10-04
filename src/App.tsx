import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Header } from './components/Header'
import { TacticalMap } from './components/TacticalMap'
import { SidePanel, type OngletPanneau } from './components/SidePanel'
import { NouvelOrdreModal } from './components/NouvelOrdreModal'
import { OrdreDetailModal } from './components/OrdreDetailModal'
import { NouveauRenseignementModal } from './components/NouveauRenseignementModal'
import { RenseignementDetailModal } from './components/RenseignementDetailModal'
import { LogistiquePanel } from './components/LogistiquePanel'
import { LogistiqueUniteModal } from './components/LogistiqueUniteModal'
import { LoginScreen } from './components/LoginScreen'
import { EcranStatut } from './components/EcranStatut'
import { supabase } from './supabaseClient'
import { chargerUnites } from './data/unitesRepository'
import { chargerProfil } from './data/profilRepository'
import { chargerOrdres, creerOrdre as creerOrdreDb, envoyerOrdre as envoyerOrdreDb } from './data/ordresRepository'
import {
  changerStatutRenseignement,
  chargerRenseignements,
  creerRenseignement as creerRenseignementDb,
} from './data/renseignementsRepository'
import {
  changerStatutDemande,
  chargerDemandes,
  chargerStocks,
  creerDemande,
  livrerDemande,
  mettreAJourStocks,
} from './data/logistiqueRepository'
import { pireNiveau, type NiveauStock } from './logistiqueStyle'
import { messageErreur } from './erreurUtils'
import type { DemandeRavitaillement, Ordre, Profil, Renseignement, StatutRenseignement, Stock, Unite } from './types'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [unites, setUnites] = useState<Unite[] | null>(null)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [ordres, setOrdres] = useState<Ordre[] | null>(null)
  const [renseignements, setRenseignements] = useState<Renseignement[] | null>(null)
  const [stocks, setStocks] = useState<Stock[] | null>(null)
  const [demandes, setDemandes] = useState<DemandeRavitaillement[] | null>(null)
  const [uniteLogOuverteId, setUniteLogOuverteId] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const [selectedUniteId, setSelectedUniteId] = useState<string | null>(null)
  const [enLigne, setEnLigne] = useState(true)
  const [ongletActif, setOngletActif] = useState<OngletPanneau>('unites')
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [ordreSelectionneId, setOrdreSelectionneId] = useState<string | null>(null)

  const [selectedRenseignementId, setSelectedRenseignementId] = useState<string | null>(null)
  const [renseignementOuvertId, setRenseignementOuvertId] = useState<string | null>(null)
  const [modaleRensOuverte, setModaleRensOuverte] = useState(false)
  const [modePlacement, setModePlacement] = useState(false)
  const [positionRens, setPositionRens] = useState<{ lon: number; lat: number } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    Promise.all([chargerUnites(), chargerOrdres(), chargerRenseignements(), chargerStocks(), chargerDemandes()])
      .then(([u, o, r, s, d]) => {
        setUnites(u)
        setOrdres(o)
        setRenseignements(r)
        setStocks(s)
        setDemandes(d)
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
  const renseignementOuvert = renseignements?.find((r) => r.id === renseignementOuvertId) ?? null

  // Même règle que la policy RLS : mon unité et toutes ses unités filles.
  // Sert uniquement à masquer les actions interdites, la base reste l'arbitre.
  const mesUnitesEtDescendantes = new Set<string>()
  if (profil && unites) {
    const aTraiter = [profil.uniteId]
    while (aTraiter.length) {
      const id = aTraiter.pop()!
      mesUnitesEtDescendantes.add(id)
      unites.filter((u) => u.uniteParentId === id).forEach((u) => aTraiter.push(u.id))
    }
  }

  // Une seule sélection carte à la fois : unité amie ou menace.
  function selectionnerUnite(id: string) {
    setSelectedRenseignementId(null)
    setSelectedUniteId(id)
  }

  function selectionnerRenseignement(id: string) {
    setSelectedUniteId(null)
    setSelectedRenseignementId(id)
    setOngletActif('rens')
  }

  function ouvrirNouveauRenseignement() {
    setPositionRens(null)
    setModaleRensOuverte(true)
  }

  function fermerNouveauRenseignement() {
    setModaleRensOuverte(false)
    setModePlacement(false)
  }

  async function creerRenseignement(r: Renseignement) {
    if (!profil) return
    await creerRenseignementDb(r, profil.id)
    setRenseignements((prev) => [r, ...(prev ?? [])])
    setModaleRensOuverte(false)
    selectionnerRenseignement(r.id)
  }

  const estLogistique = unites?.find((u) => u.id === profil?.uniteId)?.typeUnite === 'logistique'
  const niveauLogistiqueParUnite: Record<string, NiveauStock> = Object.fromEntries(
    (unites ?? []).map((u) => [u.id, pireNiveau((stocks ?? []).filter((s) => s.uniteId === u.id))]),
  )
  const nbAlertesLogistique = (unites ?? []).filter((u) => niveauLogistiqueParUnite[u.id] === 'critique').length
  const uniteLogOuverte = unites?.find((u) => u.id === uniteLogOuverteId) ?? null

  async function rechargerLogistique() {
    const [s, d] = await Promise.all([chargerStocks(), chargerDemandes()])
    setStocks(s)
    setDemandes(d)
  }

  async function mettreAJourMesStocks(quantites: { id: string; quantite: number }[]) {
    if (!profil) return
    await mettreAJourStocks(quantites, profil.id)
    await rechargerLogistique()
    setUniteLogOuverteId(null)
  }

  async function demanderRavitaillement(d: DemandeRavitaillement) {
    if (!profil) return
    await creerDemande(d, profil.id)
    setDemandes((prev) => [d, ...(prev ?? [])])
    setUniteLogOuverteId(null)
  }

  async function traiterDemande(id: string, statut: 'en_cours' | 'refusee') {
    await changerStatutDemande(id, statut)
    setDemandes((prev) => (prev ?? []).map((d) => (d.id === id ? { ...d, statut } : d)))
  }

  async function livrer(id: string) {
    await livrerDemande(id)
    // Le stock de l'unité demandeuse a été crédité côté base : on relit tout.
    await rechargerLogistique()
  }

  async function changerStatut(id: string, statut: StatutRenseignement) {
    await changerStatutRenseignement(id, statut)
    setRenseignements((prev) => (prev ?? []).map((r) => (r.id === id ? { ...r, statut } : r)))
    setRenseignementOuvertId(null)
  }

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

  if (!unites || !profil || !ordres || !renseignements || !stocks || !demandes) {
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
        <TacticalMap
          unites={unites}
          renseignements={renseignements}
          niveauLogistiqueParUnite={niveauLogistiqueParUnite}
          selectedUniteId={selectedUniteId}
          onSelectUnite={selectionnerUnite}
          selectedRenseignementId={selectedRenseignementId}
          onSelectRenseignement={selectionnerRenseignement}
          modePlacement={modePlacement}
          onPlacer={(lon, lat) => {
            setPositionRens({ lon, lat })
            setModePlacement(false)
          }}
          onAnnulerPlacement={() => setModePlacement(false)}
        />
        <SidePanel
          unites={unites}
          ordres={ordres}
          renseignements={renseignements}
          selectedUniteId={selectedUniteId}
          onSelectUnite={selectionnerUnite}
          selectedRenseignementId={selectedRenseignementId}
          onSelectRenseignement={selectionnerRenseignement}
          ongletActif={ongletActif}
          onChangerOnglet={setOngletActif}
          onNouvelOrdre={() => setModaleOuverte(true)}
          onSelectOrdre={setOrdreSelectionneId}
          onNouveauRenseignement={ouvrirNouveauRenseignement}
          onOuvrirRenseignement={setRenseignementOuvertId}
          nbAlertesLogistique={nbAlertesLogistique}
          contenuLogistique={
            <LogistiquePanel
              unites={unites}
              stocks={stocks}
              demandes={demandes}
              estLogistique={estLogistique}
              onOuvrirUnite={(id) => {
                selectionnerUnite(id)
                setUniteLogOuverteId(id)
              }}
              onPrendreEnCharge={(id) => traiterDemande(id, 'en_cours')}
              onLivrer={livrer}
              onRefuser={(id) => traiterDemande(id, 'refusee')}
            />
          }
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
      {modaleRensOuverte && (
        <NouveauRenseignementModal
          unites={unites}
          uniteSourceId={profil.uniteId}
          position={positionRens}
          masquee={modePlacement}
          onDemanderPlacement={() => setModePlacement(true)}
          onFermer={fermerNouveauRenseignement}
          onCreer={creerRenseignement}
        />
      )}
      {uniteLogOuverte && (
        <LogistiqueUniteModal
          unite={uniteLogOuverte}
          stocks={stocks.filter((s) => s.uniteId === uniteLogOuverte.id)}
          estMonUnite={uniteLogOuverte.id === profil.uniteId}
          onFermer={() => setUniteLogOuverteId(null)}
          onMettreAJour={mettreAJourMesStocks}
          onDemander={demanderRavitaillement}
        />
      )}
      {renseignementOuvert && (
        <RenseignementDetailModal
          renseignement={renseignementOuvert}
          unites={unites}
          peutModifier={mesUnitesEtDescendantes.has(renseignementOuvert.uniteSourceId)}
          onFermer={() => setRenseignementOuvertId(null)}
          onLocaliser={(id) => {
            setRenseignementOuvertId(null)
            selectionnerRenseignement(id)
          }}
          onChangerStatut={changerStatut}
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
