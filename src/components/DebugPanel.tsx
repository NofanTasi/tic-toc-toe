import React from 'react';
import { BoardState, GameMode, Line, MoveHistoryItem, Player } from '../types';
import {
  boardToAbstractString,
  boardToString,
  getBestAIMove,
  getSafeLineRemovals,
  matchCanonicalClass,
} from '../utils/tictactoe';

interface DebugPanelProps {
  board: BoardState;
  currentTurn: Player;
  mode: GameMode;
  history: MoveHistoryItem[];
  winner: Player | null;
  filledLines: Line[];
  isBoardFull: boolean;
  aiSpeed: number;
  onSetAiSpeed: (speed: number) => void;
  isAiPaused: boolean;
  onToggleAiPause: () => void;
  onStepAi: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isAiThinking: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  board,
  currentTurn,
  mode,
  history,
  winner,
  filledLines,
  isBoardFull,
  aiSpeed,
  onSetAiSpeed,
  isAiPaused,
  onToggleAiPause,
  onStepAi,
  onUndo,
  canUndo,
  isAiThinking,
}) => {
  const rawStr = boardToString(board);
  const abstractStr = boardToAbstractString(board);
  const canonicalMatch = matchCanonicalClass(board);
  const safeLines = getSafeLineRemovals(board);
  const aiRecommendation = getBestAIMove(board, currentTurn);

  const countX = board.filter((c) => c === 'X').length;
  const countO = board.filter((c) => c === 'O').length;

  return (
    <div className="w-full max-w-xl mx-auto mt-6 border-2 border-black dark:border-white p-3 font-mono text-xs bg-white dark:bg-black text-black dark:text-white space-y-4 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2">
        <span className="font-bold uppercase tracking-wider">[ DEBUG ENGINE ]</span>
        <span className="text-[10px] opacity-75">
          {isAiThinking ? 'AI THINKING...' : isAiPaused ? 'AI PAUSED' : 'ACTIVE'}
        </span>
      </div>

      {/* Interactive Controls (AI & Undo) */}
      <div className="border border-black dark:border-white p-2 space-y-2">
        <div className="font-bold text-[11px] uppercase tracking-wider border-b border-black dark:border-white pb-1">
          &gt; DEBUG CONTROLS
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo || isAiThinking}
            className="px-2 py-1 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-40"
            id="debug-undo-btn"
          >
            [ UNDO MOVE ]
          </button>

          {mode === 'ava' && (
            <>
              <button
                onClick={onToggleAiPause}
                className="px-2 py-1 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                id="debug-pause-btn"
              >
                {isAiPaused ? '[ RESUME AI ]' : '[ PAUSE AI ]'}
              </button>

              <button
                onClick={onStepAi}
                disabled={isAiThinking || winner !== null}
                className="px-2 py-1 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-40"
                id="debug-step-btn"
              >
                [ STEP AI ]
              </button>
            </>
          )}

          <div className="flex items-center gap-1 ml-auto text-[11px]">
            <span className="font-bold">AI SPEED:</span>
            {[100, 400, 800].map((s) => (
              <button
                key={s}
                onClick={() => onSetAiSpeed(s)}
                className={`px-1.5 py-0.5 border border-black dark:border-white font-bold ${
                  aiSpeed === s
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                }`}
              >
                {s}ms
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Board & Piece Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border border-black dark:border-white p-2 space-y-1">
          <div className="font-bold border-b border-black dark:border-white pb-1">
            BOARD STATE
          </div>
          <div>Turn: <span className="font-bold">{currentTurn}</span></div>
          <div>Mode: <span className="font-bold uppercase">{mode}</span></div>
          <div>Pieces: X={countX} | O={countO} (Total {countX + countO}/9)</div>
          <div>Full Board: {isBoardFull ? 'YES' : 'NO'}</div>
          <div>Winner: {winner ? winner : 'NONE'}</div>
        </div>

        <div className="border border-black dark:border-white p-2 space-y-1">
          <div className="font-bold border-b border-black dark:border-white pb-1">
            REPRESENTATION
          </div>
          <div className="truncate">Raw Str: <span className="font-bold">{rawStr}</span></div>
          <div className="truncate">Abstract: <span className="font-bold">{abstractStr}</span></div>
          <div>Filled Lines: {filledLines.length}</div>
        </div>
      </div>

      {/* Canonical Symmetry Engine Analysis */}
      <div className="border border-black dark:border-white p-2 space-y-1.5">
        <div className="font-bold border-b border-black dark:border-white pb-1">
          CANONICAL SYMMETRY ANALYSIS
        </div>
        {canonicalMatch ? (
          <div>
            <div className="font-bold text-black dark:text-white">
              Matched {canonicalMatch.className}
            </div>
            <div>D4 Symmetry Transform: #{canonicalMatch.transformIndex}</div>
            <div>Canonical Board: {canonicalMatch.canonicalBoard}</div>
            <div>
              Safe Line Removals: {canonicalMatch.safeLineIds.join(', ') || 'None'}
            </div>
          </div>
        ) : (
          <div className="opacity-75 italic">
            {isBoardFull
              ? 'Board is full (non-canonical pattern)'
              : 'Canonical matching triggers on 9-piece full board draw states.'}
          </div>
        )}
      </div>

      {/* AI Strategy Recommendation */}
      <div className="border border-black dark:border-white p-2 space-y-1">
        <div className="font-bold border-b border-black dark:border-white pb-1">
          AI STRATEGY ENGINE RECOMMENDATION
        </div>
        <div>
          Next Best Action for {currentTurn}:{' '}
          <span className="font-bold uppercase">
            {aiRecommendation.action === 'place'
              ? `PLACE @ Cell #${aiRecommendation.index}`
              : `CLEAR ${aiRecommendation.line?.name}`}
          </span>
        </div>
        {safeLines.length > 0 && (
          <div className="text-[11px] opacity-80">
            Available Safe Removals: {safeLines.map((l) => l.name).join(' | ')}
          </div>
        )}
      </div>

      {/* Move History Stack */}
      <div className="border border-black dark:border-white p-2 space-y-1.5">
        <div className="font-bold border-b border-black dark:border-white pb-1 flex justify-between">
          <span>MOVE HISTORY STACK</span>
          <span>{history.length} MOVES</span>
        </div>
        {history.length === 0 ? (
          <div className="opacity-60 italic">No moves recorded yet.</div>
        ) : (
          <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] pr-1">
            {history
              .slice()
              .reverse()
              .map((item, idx) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b border-dotted border-black/30 dark:border-white/30 pb-0.5"
                >
                  <span>
                    #{history.length - idx} [{item.turn}] {item.action.toUpperCase()}
                    {item.action === 'place'
                      ? ` @ Cell #${item.cellIndex}`
                      : ` Line: ${item.lineCleared?.name}`}
                  </span>
                  <span className="opacity-60">
                    {boardToString(item.boardAfter)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
