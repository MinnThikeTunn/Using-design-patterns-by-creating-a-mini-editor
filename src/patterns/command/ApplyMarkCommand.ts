import type { EditorState } from '../../types/editor'
import type { EditorStore } from '../observer/EditorStore'
import type { MarkStrategy } from '../strategy/MarkStrategy'
import type { Command } from './Command'

export class ApplyMarkCommand implements Command {
  private readonly beforeState: EditorState
  private readonly afterState: EditorState | null

  constructor(
    private readonly store: EditorStore,
    strategy: MarkStrategy,
  ) {
    this.beforeState = store.getState()

    if (this.beforeState.selection.anchorOffset === this.beforeState.selection.focusOffset) {
      this.afterState = null
      return
    }

    this.afterState = {
      document: strategy.apply(
        this.beforeState.document,
        this.beforeState.selection,
      ),
      selection: this.beforeState.selection,
    }
  }

  execute(): void {
    if (!this.afterState) return

    this.store.setState(this.afterState)
  }

  undo(): void {
    if (!this.afterState) return

    this.store.setState(this.beforeState)
  }

  canExecute(): boolean {
    return this.afterState !== null
  }
}
