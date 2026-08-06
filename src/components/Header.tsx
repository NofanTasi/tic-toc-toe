import React from 'react';
import { GameMode } from '../types';

interface HeaderProps {
  mode: GameMode;
  isDebug: boolean;
  onSelectMode: (mode: GameMode) => void;
  onOpenRules: () => void;
  onToggleDebug: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  isDebug,
  onSelectMode,
  onOpenRules,
  onToggleDebug,
  onReset,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto mb-6 font-mono text-black dark:text-white">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-black dark:border-white pb-3 gap-2">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-widest uppercase">
            TIC TOC TOE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRules}
            className="px-2.5 py-1 border border-black dark:border-white text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            id="rules-btn"
          >
            [ extra RULES ]
          </button>
          <button
            onClick={onToggleDebug}
            className={`px-2.5 py-1 border border-black dark:border-white text-xs font-bold ${
              isDebug
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
            }`}
            id="debug-btn"
          >
            {isDebug ? '[ DEBUG ]' : '[ no DEBUG ]'}
          </button>
          <button
            onClick={onReset}
            className="px-2.5 py-1 border border-black dark:border-white text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            id="reset-game-btn"
          >
            [ RESET ]
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-bold">
        {[
          { id: 'pvp', label: '2-Player' },
          { id: 'pva_x', label: 'Play X vs AI' },
          { id: 'pva_o', label: 'Play O vs AI' },
          { id: 'ava', label: 'AI vs AI' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectMode(item.id as GameMode)}
            className={`px-3 py-1.5 border border-black dark:border-white ${
              mode === item.id
                ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
                : 'bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
            }`}
            id={`mode-${item.id}-btn`}
          >
            [ {item.label} ]
          </button>
        ))}
      </div>
    </header>
  );
};
