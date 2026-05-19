# Mini Token Editor

A small React + TypeScript rich-text editor demo built with Vite. The editor stores content as text tokens, adapts DOM selections into editor offsets, supports bold/italic formatting, and uses command history for undo and redo.

## Features

- Token-based editor state
- Contenteditable editing surface
- Bold and italic mark strategies
- Selection tracking with DOM-to-editor adapters
- Undo and redo powered by command objects
- Observer-style editor store with `useSyncExternalStore`
- Responsive, warm editorial UI styling
- Alert note for a future feature: inline suggestion text like VS Code

## Tech Stack

- React 19
- TypeScript
- Vite
- ESLint

## Project Structure

```txt
src/
  components/              UI components
    HistoryControls.tsx
    TokenEditor.tsx
    Toolbar.tsx
  patterns/                Design-pattern examples
    adapter/               DOM/editor conversion adapters
    command/               Undo/redo command objects
    observer/              Editor state store
    strategy/              Formatting strategies
  types/                   Editor TypeScript types
  utils/                   Token manipulation helpers
  App.tsx                  Main app shell
  App.css                  App styling
```

## Getting Started

### Prerequisites

Install Node.js, then install project dependencies:

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## How to Use

1. Type or edit text in the editor area.
2. Select some text.
3. Click **Bold** or **Italic** to toggle formatting.
4. Use **Undo** and **Redo** to move through editing history.

## Design Patterns Used

- **Command**: encapsulates editor changes and supports undo/redo.
- **Strategy**: defines independent formatting behavior for marks like bold and italic.
- **Observer**: exposes editor state updates through a store subscription API.
- **Adapter**: translates browser DOM selections into editor selections and back.

## Future Improvement

Add a suggest text feature similar to VS Code inline suggestions.
