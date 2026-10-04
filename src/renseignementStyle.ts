import type {
  AffiliationMenace,
  FiabiliteSource,
  Renseignement,
  SourceRenseignement,
  StatutRenseignement,
  TypeMenace,
} from './types'

// SIDC APP-6/MIL-STD-2525C : la 2e lettre porte l'affiliation (H hostile,
// S suspect, U inconnu), le reste la fonction (unité terrestre ou équipement).
const fonctionSidc: Record<TypeMenace, string> = {
  infanterie: 'GPUCI-------------',
  blinde: 'GPUCA-------------',
  artillerie: 'GPUCF-------------',
  reconnaissance: 'GPUCR-------------',
  engin_explosif: 'GPEXI-------------',
  inconnu: 'GPU---------------',
}

const lettreAffiliation: Record<AffiliationMenace, string> = { hostile: 'H', suspect: 'S', inconnu: 'U' }

export function sidcRenseignement(r: Pick<Renseignement, 'typeMenace' | 'affiliation'>): string {
  return `S${lettreAffiliation[r.affiliation]}${fonctionSidc[r.typeMenace]}`
}

export const typeMenaceLabel: Record<TypeMenace, string> = {
  infanterie: 'Infanterie',
  blinde: 'Blindés',
  artillerie: 'Artillerie',
  reconnaissance: 'Reconnaissance',
  engin_explosif: 'Engin explosif (IED)',
  inconnu: 'Non identifié',
}

export const affiliationLabel: Record<AffiliationMenace, string> = {
  hostile: 'Hostile',
  suspect: 'Suspect',
  inconnu: 'Inconnu',
}

export const sourceLabel: Record<SourceRenseignement, string> = {
  observation: 'Observation directe',
  humint: 'HUMINT',
  sigint: 'SIGINT',
  imint: 'IMINT',
  osint: 'OSINT',
}

export const fiabiliteLabel: Record<FiabiliteSource, string> = {
  A: 'Totalement fiable',
  B: 'Habituellement fiable',
  C: 'Assez fiable',
  D: 'Pas toujours fiable',
  E: 'Peu fiable',
  F: 'Fiabilité inconnue',
}

export const credibiliteLabel: Record<number, string> = {
  1: 'Confirmée',
  2: 'Probablement vraie',
  3: 'Possiblement vraie',
  4: 'Douteuse',
  5: 'Improbable',
  6: 'Non évaluable',
}

export const statutRenseignementStyle: Record<StatutRenseignement, { label: string; className: string }> = {
  actif: { label: 'Actif', className: 'bg-red-700 text-white' },
  neutralise: { label: 'Neutralisé', className: 'bg-emerald-800 text-white' },
  perime: { label: 'Périmé', className: 'bg-slate-700 text-slate-300' },
}

// Cotation OTAN : A1-B2 solide, C3 à vérifier, au-delà fragile.
export function cotationClassName(r: Pick<Renseignement, 'fiabiliteSource' | 'credibiliteInfo'>): string {
  const score = 'ABCDEF'.indexOf(r.fiabiliteSource) + r.credibiliteInfo
  if (score <= 3) return 'border-emerald-600 text-emerald-400'
  if (score <= 5) return 'border-amber-600 text-amber-400'
  return 'border-slate-600 text-slate-400'
}
