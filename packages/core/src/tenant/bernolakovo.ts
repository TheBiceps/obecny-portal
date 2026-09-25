import type { TenantConfig } from './types'

export const bernolakovo: TenantConfig = {
  id: 'bernolakovo',
  nazov: 'Obec Bernolákovo',
  nazovKratky: 'Bernolákovo',
  kodObce: '507814',
  okres: 'Senec',
  kraj: 'Bratislavský',
  web: 'https://www.bernolakovo.sk',
  katastralneUzemia: ['Bernolákovo'],
  urad: {
    nazovUradu: 'Obecný úrad',
    ulica: 'Hlavná 111',
    psc: '900 27',
    obec: 'Bernolákovo',
    email: 'podatelna@bernolakovo.sk',
    telefon: '+421 2 4599 3911',
    strankoveHodiny: [
      { den: 'Pondelok', cas: '8.00 až 12.00, 13.00 až 15.00' },
      { den: 'Streda', cas: '8.00 až 12.00, 13.00 až 17.00' },
      { den: 'Piatok', cas: '8.00 až 12.00' },
    ],
  },
  branding: {
    primary: '#1E40AF',
    primaryDark: '#152F80',
    accent: '#15803D',
    erbSrc: 'erb-bernolakovo.png',
    erbAlt: 'Erb obce Bernolákovo',
  },
  povoleneFormulare: ['vjazd-160-1996', 'potvrdenie-vek-stavby'],
  predvolenaAdresa: { obec: 'Bernolákovo', psc: '900 27' },
}
