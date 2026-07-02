function readFirstEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

function normalizeBaseUrl(value: string) {
  return (value || 'https://api.openai.com/v1').replace(/\/$/, '')
}

const assistantModelApiKey = readFirstEnv('ASSISTANT_MODEL_API_KEY', 'OPENAI_API_KEY')
const assistantModelBaseUrl = normalizeBaseUrl(readFirstEnv('ASSISTANT_MODEL_BASE_URL', 'OPENAI_BASE_URL'))
const assistantModelName = readFirstEnv('ASSISTANT_MODEL_NAME', 'OPENAI_MODEL') || 'gpt-4.1-mini'
const assistantModelProvider = readFirstEnv('ASSISTANT_MODEL_PROVIDER', 'OPENAI_PROVIDER') || 'openai-compatible'

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8787),
  databaseUrl: process.env.DATABASE_URL?.trim() ?? '',
  corsOrigin: process.env.CORS_ORIGIN?.trim() ?? '*',
  assistantModelApiKey,
  assistantModelBaseUrl,
  assistantModelName,
  assistantModelProvider,
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() || assistantModelApiKey,
  openaiBaseUrl: normalizeBaseUrl(process.env.OPENAI_BASE_URL?.trim() || assistantModelBaseUrl),
  openaiModel: process.env.OPENAI_MODEL?.trim() || assistantModelName,
  adminToken: process.env.ADMIN_TOKEN?.trim() ?? '',
  metricsEnabled: readBoolean(process.env.METRICS_ENABLED),
}

export function hasDatabase() {
  return env.databaseUrl.length > 0
}

export function hasModelProvider() {
  return (env.assistantModelApiKey || env.openaiApiKey).length > 0
}

function readBoolean(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
}
