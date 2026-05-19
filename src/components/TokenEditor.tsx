import { useLayoutEffect, useRef } from 'react'
import {
  getEditorSelectionFromDom,
  restoreDomSelectionFromEditorSelection,
} from '../patterns/adapter/DomSelectionAdapter'
import type { EditorBlock, EditorSelection, TextToken } from '../types/editor'

type TokenEditorProps = {
  block: EditorBlock
  selection: EditorSelection
  onInput: (text: string, caretOffset: number) => void
  onSelectionChange: (selection: EditorSelection) => void
}

const createTokenElement = (token: TextToken): HTMLSpanElement => {
  const span = document.createElement('span')
  span.className = 'token'
  span.textContent = token.text

  if (token.marks.includes('bold')) {
    span.dataset.bold = 'true'
  }

  if (token.marks.includes('italic')) {
    span.dataset.italic = 'true'
  }

  return span
}

export function TokenEditor({
  block,
  selection,
  onInput,
  onSelectionChange,
}: TokenEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    // React and contenteditable can fight over child nodes because the browser
    // mutates editable DOM directly. Keep token spans as imperatively managed
    // adapter output so React owns only the stable editor container.
    editor.replaceChildren(...block.tokens.map(createTokenElement))
    restoreDomSelectionFromEditorSelection(editor, selection)
  }, [block, selection])

  const captureSelection = () => {
    const editor = editorRef.current
    if (!editor) return

    const nextSelection = getEditorSelectionFromDom(editor, block.id)
    if (!nextSelection) return

    onSelectionChange(nextSelection)
  }

  return (
    <div
      ref={editorRef}
      className={`token-editor token-editor-${block.type}`}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Token-based rich text editor"
      spellCheck="false"
      onInput={(event) => {
        const text = event.currentTarget.textContent ?? ''
        const nextSelection = getEditorSelectionFromDom(event.currentTarget, block.id)
        const caretOffset = nextSelection?.focusOffset ?? text.length

        onInput(text, caretOffset)
      }}
      onSelect={captureSelection}
      onKeyUp={captureSelection}
      onMouseUp={captureSelection}
    />
  )
}
