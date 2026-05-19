import type { MarkStrategy } from '../patterns/strategy/MarkStrategy'

type ToolbarProps = {
  strategies: MarkStrategy[]
  activeMarks: Set<string>
  onFormat: (strategy: MarkStrategy) => void
}

export function Toolbar({ strategies, activeMarks, onFormat }: ToolbarProps) {
  return (
    <div className="toolbar" aria-label="Formatting tools">
      {strategies.map((strategy) => {
        const isActive = activeMarks.has(strategy.mark)

        return (
          <button
            key={strategy.label}
            type="button"
            className={`button button-secondary${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onFormat(strategy)}
          >
            {strategy.label}
          </button>
        )
      })}
    </div>
  )
}
