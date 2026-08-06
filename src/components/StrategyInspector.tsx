import React, { useState } from 'react';
import { BoardState, CanonicalMatch, MoveHistoryItem } from '../types';

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
  isAiPaused,
  onToggleAiPause,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const pieceCount = board.filter((c) => c !== null).length;
  const cycleCount = history.filter((item) => item.action === 'clear').length;

  return (
    <div className="w-full max-w-xl mx-auto mt-6 font-mono text-black dark:text-white">
      <div className="border-2 border-black dark:border-white p-3">
        {/* Toggle Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer select-none font-bold text-xs border-b border-black dark:border-white pb-2"
        >
          <div className="flex items-center gap-2">
            <span>[ STRATEGY ENGINE ]</span>
            <span>PIECES: {pieceCount}/9</span>
            {cycleCount > 0 && <span>CYCLES: {cycleCount}</span>}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenReferenceModal();
            }}
            className="underline hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-1"
            id="canonical-matrix-btn"
          >
            [ CANONICAL MATRIX ]
          </button>
        </div>

        {/* Content Body */}
        {isExpanded && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: Classification */}
            <div className="border border-black dark:border-white p-2 flex flex-col gap-2">
              <div className="font-bold border-b border-black dark:border-white pb-1">
                BOARD CLASSIFICATION
              </div>

              {canonicalMatch ? (
                <div className="space-y-1">
                  <div className="font-bold">{canonicalMatch.className}</div>
                  <div>
                    Abstract Grid Pattern: <code>{canonicalMatch.canonicalBoard}</code>
                  </div>
                  <div className="mt-1">
                    Safe Strategy Removals:
                    <div className="font-bold">
                      {canonicalMatch.safeLineIds.join(', ')}
                    </div>
                  </div>
                </div>
              ) : pieceCount === 9 ? (
                <div>Full board reached. Evaluating symmetries...</div>
              ) : (
                <div className="leading-relaxed">
                  Canonical strategy abstracts grid rotations/reflections (D4) and player symbols into <strong>A</strong> (5 pieces) and <strong>B</strong> (4 pieces). On full draw, safe line removal returns board to 6-piece classical draw.
                </div>
              )}

              {/* AI Controls */}
              {isAiVsAi && (
                <div className="mt-2 pt-2 border-t border-black dark:border-white space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>AI LOOP: ACTIVE</span>
                    <button
                      onClick={onToggleAiPause}
                      className="px-2 py-0.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    >
                      [ {isAiPaused ? 'RESUME' : 'PAUSE'} ]
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold">SPEED:</span>
                    {[
                      { label: 'SLOW', ms: 1000 },
                      { label: 'MED', ms: 400 },
                      { label: 'FAST', ms: 100 },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => onSetAiSpeed(s.ms)}
                        className={`px-1.5 py-0.5 border border-black dark:border-white ${
                          aiSpeed === s.ms
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : ''
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onStepAi}
                    className="w-full text-center py-1 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    [ STEP 1 MOVE ]
                  </button>
                </div>
              )}
            </div>

            {/* Right: History Log */}
            <div className="border border-black dark:border-white p-2 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-black dark:border-white pb-1 font-bold">
                <span>MOVE LOG ({history.length})</span>
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="px-2 py-0.5 border border-black dark:border-white disabled:opacity-30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  id="undo-btn"
                >
                  [ UNDO ]
                </button>
              </div>

              <div className="h-32 overflow-y-auto space-y-1 font-mono text-[11px]">
                {history.length === 0 ? (
                  <div className="text-center py-6 opacity-50">NO MOVES YET</div>
                ) : (
                  [...history].reverse().map((item, idx) => (
                    <div key={item.id} className="flex justify-between border-b border-stone-200 dark:border-stone-800 pb-0.5">
                      <span>#{history.length - idx} P{item.turn}</span>
                      <span>
                        {item.action === 'place'
                          ? `CELL ${item.cellIndex! + 1}`
                          : `CLEAR ${item.lineCleared?.name.toUpperCase()}`}
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
