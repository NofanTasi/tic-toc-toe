import React from 'react';
import { GameMode, GameVariant, Language } from '../types';
import { t } from '../i18n';

interface HeaderProps {
  mode: GameMode;
  variant: GameVariant;
  language: Language;
  isDebug: boolean;
  onSelectMode: (mode: GameMode) => void;
  onSelectVariant: (variant: GameVariant) => void;
  onOpenRules: () => void;
  onToggleDebug: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  variant,
  language,
  isDebug,
  onSelectMode,
  onSelectVariant,
  onOpenRules,
  onToggleDebug,
  onReset,
}) => {
  const opponentLabel = variant === 'TTT' ? 'TTT' : 'XOX';

  return (
    <header className="w-full max-w-xl mx-auto mb-6 font-mono text-black dark:text-white">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-black dark:border-white pb-3 gap-3">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-2xl font-bold tracking-widest uppercase">
            {variant === 'OXO' ? t(language, 'title_oxo') : t(language, 'title_ttt')}
          </h1>
        </div>

        {/* Game Variant Switch & Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* TTT / XOX Toggle */}
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

          <button
            onClick={onOpenRules}
            className="px-2.5 py-1 border border-black dark:border-white text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            id="rules-btn"
          >
            {t(language, 'rules')}
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
            {t(language, 'debug')}
          </button>
          <button
            onClick={onReset}
            className="px-2.5 py-1 border border-black dark:border-white text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            id="reset-game-btn"
          >
            {t(language, 'reset')}
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-bold">
        {[
          { id: 'pvp', label: t(language, 'mode_pvp') },
          { id: 'pva_x', label: t(language, 'mode_pva_x', { opp: opponentLabel }) },
          { id: 'pva_o', label: t(language, 'mode_pva_o', { opp: opponentLabel }) },
          { id: 'ava', label: t(language, 'mode_ava', { opp: opponentLabel }) },
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

