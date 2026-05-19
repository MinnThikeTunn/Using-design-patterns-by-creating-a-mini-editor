import type {
  EditorBlock,
  EditorDocument,
  EditorSelection,
  TextMark,
  TextToken,
} from '../types/editor'

let tokenCounter = 0

export const createTokenId = (): string => {
  tokenCounter += 1
  return `token-${tokenCounter}`
}

export const createTextToken = (
  text: string,
  marks: TextMark[] = [],
): TextToken => ({
  id: createTokenId(),
  text,
  marks: [...new Set(marks)],
})

export const getBlockText = (block: EditorBlock): string =>
  block.tokens.map((token) => token.text).join('')

export const normalizeSelection = (selection: EditorSelection) => ({
  start: Math.min(selection.anchorOffset, selection.focusOffset),
  end: Math.max(selection.anchorOffset, selection.focusOffset),
})

const sameMarks = (left: TextMark[], right: TextMark[]): boolean =>
  left.length === right.length && left.every((mark) => right.includes(mark))

export const mergeAdjacentTokens = (tokens: TextToken[]): TextToken[] => {
  const merged: TextToken[] = []

  for (const token of tokens) {
    if (!token.text) continue

    const previous = merged.at(-1)

    if (previous && sameMarks(previous.marks, token.marks)) {
      previous.text += token.text
    } else {
      merged.push({ ...token, marks: [...token.marks] })
    }
  }

  return merged.length > 0 ? merged : [createTextToken('')]
}

export const selectionHasMark = (
  document: EditorDocument,
  selection: EditorSelection,
  mark: TextMark,
): boolean => {
  const block = document.blocks.find((candidate) => candidate.id === selection.blockId)
  if (!block) return false

  const { start, end } = normalizeSelection(selection)
  if (start === end) return false

  let offset = 0
  let hasSelectedText = false

  for (const token of block.tokens) {
    const tokenStart = offset
    const tokenEnd = offset + token.text.length
    const overlaps = tokenStart < end && tokenEnd > start

    if (overlaps) {
      hasSelectedText = true
      if (!token.marks.includes(mark)) return false
    }

    offset = tokenEnd
  }

  return hasSelectedText
}

export const applyMarkToDocument = (
  document: EditorDocument,
  selection: EditorSelection,
  mark: TextMark,
): EditorDocument => {
  const { start, end } = normalizeSelection(selection)
  if (start === end) return document

  const shouldRemoveMark = selectionHasMark(document, selection, mark)

  return {
    blocks: document.blocks.map((block) => {
      if (block.id !== selection.blockId) return block

      let offset = 0
      const nextTokens: TextToken[] = []

      for (const token of block.tokens) {
        const tokenStart = offset
        const tokenEnd = offset + token.text.length
        const selectedStart = Math.max(start, tokenStart)
        const selectedEnd = Math.min(end, tokenEnd)
        const overlaps = selectedStart < selectedEnd

        if (!overlaps) {
          nextTokens.push({ ...token, marks: [...token.marks] })
          offset = tokenEnd
          continue
        }

        const beforeLength = selectedStart - tokenStart
        const selectedLength = selectedEnd - selectedStart
        const afterLength = tokenEnd - selectedEnd

        if (beforeLength > 0) {
          nextTokens.push(
            createTextToken(token.text.slice(0, beforeLength), token.marks),
          )
        }

        const selectedMarks = shouldRemoveMark
          ? token.marks.filter((candidate) => candidate !== mark)
          : [...new Set([...token.marks, mark])]

        nextTokens.push(
          createTextToken(
            token.text.slice(beforeLength, beforeLength + selectedLength),
            selectedMarks,
          ),
        )

        if (afterLength > 0) {
          nextTokens.push(createTextToken(token.text.slice(-afterLength), token.marks))
        }

        offset = tokenEnd
      }

      return {
        ...block,
        tokens: mergeAdjacentTokens(nextTokens),
      }
    }),
  }
}

const marksAtOffset = (block: EditorBlock, offsetToFind: number): TextMark[] => {
  let offset = 0

  for (const token of block.tokens) {
    const tokenEnd = offset + token.text.length

    if (offsetToFind >= offset && offsetToFind < tokenEnd) {
      return token.marks
    }

    offset = tokenEnd
  }

  return []
}

const textToTokensPreservingMarks = (
  oldBlock: EditorBlock,
  nextText: string,
): TextToken[] => {
  const oldText = getBlockText(oldBlock)

  let prefixLength = 0
  while (
    prefixLength < oldText.length &&
    prefixLength < nextText.length &&
    oldText[prefixLength] === nextText[prefixLength]
  ) {
    prefixLength += 1
  }

  let suffixLength = 0
  while (
    suffixLength < oldText.length - prefixLength &&
    suffixLength < nextText.length - prefixLength &&
    oldText[oldText.length - 1 - suffixLength] ===
      nextText[nextText.length - 1 - suffixLength]
  ) {
    suffixLength += 1
  }

  const insertedText = nextText.slice(
    prefixLength,
    nextText.length - suffixLength,
  )
  const nextTokens: TextToken[] = []

  for (let index = 0; index < prefixLength; index += 1) {
    nextTokens.push(createTextToken(nextText[index], marksAtOffset(oldBlock, index)))
  }

  if (insertedText) {
    nextTokens.push(createTextToken(insertedText))
  }

  for (let index = nextText.length - suffixLength; index < nextText.length; index += 1) {
    const oldIndex = oldText.length - nextText.length + index
    nextTokens.push(
      createTextToken(nextText[index], marksAtOffset(oldBlock, oldIndex)),
    )
  }

  return mergeAdjacentTokens(nextTokens)
}

export const replaceBlockTextPreservingMarks = (
  document: EditorDocument,
  blockId: string,
  text: string,
): EditorDocument => ({
  blocks: document.blocks.map((block) =>
    block.id === blockId
      ? {
          ...block,
          tokens: textToTokensPreservingMarks(block, text),
        }
      : block,
  ),
})
