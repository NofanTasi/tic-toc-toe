import React, { useState } from 'react';
import { BoardState, Line, Player } from '../types';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

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

  // Check if a cell is part of the winning line
  const isWinningCell = (index: number) => {
    return winningLine ? winningLine.indices.includes(index) : false;
  };

  // Check if a cell is part of the currently hovered or selected line to clear
  const isHoveredClearedCell = (index: number) => {
    if (!hoveredLineId) return false;
    const line = filledLines.find((l) => l.id === hoveredLineId);
    return line ? line.indices.includes(index) : false;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Turn & Status Badge */}
      <div className="mb-4 text-center">
        {winner ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base border border-emerald-300 dark:border-emerald-800 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>PLAYER {winner} WINS!</span>
          </motion.div>
        ) : isBoardFull ? (
          <motion.div
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold text-xs sm:text-sm border border-amber-300 dark:border-amber-800 animate-pulse"
          >
            <span>FULL BOARD DRAW REACHED!</span>
            <span className="font-normal opacity-90">Must remove 3 symbols in a line</span>
          </motion.div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-medium">
            <span>Turn:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                currentTurn === 'X'
                  ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              Player {currentTurn}
            </span>
          </div>
        )}
      </div>

      {/* 3x3 Grid Container */}
      <div className="relative p-3 sm:p-4 bg-stone-100 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm w-full aspect-square">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full h-full">
          {board.map((cell, idx) => {
            const isWin = isWinningCell(idx);
            const isHoveredClear = isHoveredClearedCell(idx);

            return (
              <button
                key={idx}
                disabled={disabled || cell !== null || winner !== null}
                onClick={() => onCellClick(idx)}
                id={`cell-${idx}`}
                className={`relative flex items-center justify-center rounded-2xl transition-all duration-150 text-3xl sm:text-4xl md:text-5xl font-black select-none ${
                  cell === null
                    ? winner === null && !disabled
                      ? 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs hover:scale-[0.98]'
                      : 'bg-white/60 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 cursor-not-allowed'
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs'
                } ${
                  isWin
                    ? 'ring-4 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500'
                    : ''
                } ${
                  isHoveredClear
                    ? 'ring-2 ring-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : ''
                }`}
              >
                {cell === 'X' && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="text-indigo-600 dark:text-indigo-400"
                  >
                    X
                  </motion.span>
                )}
                {cell === 'O' && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    O
                  </motion.span>
                )}
                {cell === null && !disabled && winner === null && (
                  <span className="opacity-0 hover:opacity-20 text-stone-400 font-bold transition-opacity">
                    {currentTurn}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Direct Line Removal Bar below board */}
      {filledLines.length > 0 && winner === null && (
        <div className="w-full mt-4 p-3 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Clear 3 Symbols Line Option
            </span>
            {isBoardFull && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Action required to continue
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
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
                  className={`flex-1 min-w-[120px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
                    isSafe
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 ring-1 ring-indigo-400/40'
                      : 'bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 dark:bg-stone-800 dark:hover:bg-rose-950/50 dark:text-stone-300 dark:hover:text-rose-300 border-stone-200 dark:border-stone-700 hover:border-rose-300'
                  }`}
                >
                  <span className="truncate">{line.name}</span>
                  {isSafe ? (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      Safe Strategy
                    </span>
                  ) : (
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                      Remove
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
