import React from 'react';
import { GameMode } from '../types';
import { Users, Bot, Play, HelpCircle, RefreshCw } from 'lucide-react';

interface HeaderProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenRules: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onSelectMode, onOpenRules, onReset }) => {
  return (
    <header className="w-full max-w-4xl mx-auto mb-6 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        {/* Title */}
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              TIC <span className="text-indigo-600 dark:text-indigo-400">TOC</span> TOE
            </h1>
            <button
              onClick={onOpenRules}
              className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
              title="How to Play & Canonical Strategy"
              id="rules-btn"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Remove 3 symbols in a line to enable infinite strategic play
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 transition-colors"
            id="reset-game-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl max-w-md mx-auto">
        <button
          onClick={() => onSelectMode('pvp')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'pvp'
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
          id="mode-pvp-btn"
        >
          <Users className="w-3.5 h-3.5" />
          <span>2-Player</span>
        </button>

        <button
          onClick={() => onSelectMode('pva_x')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'pva_x'
              ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
          id="mode-pva-x-btn"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Play X vs AI</span>
        </button>

        <button
          onClick={() => onSelectMode('pva_o')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'pva_o'
              ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
          id="mode-pva-o-btn"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Play O vs AI</span>
        </button>

        <button
          onClick={() => onSelectMode('ava')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'ava'
              ? 'bg-white dark:bg-stone-900 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
          id="mode-ava-btn"
        >
          <Play className="w-3.5 h-3.5" />
          <span>AI vs AI</span>
        </button>
      </div>
    </header>
  );
};
