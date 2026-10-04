export type TypeUnite = 'pc' | 'infanterie' | 'artillerie' | 'genie' | 'logistique'
export type EchelonUnite = 'groupement' | 'bataillon' | 'compagnie' | 'section'
export type StatutUnite = 'active' | 'dissoute' | 'en_reserve'

export interface Unite {
  id: string
  nom: string
  typeUnite: TypeUnite
  echelon: EchelonUnite
  statut: StatutUnite
  uniteParentId: string | null
  lon: number
  lat: number
  coordonneesMgrs: string
  vuA: string
}

export type TypeOrdre = 'OPORD' | 'FRAGO' | 'WARNO'
export type PrioriteOrdre = 'normal' | 'urgent' | 'flash'
export type StatutOrdre = 'brouillon' | 'envoye' | 'annule'
export type StatutDestinataire = 'envoye' | 'recu' | 'accuse' | 'execute'

export interface OrdreDestinataire {
  uniteDestinataireId: string
  statut: StatutDestinataire
}

export interface Ordre {
  id: string
  titre: string
  typeOrdre: TypeOrdre
  priorite: PrioriteOrdre
  statut: StatutOrdre
  uniteEmettriceId: string
  contenu: string
  dateLimiteExecution?: string
  destinataires: OrdreDestinataire[]
}

export interface Profil {
  id: string
  nomComplet: string
  grade: string
  role: string
  uniteId: string
  uniteNom: string
}

export type TypeMenace = 'infanterie' | 'blinde' | 'artillerie' | 'reconnaissance' | 'engin_explosif' | 'inconnu'
export type AffiliationMenace = 'hostile' | 'suspect' | 'inconnu'
export type SourceRenseignement = 'observation' | 'humint' | 'sigint' | 'imint' | 'osint'
export type FiabiliteSource = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export type StatutRenseignement = 'actif' | 'neutralise' | 'perime'

export interface Renseignement {
  id: string
  titre: string
  description: string
  typeMenace: TypeMenace
  affiliation: AffiliationMenace
  source: SourceRenseignement
  fiabiliteSource: FiabiliteSource
  credibiliteInfo: number
  statut: StatutRenseignement
  lon: number
  lat: number
  coordonneesMgrs: string
  horodatageObservation: string
  uniteSourceId: string
}

export type Ressource = 'carburant' | 'munitions' | 'eau' | 'vivres' | 'sante'
export type PrioriteDemande = 'routine' | 'urgent' | 'vital'
export type StatutDemande = 'demandee' | 'en_cours' | 'livree' | 'refusee'

export interface Stock {
  id: string
  uniteId: string
  ressource: Ressource
  quantite: number
  capacite: number
  uniteMesure: string
  misAJourLe: string
}

export interface DemandeRavitaillement {
  id: string
  uniteDemandeuseId: string
  ressource: Ressource
  quantite: number
  priorite: PrioriteDemande
  statut: StatutDemande
  commentaire: string
  creeLe: string
}
