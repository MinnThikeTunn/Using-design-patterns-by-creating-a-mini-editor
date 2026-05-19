import type { EditorBlock, EditorDocument, TextToken } from '../../types/editor'

const tokenToMarkdown = (token: TextToken): string => {
  let value = token.text

  if (token.marks.includes('italic')) {
    value = `_${value}_`
  }

  if (token.marks.includes('bold')) {
    value = `**${value}**`
  }

  return value
}

const blockToMarkdown = (block: EditorBlock): string => {
  const content = block.tokens.map(tokenToMarkdown).join('')

  if (block.type === 'heading') {
    return `# ${content}`
  }

  return content
}

export const tokenDocumentToMarkdown = (document: EditorDocument): string =>
  document.blocks.map(blockToMarkdown).join('\n\n')
