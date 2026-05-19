import type { EditorState } from '../../types/editor'
import type { EditorStore } from '../observer/EditorStore'
import type { Command } from './Command'

export class ReplaceEditorStateCommand implements Command {
  constructor(
    private readonly store: EditorStore,
    private readonly beforeState: EditorState,
    private readonly afterState: EditorState,
  ) {}

  execute(): void {
    this.store.setState(this.afterState)
  }

  undo(): void {
    this.store.setState(this.beforeState)
  }
}
