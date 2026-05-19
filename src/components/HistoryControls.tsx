type HistoryControlsProps = {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: HistoryControlsProps) {
  return (
    <div className="history-controls" aria-label="Editor history controls">
      <button
        type="button"
        className="button button-primary"
        onClick={onUndo}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button
        type="button"
        className="button button-secondary"
        onClick={onRedo}
        disabled={!canRedo}
      >
        Redo
      </button>
    </div>
  )
}
