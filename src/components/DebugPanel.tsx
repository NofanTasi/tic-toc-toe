import React, { useState } from 'react';
import { BoardState, GameMode, Line, MoveHistoryItem, Player, GameVariant } from '../types';
import {
  boardToAbstractString,
  boardToString,
  getBestAIMove,
  getSafeLineRemovals,
  matchCanonicalClass,
  INITIAL_BOARD,
} from '../utils/tictactoe';
import { SccGraphPanel } from './SccGraphPanel';

interface DebugPanelProps {
  board: BoardState;
  currentTurn: Player;
  mode: GameMode;
  variant: GameVariant;
  history: MoveHistoryItem[];
  winner: Player | null;
  filledLines: Line[];
  isBoardFull: boolean;
  gamesPlayed: number;
  aiSpeed: number;
  onSetAiSpeed: (speed: number) => void;
  isAiPaused: boolean;
  onToggleAiPause: () => void;
  onStepAi: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo?: () => void;
  canRedo?: boolean;
  isAiThinking: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  board,
  currentTurn,
  mode,
  variant = 'TTT',
  history,
  winner,
  filledLines,
  isBoardFull,
  gamesPlayed,
  aiSpeed,
  onSetAiSpeed,
  isAiPaused,
  onToggleAiPause,
  onStepAi,
  onUndo,
  canUndo,
  onRedo,
  canRedo = false,
  isAiThinking,
}) => {
  const [activeTab, setActiveTab] = useState<'engine' | 'scc'>('scc');
  const [copied, setCopied] = useState<boolean>(false);

  const activeVariant: GameVariant = (variant as GameVariant) || 'TTT';
  const opponentLabel = activeVariant === 'TTT' ? 'TTT' : 'XOX';
  const rawStr = boardToString(board);
  const abstractStr = boardToAbstractString(board);
  const canonicalMatch = matchCanonicalClass(board);
  const safeLines = getSafeLineRemovals(board);
  const aiRecommendation = getBestAIMove(board, currentTurn, activeVariant);

  const countX = board.filter((c) => c === 'X').length;
  const countO = board.filter((c) => c === 'O').length;

  const historyBoards: BoardState[] = [
    INITIAL_BOARD,
    ...history.map((h) => h.boardAfter),
  ];

  return (
    <div className="w-full max-w-xl mx-auto mt-6 border-2 border-black dark:border-white p-3 font-mono text-xs bg-white dark:bg-black text-black dark:text-white space-y-4 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2">
        <span className="font-bold uppercase tracking-wider">DEBUG & GRAPH ENGINE</span>
        <span className="text-[10px] opacity-75">
          {isAiThinking ? `${opponentLabel} THINKING...` : isAiPaused ? `${opponentLabel} PAUSED` : 'ACTIVE'}
        </span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border border-black dark:border-white">
        <button
          onClick={() => setActiveTab('scc')}
          className={`flex-1 py-1 text-center font-bold text-[11px] border-r border-black dark:border-white ${
            activeTab === 'scc'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          id="tab-scc-btn"
        >
          ∞ Game Graph Explorer
        </button>
        <button
          onClick={() => setActiveTab('engine')}
          className={`flex-1 py-1 text-center font-bold text-[11px] ${
            activeTab === 'engine'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          id="tab-engine-btn"
        >
          Engine Analytics
        </button>
      </div>

      {/* Interactive Controls (Undo / Redo & Media Gadget) */}
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
            Undo Move
          </button>

          {onRedo && (
            <button
              onClick={onRedo}
              disabled={!canRedo || isAiThinking}
              className="px-2 py-1 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-40"
              id="debug-redo-btn"
            >
              Redo Move
            </button>
          )}

          {mode === 'ava' && (
            <>
              <button
                onClick={onToggleAiPause}
                className="px-2 py-1 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                id="debug-pause-btn"
              >
                {isAiPaused ? `Resume ${opponentLabel}` : `Pause ${opponentLabel}`}
              </button>

              <button
                onClick={onStepAi}
                disabled={isAiThinking || winner !== null}
                className="px-2 py-1 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-40"
                id="debug-step-btn"
              >
                Step {opponentLabel}
              </button>
            </>
          )}

          <div className="flex items-center gap-1 ml-auto text-[11px]">
            <span className="font-bold">SPEED:</span>
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

      {/* Conditional Content Tab View */}
      {activeTab === 'scc' ? (
        <SccGraphPanel
          historyBoards={historyBoards}
          variant={variant}
          isAiVsAi={mode === 'ava'}
          aiSpeed={aiSpeed}
        />
      ) : (
        <div className="space-y-4">
          {/* Board & Piece Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-black dark:border-white p-2 space-y-1">
              <div className="font-bold border-b border-black dark:border-white pb-1">
                BOARD STATE
              </div>
              <div>Games Played: <span className="font-bold">{gamesPlayed}</span></div>
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
              {opponentLabel} STRATEGY ENGINE RECOMMENDATION
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

          {/* Move History Stack & Export Log */}
          <div className="border border-black dark:border-white p-2 space-y-2">
            <div className="font-bold border-b border-black dark:border-white pb-1 flex justify-between items-center">
              <span>MOVE HISTORY STACK ({history.length} MOVES)</span>
              <div className="flex gap-2 text-[10px] items-center">
                {copied && <span className="text-[10px] opacity-80">Copied!</span>}
                <button
                  onClick={() => {
                    const logData = JSON.stringify(
                      {
                        timestamp: new Date().toISOString(),
                        mode,
                        variant,
                        gamesPlayed,
                        winner,
                        finalBoard: boardToString(board),
                        history: history.map((h, i) => ({
                          moveNum: i + 1,
                          turn: h.turn,
                          action: h.action,
                          cellIndex: h.cellIndex,
                          lineCleared: h.lineCleared?.name,
                          boardBefore: boardToString(h.boardBefore),
                          boardAfter: boardToString(h.boardAfter),
                        })),
                      },
                      null,
                      2
                    );
                    navigator.clipboard.writeText(logData);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2 py-0.5 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  id="copy-log-btn"
                >
                  Copy Log
                </button>
                <button
                  onClick={() => {
                    const logData = JSON.stringify(
                      {
                        timestamp: new Date().toISOString(),
                        mode,
                        variant,
                        gamesPlayed,
                        winner,
                        finalBoard: boardToString(board),
                        history: history.map((h, i) => ({
                          moveNum: i + 1,
                          turn: h.turn,
                          action: h.action,
                          cellIndex: h.cellIndex,
                          lineCleared: h.lineCleared?.name,
                          boardBefore: boardToString(h.boardBefore),
                          boardAfter: boardToString(h.boardAfter),
                        })),
                      },
                      null,
                      2
                    );
                    const blob = new Blob([logData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tictactoe_log_${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2 py-0.5 border border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  id="download-log-btn"
                >
                  Download Log
                </button>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="opacity-60 italic">No moves recorded yet.</div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] pr-1">
                {history
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b border-dotted border-black/30 dark:border-white/30 pb-0.5"
                    >
                      <span>
                        #{history.length - idx} [{item.turn}] {item.action.toUpperCase()}
                        {item.action === 'place'
                          ? ` @ Cell #${item.cellIndex}`
                          : ` Line: ${item.lineCleared?.name}`}
                      </span>
                      <span className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">
                        {boardToString(item.boardAfter)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

