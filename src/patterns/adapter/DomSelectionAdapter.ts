import type { EditorSelection } from '../../types/editor'

const getTextOffset = (root: HTMLElement, node: Node, offset: number): number => {
  const range = document.createRange()
  range.selectNodeContents(root)
  range.setEnd(node, offset)

  return range.toString().length
}

export const getEditorSelectionFromDom = (
  root: HTMLElement,
  blockId: string,
): EditorSelection | null => {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)

  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return null
  }

  return {
    blockId,
    anchorOffset: getTextOffset(root, range.startContainer, range.startOffset),
    focusOffset: getTextOffset(root, range.endContainer, range.endOffset),
  }
}

export const restoreDomSelectionFromEditorSelection = (
  root: HTMLElement,
  selection: EditorSelection,
): void => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let currentOffset = 0
  let anchorSet = false
  let focusSet = false

  while (walker.nextNode()) {
    const node = walker.currentNode
    const nextOffset = currentOffset + (node.textContent?.length ?? 0)

    if (!anchorSet && selection.anchorOffset <= nextOffset) {
      range.setStart(node, Math.max(selection.anchorOffset - currentOffset, 0))
      anchorSet = true
    }

    if (!focusSet && selection.focusOffset <= nextOffset) {
      range.setEnd(node, Math.max(selection.focusOffset - currentOffset, 0))
      focusSet = true
      break
    }

    currentOffset = nextOffset
  }

  if (!anchorSet || !focusSet) {
    range.selectNodeContents(root)
    range.collapse(false)
  }

  const domSelection = window.getSelection()
  domSelection?.removeAllRanges()
  domSelection?.addRange(range)
}
