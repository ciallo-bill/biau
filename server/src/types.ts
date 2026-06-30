export type AssistantVisibility = 'public' | 'internal'

export interface KnowledgeItem {
  id: string
  title: string
  summary: string
  href: string
  tags: string[]
  visibility: AssistantVisibility
}

export interface Citation {
  id: string
  title: string
  summary: string
  href: string
  tags?: string[]
  visibility?: AssistantVisibility
}

export interface ChatPayload {
  message?: string
  sessionId?: string
}

export interface ChatResponse {
  answer: string
  citations: Citation[]
  sessionId?: string
  messageId?: string
}
