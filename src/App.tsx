import { useCallback, useMemo, useSyncExternalStore } from 'react'
import './App.css'
import { HistoryControls } from './components/HistoryControls'
import { TokenEditor } from './components/TokenEditor'
import { Toolbar } from './components/Toolbar'
import { ApplyMarkCommand } from './patterns/command/ApplyMarkCommand'
import { CommandManager } from './patterns/command/CommandManager'
import { ReplaceEditorStateCommand } from './patterns/command/ReplaceEditorStateCommand'
import { EditorStore } from './patterns/observer/EditorStore'
import { boldMarkStrategy } from './patterns/strategy/BoldMarkStrategy'
import { italicMarkStrategy } from './patterns/strategy/ItalicMarkStrategy'
import type { MarkStrategy } from './patterns/strategy/MarkStrategy'
import type { EditorSelection, EditorState, TextMark } from './types/editor'
import {
  createTextToken,
  getBlockText,
  replaceBlockTextPreservingMarks,
  selectionHasMark,
} from './utils/tokenOperations'

const initialBlockId = 'block-1'

const initialEditorState: EditorState = {
  document: {
    blocks: [
      {
        id: initialBlockId,
        type: 'paragraph',
        tokens: [createTextToken('Select HI, then try Bold, Italic, Undo, and Redo.')],
      },
    ],
  },
  selection: {
    blockId: initialBlockId,
    anchorOffset: 0,
    focusOffset: 0,
  },
}

const editorStore = new EditorStore(initialEditorState)
const commandManager = new CommandManager()
const markStrategies = [boldMarkStrategy, italicMarkStrategy]

function App() {
  const editorState = useSyncExternalStore(
    editorStore.subscribe,
    editorStore.getState,
    editorStore.getState,
  )
  const currentBlock = editorState.document.blocks[0]

  const activeMarks = useMemo(() => {
    const marks = new Set<TextMark>()

    for (const strategy of markStrategies) {
      if (
        selectionHasMark(
          editorState.document,
          editorState.selection,
          strategy.mark,
        )
      ) {
        marks.add(strategy.mark)
      }
    }

    return marks
  }, [editorState])

  const handleInput = useCallback((text: string, caretOffset: number) => {
    const beforeState = editorStore.getState()
    const block = beforeState.document.blocks[0]

    if (!block || getBlockText(block) === text) return

    const afterState: EditorState = {
      document: replaceBlockTextPreservingMarks(beforeState.document, block.id, text),
      selection: {
        blockId: block.id,
        anchorOffset: caretOffset,
        focusOffset: caretOffset,
      },
    }

    commandManager.execute(
      new ReplaceEditorStateCommand(editorStore, beforeState, afterState),
    )
  }, [])

  const handleSelectionChange = useCallback((selection: EditorSelection) => {
    const currentState = editorStore.getState()

    if (
      currentState.selection.blockId === selection.blockId &&
      currentState.selection.anchorOffset === selection.anchorOffset &&
      currentState.selection.focusOffset === selection.focusOffset
    ) {
      return
    }

    editorStore.setState({
      ...currentState,
      selection,
    })
  }, [])

  const handleFormat = useCallback((strategy: MarkStrategy) => {
    const command = new ApplyMarkCommand(editorStore, strategy)

    if (!command.canExecute()) return

    commandManager.execute(command)
  }, [])

  const handleUndo = useCallback(() => {
    commandManager.undo()
  }, [])

  const handleRedo = useCallback(() => {
    commandManager.redo()
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-band" aria-labelledby="editor-title">
        <p className="eyebrow">Command · Strategy · Observer · Adapter</p>
        <h1 id="editor-title">Mini Token Editor</h1>
        <p className="hero-copy">
          A single-surface editor where tokens are the source of truth. The DOM
          selection is adapted into editor offsets, strategies toggle marks, and
          snapshot commands power undo and redo.
        </p>
        <div className="feature-alert" role="alert">
          Add suggest text feature: like vs code&apos;s inline suggestion
        </div>
      </section>

      <section className="editor-card" aria-label="Mini token editor">
        <div className="editor-topbar">
          <Toolbar
            strategies={markStrategies}
            activeMarks={activeMarks}
            onFormat={handleFormat}
          />
          <HistoryControls
            canUndo={commandManager.canUndo()}
            canRedo={commandManager.canRedo()}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>

        <TokenEditor
          block={currentBlock}
          selection={editorState.selection}
          onInput={handleInput}
          onSelectionChange={handleSelectionChange}
        />

        <footer className="editor-statusbar">
          <span>{getBlockText(currentBlock).length} characters</span>
          <span>
            Selection {editorState.selection.anchorOffset}–
            {editorState.selection.focusOffset}
          </span>
        </footer>
      </section>
    </main>
  )
}

export default App
