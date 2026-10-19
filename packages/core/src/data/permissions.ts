import type { StaffRole } from '../types'

export type Permission =
  | 'podania.citat'
  | 'podania.menit_stav'
  | 'podania.mazat'
  | 'pouzivatelia.spravovat'
  /** vidí podania všetkých agend, nielen tie svoje */
  | 'podania.vidiet_vsetky'
  | 'demo.obnovit'

const REFERENT: Permission[] = ['podania.citat', 'podania.menit_stav']

const MATICA: Record<StaffRole, Permission[]> = {
  super_admin: [
    'podania.citat',
    'podania.menit_stav',
    'podania.mazat',
    'pouzivatelia.spravovat',
    'podania.vidiet_vsetky',
    'demo.obnovit',
  ],
  referent_stavebny: REFERENT,
  referent_dopravy: REFERENT,
  referent_adries: REFERENT,
  citatel: ['podania.citat', 'podania.vidiet_vsetky'],
}

/** Jednoduchý pomocník pre oprávnenia. Ďalšiu rolu pridáte do matice. */
export function can(role: StaffRole | undefined, p: Permission): boolean {
  if (!role) return false
  return MATICA[role]?.includes(p) ?? false
}
