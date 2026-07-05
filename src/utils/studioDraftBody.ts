import type { StudioContentBlock, StudioContentBody, StudioDraft } from '../data/studio'

const headingPattern = /^(#{1,3})\s+(.+)$/u
const imagePattern = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/u
const sourceCardPattern = /^\[source:([^\]]+)\](?:\s+(.+))?$/u

export function bodyJsonFromText(value: string): StudioContentBody {
  const blocks = value
    .split(/\n{2,}/u)
    .flatMap((item) => readTextBlock(item.trim()))
    .filter((block): block is StudioContentBlock => block !== null)
  return { blocks }
}

export function textFromBodyJson(draft: Pick<StudioDraft, 'bodyJson'>) {
  return draft.bodyJson.blocks
    .map((block) => blockToText(block))
    .filter(Boolean)
    .join('\n\n')
}

function readTextBlock(value: string): StudioContentBlock | null {
  if (!value) return null

  const mermaid = readMermaidBlock(value)
  if (mermaid) return mermaid

  const heading = value.match(headingPattern)
  if (heading) {
    return {
      type: 'heading',
      level: Math.min(Math.max(heading[1].length, 2), 3),
      text: heading[2].trim(),
    }
  }

  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length > 0 && lines.every((line) => /^[-*]\s+/u.test(line))) {
    return {
      type: 'list',
      items: lines.map((line) => line.replace(/^[-*]\s+/u, '').trim()).filter(Boolean),
    }
  }

  const image = value.match(imagePattern)
  if (image) {
    return {
      type: 'image',
      alt: image[1].trim(),
      src: image[2].trim(),
      caption: image[3]?.trim(),
    }
  }

  const sourceCard = value.match(sourceCardPattern)
  if (sourceCard) {
    return {
      type: 'source-card',
      sourceItemId: sourceCard[1].trim(),
      caption: sourceCard[2]?.trim(),
    }
  }

  return { type: 'paragraph', text: value }
}

function readMermaidBlock(value: string): StudioContentBlock | null {
  if (!value.startsWith('```mermaid')) return null
  const content = value
    .replace(/^```mermaid\s*/u, '')
    .replace(/```$/u, '')
    .trim()
  if (!content) return null
  return { type: 'flow', mermaid: content, caption: '流程图草稿' }
}

function blockToText(block: StudioContentBlock) {
  if (block.type === 'heading') {
    const level = Math.min(Math.max(block.level ?? 2, 2), 3)
    return `${'#'.repeat(level)} ${block.text ?? ''}`.trim()
  }
  if (block.type === 'list') return block.items?.map((item) => `- ${item}`).join('\n') ?? ''
  if (block.type === 'image') {
    const caption = block.caption ? ` "${block.caption}"` : ''
    return block.src ? `![${block.alt ?? ''}](${block.src}${caption})` : block.caption ?? ''
  }
  if (block.type === 'flow') return block.mermaid ? `\`\`\`mermaid\n${block.mermaid}\n\`\`\`` : ''
  if (block.type === 'source-card') {
    const sourceId = block.sourceItemId ? `[source:${block.sourceItemId}]` : '[source:]'
    return `${sourceId}${block.caption ? ` ${block.caption}` : ''}`
  }
  return block.text ?? ''
}
