export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8787),
  databaseUrl: process.env.DATABASE_URL?.trim() ?? '',
  corsOrigin: process.env.CORS_ORIGIN?.trim() ?? '*',
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() ?? '',
  openaiBaseUrl: (process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(/\/$/, ''),
  openaiModel: process.env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini',
  adminToken: process.env.ADMIN_TOKEN?.trim() ?? '',
}

export function hasDatabase() {
  return env.databaseUrl.length > 0
}

export function hasModelProvider() {
  return env.openaiApiKey.length > 0
}
