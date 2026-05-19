export type TextMark = 'bold' | 'italic'

export type BlockType = 'paragraph' | 'heading'

export type TextToken = {
  id: string
  text: string
  marks: TextMark[]
}

export type EditorBlock = {
  id: string
  type: BlockType
  tokens: TextToken[]
}

export type EditorDocument = {
  blocks: EditorBlock[]
}

export type EditorSelection = {
  blockId: string
  anchorOffset: number
  focusOffset: number
}

export type EditorState = {
  document: EditorDocument
  selection: EditorSelection
}

export type EditorListener = () => void
