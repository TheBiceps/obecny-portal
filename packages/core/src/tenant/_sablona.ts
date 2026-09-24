import type { TenantConfig } from './types'

/**
 * Šablóna pre novú obec.
 * Skopírujte tento súbor, premenujte ho podľa obce, vyplňte údaje
 * a zaregistrujte obec v súbore index.ts.
 */
export const sablonaObce: TenantConfig = {
  id: 'nova-obec',
  nazov: 'Obec Nová',
  nazovKratky: 'Nová',
  kodObce: '000000',
  okres: 'Okres',
  kraj: 'Kraj',
  web: 'https://www.nova-obec.sk',
  katastralneUzemia: ['Nová'],
  urad: {
    nazovUradu: 'Obecný úrad',
    ulica: 'Hlavná 1',
    psc: '000 01',
    obec: 'Nová',
    email: 'podatelna@nova-obec.sk',
    telefon: '+421 900 000 000',
    strankoveHodiny: [{ den: 'Pondelok', cas: '8.00 až 15.00' }],
  },
  branding: {
    primary: '#1E40AF',
    primaryDark: '#152F80',
    accent: '#15803D',
    erbSrc: 'erb-placeholder.svg',
    erbAlt: 'Erb obce Nová',
  },
  povoleneFormulare: ['vjazd-160-1996', 'potvrdenie-vek-stavby'],
  predvolenaAdresa: { obec: 'Nová', psc: '000 01' },
}
