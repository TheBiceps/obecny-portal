import type { StaffRole } from '../types'

export type Permission =
  | 'podania.citat'
  | 'podania.menit_stav'
  | 'podania.mazat'
  | 'pouzivatelia.spravovat'
  | 'demo.obnovit'

const MATICA: Record<StaffRole, Permission[]> = {
  super_admin: [
    'podania.citat',
    'podania.menit_stav',
    'podania.mazat',
    'pouzivatelia.spravovat',
    'demo.obnovit',
  ],
  referent: ['podania.citat', 'podania.menit_stav'],
  citatel: ['podania.citat'],
}

/** Jednoduchý pomocník pre oprávnenia. Ďalšiu rolu pridáte do matice. */
export function can(role: StaffRole | undefined, p: Permission): boolean {
  if (!role) return false
  return MATICA[role]?.includes(p) ?? false
}
