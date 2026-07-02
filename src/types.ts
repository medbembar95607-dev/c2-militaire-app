export type TypeUnite = 'pc' | 'infanterie' | 'artillerie' | 'genie' | 'logistique'
export type EchelonUnite = 'groupement' | 'bataillon' | 'compagnie' | 'section'
export type StatutUnite = 'active' | 'dissoute' | 'en_reserve'

export interface Unite {
  id: string
  nom: string
  typeUnite: TypeUnite
  echelon: EchelonUnite
  statut: StatutUnite
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
