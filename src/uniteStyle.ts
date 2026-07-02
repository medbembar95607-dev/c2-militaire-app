import type { EchelonUnite, TypeUnite } from './types'

export const typeUniteStyle: Record<TypeUnite, { label: string; sigle: string; text: string; bg: string; border: string; marker: string }> = {
  pc: { label: 'PC / Cdt.', sigle: 'PC', text: 'text-purple-300', bg: 'bg-purple-950', border: 'border-purple-500', marker: 'bg-purple-600' },
  infanterie: { label: 'Infanterie', sigle: 'INF', text: 'text-blue-300', bg: 'bg-blue-950', border: 'border-blue-500', marker: 'bg-blue-600' },
  artillerie: { label: 'Artillerie', sigle: 'ART', text: 'text-amber-300', bg: 'bg-amber-950', border: 'border-amber-500', marker: 'bg-amber-600' },
  genie: { label: 'Génie', sigle: 'GÉN', text: 'text-emerald-300', bg: 'bg-emerald-950', border: 'border-emerald-500', marker: 'bg-emerald-600' },
  logistique: { label: 'Logistique', sigle: 'LOG', text: 'text-cyan-300', bg: 'bg-cyan-950', border: 'border-cyan-500', marker: 'bg-cyan-600' },
}

// SIDC APP-6/MIL-STD-2525E : unité terrestre amie présente (SFGP) + function id.
// Échelon volontairement absent du SIDC, déjà affiché séparément via echelonChiffre.
export const typeUniteSidc: Record<TypeUnite, string> = {
  pc: 'SFGPU---------------',
  infanterie: 'SFGPUCI-------------',
  artillerie: 'SFGPUCF-------------',
  genie: 'SFGPUCE-------------',
  logistique: 'SFGPUSS-------------',
}

// Couleur de remplissage APP-6 standard pour une unité amie (bleu/cyan).
export const couleurAmie = '#3b82f6'

export const echelonChiffre: Record<EchelonUnite, string> = {
  groupement: 'III',
  bataillon: 'II',
  compagnie: 'I',
  section: '',
}

export const echelonLabel: Record<EchelonUnite, string> = {
  groupement: 'Groupement',
  bataillon: 'Bataillon',
  compagnie: 'Compagnie',
  section: 'Section',
}
