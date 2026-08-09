import React from 'react';
import { GameMode, GameVariant, UiMode } from '../types';

interface HeaderProps {
  mode: GameMode;
  variant: GameVariant;
  uiMode: UiMode;
  isDebug: boolean;
  onSelectMode: (mode: GameMode) => void;
  onSelectVariant: (variant: GameVariant) => void;
  onToggleUiMode: () => void;
  onOpenRules: () => void;
  onToggleDebug: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  variant,
  uiMode,
  isDebug,
  onSelectMode,
  onSelectVariant,
  onToggleUiMode,
  onOpenRules,
  onToggleDebug,
  onReset,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto mb-6 font-mono text-black dark:text-white">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-black dark:border-white pb-3 gap-3">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-2xl font-bold tracking-widest uppercase">
            {uiMode === 'WIP' && variant === 'OXO' ? 'XOX' : 'TIC TOC TOE'}
          </h1>
        </div>

        {/* Game Variant Switch & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* NORMAL | WIP UI Mode Toggle */}
          <button
            onClick={onToggleUiMode}
            className={`px-2.5 py-1 border-2 border-black dark:border-white text-xs font-black transition-colors ${
              uiMode === 'WIP'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-black dark:bg-black dark:text-white hover:bg-black/10'
            }`}
            id="ui-mode-toggle-btn"
            title="Toggle between minimal NORMAL interface and WIP experimental features"
          >
            {uiMode === 'WIP' ? 'WIP' : 'NORMAL'}
          </button>

          {/* TTT / XOX Toggle (Revealed only in WIP mode) */}
          {uiMode === 'WIP' && (
            <div className="flex items-center border-2 border-black dark:border-white text-xs font-bold">
              <button
                onClick={() => onSelectVariant('TTT')}
                className={`px-2.5 py-1 transition-colors ${
                  variant === 'TTT'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                    : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
                id="variant-ttt-btn"
                title="Standard Tic-Tac-Toe Line Removal Variant (211 States)"
              >
                TTT
              </button>
              <button
                onClick={() => onSelectVariant('OXO')}
                className={`px-2.5 py-1 transition-colors ${
                  variant === 'OXO'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                    : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
                id="variant-oxo-btn"
                title="OXO/XOX Line Removal Variant with Free Symbol Choice (1080 States)"
              >
                XOX
              </button>
            </div>
          )}

          <button
            onClick={onOpenRules}
            className="px-2.5 py-1 border border-black dark:border-white text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            id="rules-btn"
          >
            Rules
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
            Debug
          </button>
          <button
            onClick={onReset}
            className="px-2.5 py-1 border border-black dark:border-white text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            id="reset-game-btn"
          >
            Reset
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
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

