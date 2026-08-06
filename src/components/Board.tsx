import React from 'react';
import { BoardState, Line, Player } from '../types';

interface BoardProps {
  board: BoardState;
  currentTurn: Player;
  winningLine: Line | null;
  winner: Player | null;
  filledLines: Line[];
  isBoardFull: boolean;
  onCellClick: (index: number) => void;
  onClearLine: (line: Line) => void;
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  currentTurn,
  winningLine,
  winner,
  filledLines,
  isBoardFull,
  onCellClick,
  onClearLine,
  disabled,
}) => {
  const isWinningCell = (index: number) => {
    return winningLine ? winningLine.indices.includes(index) : false;
  };

  const handleCellInteraction = (idx: number) => {
    if (disabled || winner !== null) return;

    if (filledLines.length > 0) {
      const lineToClear = filledLines.find((l) => l.indices.includes(idx));
      if (lineToClear) {
        onClearLine(lineToClear);
        return;
      }
    }

    if (board[idx] === null) {
      onCellClick(idx);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto font-mono text-black dark:text-white">
      {/* Game Status Banner */}
      <div className="mb-6 text-center font-bold text-sm tracking-wider uppercase border-b-2 border-black dark:border-white pb-2 w-full">
        TURN: PLAYER {currentTurn}
      </div>

      {/* Retro ASCII Grid Board */}
      <div className="w-full bg-white dark:bg-black border-2 border-black dark:border-white p-2">
        <div className="grid grid-cols-3 gap-0">
          {board.map((cell, idx) => {
            const isWin = isWinningCell(idx);
            const isFilledLineCell = filledLines.some((l) => l.indices.includes(idx));
            const isClickable =
              !disabled &&
              winner === null &&
              ((cell === null && filledLines.length === 0) || isFilledLineCell);

            // Determine border styles for 3x3 grid cells
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const borderClasses = `
              ${col < 2 ? 'border-r-2 border-black dark:border-white' : ''}
              ${row < 2 ? 'border-b-2 border-black dark:border-white' : ''}
            `;

            return (
              <button
                key={idx}
                disabled={!isClickable}
                onClick={() => handleCellInteraction(idx)}
                id={`cell-${idx}`}
                className={`h-24 sm:h-28 flex items-center justify-center text-4xl sm:text-5xl font-bold font-mono select-none transition-none ${borderClasses} ${
                  isClickable
                    ? 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer'
                    : ''
                } ${
                  isWin
                    ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
                    : ''
                }`}
              >
                {cell !== null ? cell : ' '}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
