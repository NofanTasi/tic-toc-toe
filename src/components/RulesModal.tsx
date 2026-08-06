import React from 'react';
import { CANONICAL_CLASSES } from '../utils/tictactoe';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono text-black dark:text-white">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col p-4 shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            === RULES & CANONICAL SYMMETRY MATRIX ===
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-0.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs"
          >
            [ X ]
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto space-y-4 text-xs pr-1">
          {/* Rules */}
          <div className="border border-black dark:border-white p-2">
            <div className="font-bold border-b border-black dark:border-white pb-1 mb-2">
              GAME MECHANICS & SYMMETRY ABSTRACTION
            </div>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>
                <strong>Line Removal Rule:</strong> At any turn, a player can remove 3 symbols in a line (row, column, or diagonal that is fully filled).
              </li>
              <li>
                <strong>Infinite Catch-22:</strong> On a full 9-cell draw board, removing a canonical safe line returns the board to a 6-piece classical draw state, continuing play indefinitely.
              </li>
              <li>
                <strong>A/B Symbol Abstraction:</strong> The canonical matrix abstracts both spatial D4 grid symmetries (rotations/reflections) and player symbol symmetry. <strong>A</strong> denotes the 5-piece player and <strong>B</strong> denotes the 4-piece player.
              </li>
            </ul>
          </div>

          {/* Canonical Classes */}
          <div className="space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider">
              [ CANONICAL DRAW CLASSES (3 ABSTRACT CLASSES) ]
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CANONICAL_CLASSES.map((canon) => {
                const s = canon.abstractBoardStr;
                const row1 = [s[0], s[1], s[2]];
                const row2 = [s[3], s[4], s[5]];
                const row3 = [s[6], s[7], s[8]];

                return (
                  <div
                    key={canon.classNumber}
                    className="border border-black dark:border-white p-2 space-y-2 text-center"
                  >
                    <div className="font-bold border-b border-black dark:border-white pb-1 text-[11px]">
                      {canon.className}
                    </div>

                    {/* ASCII Grid Preview */}
                    <div className="font-mono text-xs font-bold leading-tight my-2">
                      <div>{row1.join(' | ')}</div>
                      <div>---------</div>
                      <div>{row2.join(' | ')}</div>
                      <div>---------</div>
                      <div>{row3.join(' | ')}</div>
                    </div>

                    <div className="text-[10px] border-t border-black dark:border-white pt-1">
                      <span className="font-bold">Safe Removals:</span>
                      <div>{canon.safeLineIds.join(', ')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t-2 border-black dark:border-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 border border-black dark:border-white font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            [ CLOSE ]
          </button>
        </div>
      </div>
    </div>
  );
};
