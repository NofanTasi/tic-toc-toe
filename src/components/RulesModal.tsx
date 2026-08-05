import React from 'react';
import { CANONICAL_CLASSES } from '../utils/tictactoe';
import { X, BookOpen } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Tic Toc Toe — Rules & Symmetry Strategy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-stone-700 dark:text-stone-300">
          {/* Rules Section */}
          <section className="space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              Game Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>
                <strong>Classical Objective:</strong> Align 3 of your own symbols (XXX or OOO) horizontally, vertically, or diagonally to win.
              </li>
              <li>
                <strong>Line Removal Rule:</strong> At any time during a turn, a player may choose to <em>remove 3 symbols in a line</em> (row, column, or diagonal that is fully filled) instead of placing a symbol.
              </li>
              <li>
                <strong>Infinite Play Mechanics:</strong> When a full 9-piece board draw is reached, removing a line of 3 symbols leaves 6 pieces on the board in a classical draw position, allowing the game to continue indefinitely without a stalemate!
              </li>
            </ul>
          </section>

          {/* Canonical Symmetry Classes Matrix */}
          <section className="space-y-3">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base flex items-center justify-between">
              <span>Full Draw Board Canonical Classes</span>
              <span className="text-xs font-normal text-stone-500">
                (Up to D4 Rotations & Reflections)
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CANONICAL_CLASSES.map((canon) => {
                // Format string to 3x3 grid
                const s = canon.canonicalBoardStr;
                const row1 = [s[0], s[1], s[2]];
                const row2 = [s[3], s[4], s[5]];
                const row3 = [s[6], s[7], s[8]];

                return (
                  <div
                    key={canon.classNumber}
                    className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2"
                  >
                    <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {canon.className}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Grid preview */}
                      <div className="grid grid-cols-3 gap-1 bg-stone-200 dark:bg-stone-700 p-1 rounded font-mono text-xs font-black text-center w-20">
                        {[...row1, ...row2, ...row3].map((char, i) => (
                          <div
                            key={i}
                            className="bg-white dark:bg-stone-800 py-0.5 rounded text-stone-800 dark:text-stone-200"
                          >
                            {char}
                          </div>
                        ))}
                      </div>

                      {/* Safe removals */}
                      <div className="flex-1 text-xs">
                        <span className="font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                          Safe Removals:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {canon.safeLineIds.map((lineId) => (
                            <span
                              key={lineId}
                              className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300"
                            >
                              {lineId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 font-semibold rounded-xl text-xs transition-colors"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
