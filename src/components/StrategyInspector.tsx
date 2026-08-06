import React, { useState } from 'react';
import { BoardState, CanonicalMatch, MoveHistoryItem, Line } from '../types';
import { History, Shield, BookOpen, Undo2, ChevronDown, ChevronUp } from 'lucide-react';

interface StrategyInspectorProps {
  board: BoardState;
  canonicalMatch: CanonicalMatch | null;
  history: MoveHistoryItem[];
  onUndo: () => void;
  canUndo: boolean;
  onOpenReferenceModal: () => void;
  isAiVsAi: boolean;
  aiSpeed: number;
  onSetAiSpeed: (speed: number) => void;
  onStepAi: () => void;
  isAiPlaying: boolean;
  isAiPaused: boolean;
  onToggleAiPause: () => void;
}

export const StrategyInspector: React.FC<StrategyInspectorProps> = ({
  board,
  canonicalMatch,
  history,
  onUndo,
  canUndo,
  onOpenReferenceModal,
  isAiVsAi,
  aiSpeed,
  onSetAiSpeed,
  onStepAi,
  isAiPlaying,
  isAiPaused,
  onToggleAiPause,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const pieceCount = board.filter((c) => c !== null).length;
  const cycleCount = history.filter((item) => item.action === 'clear').length;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-850 cursor-pointer select-none border-b border-stone-100 dark:border-stone-800"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Tic Toc Toe Strategy & Analysis Engine
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
              {pieceCount}/9 Pieces
            </span>
            {cycleCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-800 animate-pulse">
                Catch-22 Cycles: {cycleCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReferenceModal();
              }}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              id="canonical-matrix-btn"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Canonical Classes Matrix</span>
            </button>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>
        </div>

        {/* Card Body */}
        {isExpanded && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Symmetry & Strategy Match */}
            <div className="flex flex-col gap-3 p-3 bg-stone-50/80 dark:bg-stone-850/80 rounded-xl border border-stone-200/60 dark:border-stone-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Board Classification
                </span>
                {canonicalMatch && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Exact D4 Match
                  </span>
                )}
              </div>

              {canonicalMatch ? (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    {canonicalMatch.className}
                  </div>
                  <div className="text-stone-600 dark:text-stone-400">
                    Canonical Grid Pattern:{' '}
                    <code className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {canonicalMatch.canonicalBoard}
                    </code>
                  </div>
                  <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
                      Safe Strategy Removals:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {canonicalMatch.safeLineIds.map((lineId) => (
                        <span
                          key={lineId}
                          className="px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium"
                        >
                          {lineId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : pieceCount === 9 ? (
                <div className="text-xs text-stone-500 dark:text-stone-400 italic">
                  Full board draw position reached. Evaluating symmetries...
                </div>
              ) : (
                <div className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  In Tic Toc Toe, classical Tic Tac Toe minimax strategy leads to an <strong>infinite Catch-22 play loop</strong>. When a full board draw is reached, removing a safe line of 3 symbols returns the board to a 6-piece classical draw state!
                </div>
              )}

              {/* AI vs AI Controls & Infinite Play Banner */}
              {isAiVsAi && (
                <div className="mt-2 pt-2 border-t border-stone-200 dark:border-stone-700 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <span>♾️ Catch-22 AI Loop</span>
                      <span className="text-[10px] font-normal opacity-80">(Minimax Active)</span>
                    </span>
                    <button
                      onClick={onToggleAiPause}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${
                        isAiPaused
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isAiPaused ? 'Resume AI' : 'Pause AI'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                        Speed:
                      </span>
                      {[
                        { label: 'Slow', ms: 1000 },
                        { label: 'Med', ms: 400 },
                        { label: 'Fast', ms: 100 },
                      ].map((s) => (
                        <button
                          key={s.label}
                          onClick={() => onSetAiSpeed(s.ms)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            aiSpeed === s.ms
                              ? 'bg-purple-600 text-white'
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={onStepAi}
                      className="px-2.5 py-1 text-xs font-bold rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                    >
                      Step 1 Move
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Move History Log & Undo */}
            <div className="flex flex-col gap-2 p-3 bg-stone-50/80 dark:bg-stone-850/80 rounded-xl border border-stone-200/60 dark:border-stone-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Move Log ({history.length})
                  </span>
                </div>
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors"
                  id="undo-btn"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              </div>

              <div className="h-32 overflow-y-auto space-y-1 text-xs pr-1 font-mono">
                {history.length === 0 ? (
                  <div className="text-stone-400 dark:text-stone-500 text-center py-8 italic">
                    No moves made yet
                  </div>
                ) : (
                  [...history].reverse().map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-750 text-[11px]"
                    >
                      <span className="font-semibold text-stone-500">
                        #{history.length - idx}
                      </span>
                      <span
                        className={`font-bold ${
                          item.turn === 'X'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        Player {item.turn}
                      </span>
                      <span className="text-stone-700 dark:text-stone-300">
                        {item.action === 'place'
                          ? `Placed at Cell ${item.cellIndex! + 1}`
                          : `Cleared ${item.lineCleared?.name}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
