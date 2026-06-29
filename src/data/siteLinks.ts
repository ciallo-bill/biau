const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const MAIN_SITE_URL = 'https://biau.playlab.eu.cc'
export const OZON_ERP_SITE_URL = trimTrailingSlash(
  import.meta.env.VITE_OZON_ERP_URL?.trim() || 'https://erp.ciallobill.qzz.io',
)
export const OZON_ERP_ENTRY_URL = `${OZON_ERP_SITE_URL}/#/login?from=biau-port`
