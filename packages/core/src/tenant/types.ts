export interface TenantBranding {
  /** HEX, použije sa ako --color-primary */
  primary: string
  primaryDark: string
  accent: string
  /** cesta k erbu, relatívna voči verejnému priečinku aplikácie */
  erbSrc: string
  erbAlt: string
}

export interface TenantOffice {
  nazovUradu: string
  ulica: string
  psc: string
  obec: string
  email: string
  telefon: string
  strankoveHodiny: { den: string; cas: string }[]
}

export interface TenantConfig {
  id: string
  /** úradný názov, napríklad Obec Bernolákovo */
  nazov: string
  /** krátky názov do nadpisov, napríklad Bernolákovo */
  nazovKratky: string
  kodObce: string
  okres: string
  kraj: string
  web: string
  katastralneUzemia: string[]
  urad: TenantOffice
  branding: TenantBranding
  /** identifikátory formulárov, ktoré má obec zapnuté */
  povoleneFormulare: string[]
  /** predvolené PSČ a obec pri adresných poliach */
  predvolenaAdresa: { obec: string; psc: string }
}
