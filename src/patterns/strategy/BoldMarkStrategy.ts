import type { EditorDocument, EditorSelection } from '../../types/editor'
import { applyMarkToDocument } from '../../utils/tokenOperations'
import type { MarkStrategy } from './MarkStrategy'

export const boldMarkStrategy: MarkStrategy = {
  label: 'Bold',
  mark: 'bold',
  apply(document: EditorDocument, selection: EditorSelection): EditorDocument {
    return applyMarkToDocument(document, selection, this.mark)
  },
}
