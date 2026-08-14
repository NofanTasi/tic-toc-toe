import React from 'react';
import { BoardState, Line, Player, GameVariant, GameMode } from '../types';

interface BoardProps {
  board: BoardState;
  currentTurn: Player;
  winningLine: Line | null;
  winner: Player | null;
  filledLines: Line[];
  isBoardFull: boolean;
  variant?: GameVariant;
  mode?: GameMode;
  activePlacementSymbol?: Player;
  onSelectPlacementSymbol?: (symbol: Player) => void;
  onInvertPlacementSymbol?: () => void;
  onCellClick: (index: number) => void;
  onClearLine: (line: Line) => void;
  disabled: boolean;
  // Media controls & history
  isAiPaused?: boolean;
  onToggleAiPause?: () => void;
  onStepAi?: () => void;
  aiSpeed?: number;
  onSpeedFaster?: () => void;
  onSpeedSlower?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onRedo?: () => void;
  canRedo?: boolean;
  isAiThinking?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  currentTurn,
  winningLine,
  winner,
  filledLines,
  isBoardFull,
  variant = 'TTT',
  mode = 'pva_x',
  activePlacementSymbol = 'X',
  onSelectPlacementSymbol,
  onInvertPlacementSymbol,
  onCellClick,
  onClearLine,
  disabled,
  isAiPaused = false,
  onToggleAiPause,
  onStepAi,
  aiSpeed = 400,
  onSpeedFaster,
  onSpeedSlower,
  onUndo,
  canUndo = false,
  onRedo,
  canRedo = false,
  isAiThinking = false,
}) => {
  const isWinningCell = (index: number) => {
    return winningLine ? winningLine.indices.includes(index) : false;
  };

  const handleCellInteraction = (idx: number) => {
    if (disabled || winner !== null) return;

    if (board[idx] === null) {
      onCellClick(idx);
      return;
    }

    if (filledLines.length > 0) {
      const matchingLines = filledLines.filter((l) => l.indices.includes(idx));
      if (matchingLines.length > 0) {
        onClearLine(matchingLines[0]);
        return;
      }
    }
  };

  const showMarkGadget = variant === 'OXO' && !winner;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto font-mono text-black dark:text-white">
      {/* Game Status Banner */}
      <div className="mb-4 text-center font-bold text-sm tracking-wider uppercase border-b-2 border-black dark:border-white pb-2 w-full flex items-center justify-between">
        <span>{winner ? `WINNER: PLAYER ${winner}` : `TURN: PLAYER ${currentTurn}`}</span>
        {showMarkGadget && (
          <div className="flex items-center gap-1 text-xs">
            <span className="opacity-75">Mark:</span>
            <button
              onClick={() => onSelectPlacementSymbol?.('X')}
              className={`px-1.5 py-0.5 border border-black dark:border-white font-bold ${
                activePlacementSymbol === 'X'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'hover:bg-black/10'
              }`}
              id="symbol-x-btn"
            >
              X
            </button>
            <button
              onClick={() => onSelectPlacementSymbol?.('O')}
              className={`px-1.5 py-0.5 border border-black dark:border-white font-bold ${
                activePlacementSymbol === 'O'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'hover:bg-black/10'
              }`}
              id="symbol-o-btn"
            >
              O
            </button>
            <button
              onClick={() => onInvertPlacementSymbol?.()}
              className="px-1.5 py-0.5 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              id="symbol-invert-btn"
              title="Invert Active Mark Choice (X ⇄ O)"
            >
              ⇄ Invert
            </button>
          </div>
        )}
      </div>

      {/* Retro ASCII Grid Board */}
      <div className="w-full bg-white dark:bg-black border-2 border-black dark:border-white p-2">
        <div className="grid grid-cols-3 gap-0">
          {board.map((cell, idx) => {
            const isWin = isWinningCell(idx);
            const matchingLines = filledLines.filter((l) => l.indices.includes(idx));
            const isFilledLineCell = matchingLines.length > 0;
            const isUnambiguousLineCell = matchingLines.length === 1;
            const isAmbiguousLineCell = matchingLines.length > 1;

            const isClickable =
              !disabled &&
              winner === null &&
              (cell === null || isFilledLineCell);

            // Determine border styles for 3x3 grid cells
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const borderClasses = `
              ${col < 2 ? 'border-r-2 border-black dark:border-white' : ''}
              ${row < 2 ? 'border-b-2 border-black dark:border-white' : ''}
            `;

            let cellTitle = '';
            if (isUnambiguousLineCell) {
              cellTitle = `Click to clear ${matchingLines[0].name}`;
            } else if (isAmbiguousLineCell) {
              cellTitle = `Ambiguous intersection (${matchingLines.map((l) => l.name).join(', ')}) - click an underlined cell to choose line`;
            } else if (cell === null) {
              cellTitle = 'Click to place mark';
            }

            return (
              <button
                key={idx}
                disabled={!isClickable}
                onClick={() => handleCellInteraction(idx)}
                id={`cell-${idx}`}
                title={cellTitle}
                className={`h-24 sm:h-28 flex items-center justify-center text-4xl sm:text-5xl font-bold font-mono select-none transition-none ${borderClasses} ${
                  isClickable
                    ? 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer'
                    : ''
                } ${
                  isWin
                    ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
                    : ''
                } ${
                  isUnambiguousLineCell && !isWin
                    ? 'underline decoration-2 underline-offset-4'
                    : ''
                }`}
              >
                {cell !== null ? cell : ' '}
              </button>
            );
          })}
        </div>
      </div>

      {/* Retro Interactive Controls Toolbar: Media Player & Undo / Redo */}
      <div className="w-full mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-2 border-black dark:border-white p-1.5 text-xs font-bold bg-white dark:bg-black">
          {/* Left: Undo / Redo buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo || (mode === 'ava' && !isAiPaused && !winner)}
              className="px-2 py-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 transition-none"
              id="game-undo-btn"
              title="Undo Move (<)"
            >
              &lt; Undo
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo || (mode === 'ava' && !isAiPaused && !winner)}
              className="px-2 py-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 transition-none"
              id="game-redo-btn"
              title="Redo Move (>)"
            >
              Redo &gt;
            </button>
          </div>

          {/* Right: In AvA mode, media player controls (Play/Pause || / >, Step >|, Speed v / ^) */}
          {mode === 'ava' && (
            <div className="flex items-center gap-1 ml-auto">
              {/* Play / Stop (Pause) Gadget */}
              <button
                onClick={onToggleAiPause}
                disabled={winner !== null}
                className={`px-2.5 py-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-black disabled:opacity-30 transition-none ${
                  isAiPaused ? 'bg-black/10 dark:bg-white/10' : ''
                }`}
                id="media-play-pause-btn"
                title={isAiPaused ? 'Play / Resume (>)' : 'Stop / Pause (||)'}
              >
                {isAiPaused ? '>' : '||'}
              </button>

              {/* Step 1 Move (available when paused/halted) */}
              {isAiPaused && !winner && (
                <button
                  onClick={onStepAi}
                  disabled={isAiThinking}
                  className="px-2 py-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-black disabled:opacity-30 transition-none"
                  id="media-step-btn"
                  title="Step 1 Move Forward (>|)"
                >
                  &gt;|
                </button>
              )}

              {/* Speed Controls: v (slower) / ^ (faster) */}
              <div className="flex items-center border border-black dark:border-white">
                <button
                  onClick={onSpeedSlower}
                  className="px-1.5 py-0.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-black"
                  id="speed-down-btn"
                  title="Slower (v)"
                >
                  v
                </button>
                <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-tight min-w-[42px] text-center border-x border-black dark:border-white select-none">
                  {aiSpeed}ms
                </span>
                <button
                  onClick={onSpeedFaster}
                  className="px-1.5 py-0.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-black"
                  id="speed-up-btn"
                  title="Faster (^)"
                >
                  ^
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Git Version Label */}
        <div
          className="text-center text-[10px] font-bold tracking-widest uppercase opacity-75 select-none pt-1"
          id="version-label"
        >
          VERSION 3.0.0
        </div>
      </div>
    </div>
  );
};
