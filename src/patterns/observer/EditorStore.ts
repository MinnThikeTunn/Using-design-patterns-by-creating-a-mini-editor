import type { EditorListener, EditorState } from '../../types/editor'
import { getBlockText } from '../../utils/tokenOperations'

const clampSelection = (state: EditorState): EditorState => {
  const selectedBlock =
    state.document.blocks.find((block) => block.id === state.selection.blockId) ??
    state.document.blocks[0]

  if (!selectedBlock) return state

  const textLength = getBlockText(selectedBlock).length
  const anchorOffset = Math.min(
    Math.max(state.selection.anchorOffset, 0),
    textLength,
  )
  const focusOffset = Math.min(Math.max(state.selection.focusOffset, 0), textLength)

  return {
    document: state.document,
    selection: {
      blockId: selectedBlock.id,
      anchorOffset,
      focusOffset,
    },
  }
}

export class EditorStore {
  private state: EditorState
  private listeners = new Set<EditorListener>()

  constructor(initialState: EditorState) {
    this.state = clampSelection(initialState)
  }

  getState = (): EditorState => this.state

  setState = (nextState: EditorState): void => {
    this.state = clampSelection(nextState)
    this.notify()
  }

  subscribe = (listener: EditorListener): (() => void) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }
}
