import React, { useState } from 'react';
import { BoardState, Line, Player } from '../types';

interface BoardProps {
  board: BoardState;
  currentTurn: Player;
  winningLine: Line | null;
  winner: Player | null;
  filledLines: Line[];
  safeLineIds: string[];
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
  safeLineIds,
  isBoardFull,
  onCellClick,
  onClearLine,
  disabled,
}) => {
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);

  const isWinningCell = (index: number) => {
    return winningLine ? winningLine.indices.includes(index) : false;
  };

  const isHoveredClearedCell = (index: number) => {
    if (!hoveredLineId) return false;
    const line = filledLines.find((l) => l.id === hoveredLineId);
    return line ? line.indices.includes(index) : false;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto font-mono text-black dark:text-white">
      {/* Game Status Banner */}
      <div className="mb-6 text-center font-bold text-sm tracking-wider uppercase border-b-2 border-black dark:border-white pb-2 w-full">
        {winner ? (
          <div>*** PLAYER {winner} WINS! ***</div>
        ) : isBoardFull ? (
          <div>[ FULL BOARD DRAW - SELECT LINE TO CLEAR ]</div>
        ) : (
          <div>TURN: PLAYER {currentTurn}</div>
        )}
      </div>

      {/* Retro ASCII Grid Board */}
      <div className="w-full bg-white dark:bg-black border-2 border-black dark:border-white p-2">
        <div className="grid grid-cols-3 gap-0">
          {board.map((cell, idx) => {
            const isWin = isWinningCell(idx);
            const isHoveredClear = isHoveredClearedCell(idx);

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
                disabled={disabled || cell !== null || winner !== null}
                onClick={() => onCellClick(idx)}
                id={`cell-${idx}`}
                className={`h-24 sm:h-28 flex items-center justify-center text-4xl sm:text-5xl font-bold font-mono select-none transition-none ${borderClasses} ${
                  cell === null && winner === null && !disabled
                    ? 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer'
                    : ''
                } ${
                  isWin
                    ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
                    : ''
                } ${
                  isHoveredClear
                    ? 'bg-black text-white dark:bg-white dark:text-black underline'
                    : ''
                }`}
              >
                {cell !== null ? cell : ' '}
              </button>
            );
          })}
        </div>
      </div>

      {/* Retro Line Removal Controls */}
      {filledLines.length > 0 && winner === null && (
        <div className="w-full mt-6 border-2 border-black dark:border-white p-3 text-xs">
          <div className="font-bold mb-2 tracking-wider">
            [ REMOVE 3-SYMBOL LINE ]
          </div>
          <div className="flex flex-col gap-2">
            {filledLines.map((line) => {
              const isSafe = safeLineIds.includes(line.id);
              return (
                <button
                  key={line.id}
                  disabled={disabled}
                  onMouseEnter={() => setHoveredLineId(line.id)}
                  onMouseLeave={() => setHoveredLineId(null)}
                  onClick={() => onClearLine(line)}
                  id={`clear-line-${line.id}`}
                  className="w-full text-left px-3 py-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold flex justify-between items-center"
                >
                  <span>CLEAR {line.name.toUpperCase()}</span>
                  <span>{isSafe ? '[SAFE STRATEGY]' : '[CLEAR]'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
