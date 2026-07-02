import { supabase } from '../supabaseClient'

export interface ProfilBrut {
  nomComplet: string
  grade: string
  role: string
  uniteId: string
}

const roleLabel: Record<string, string> = {
  admin: 'Administrateur',
  commandant: 'Commandant',
  officier_operations: 'Chef Ops',
  operateur: 'Opérateur',
  observateur: 'Observateur',
}

export async function chargerProfil(userId: string): Promise<ProfilBrut> {
  const { data, error } = await supabase
    .from('profils')
    .select('nom_complet, grade, role, unite_id')
    .eq('id', userId)
    .single()

  if (error) throw error

  return {
    nomComplet: data.nom_complet,
    grade: data.grade,
    role: roleLabel[data.role] ?? data.role,
    uniteId: data.unite_id,
  }
}
