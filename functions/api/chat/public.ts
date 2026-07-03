import { handlePublicChat, type AssistantEnv } from '../../_shared/assistant'

interface PagesContext {
  request: Request
  env: AssistantEnv
}

export function onRequestPost({ request, env }: PagesContext) {
  return handlePublicChat(request, env)
}
