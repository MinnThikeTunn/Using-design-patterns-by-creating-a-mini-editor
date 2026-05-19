import type { EditorDocument, EditorSelection, TextMark } from '../../types/editor'

export interface MarkStrategy {
  readonly label: string
  readonly mark: TextMark
  apply(document: EditorDocument, selection: EditorSelection): EditorDocument
}
