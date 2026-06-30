const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined

export const MAIN_SITE_URL = 'https://biau.playlab.eu.cc'
export const OZON_ERP_SITE_URL = trimTrailingSlash(
  viteEnv?.VITE_OZON_ERP_URL?.trim() || 'https://erp.ciallobill.qzz.io',
)
export const OZON_ERP_ENTRY_URL = `${OZON_ERP_SITE_URL}/#/login?from=biau-port`
