import { getModelStatus, jsonResponse, type AssistantEnv } from '../_shared/assistant'

interface PagesContext {
  env: AssistantEnv
}

export function onRequestGet({ env }: PagesContext) {
  return jsonResponse(getModelStatus(env))
}
