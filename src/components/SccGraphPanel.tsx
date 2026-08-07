import React from 'react';
import { BoardState } from '../types';
import { calculateSccMetrics } from '../utils/sccGraph';

interface SccGraphPanelProps {
  historyBoards: BoardState[];
  isAiVsAi: boolean;
  onFastOrbit?: () => void;
  aiSpeed?: number;
}

export const SccGraphPanel: React.FC<SccGraphPanelProps> = ({
  historyBoards,
  isAiVsAi,
  onFastOrbit,
  aiSpeed,
}) => {
  const metrics = calculateSccMetrics(historyBoards);
  const { cycleInfo, recentPath } = metrics;

  return (
    <div className="w-full border-2 border-black dark:border-white p-3 font-mono text-xs bg-white dark:bg-black text-black dark:text-white space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-sm">
            [ ∞ GAME GRAPH EXPLORER ]
          </span>
          {cycleInfo.isCycle && (
            <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-bold animate-pulse">
              ∞ LOOP DETECTED ({cycleInfo.cycleLength} STEPS)
            </span>
          )}
        </div>
        <span className="text-[10px] opacity-75">100% FULLY INTERCONNECTED</span>
      </div>

      {/* Primary Topology Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">Unique States</div>
          <div className="text-lg font-bold">{metrics.uniqueStatesCount}</div>
        </div>

        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">Total Transitions</div>
          <div className="text-lg font-bold">{metrics.totalTransitions}</div>
        </div>

        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">State Visits</div>
          <div className="text-lg font-bold">
            #{metrics.visitCount} {metrics.visitCount > 1 ? '(Recurrent)' : '(First Visit)'}
          </div>
        </div>

        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">Cycle Orbit</div>
          <div className="text-lg font-bold">
            {cycleInfo.isCycle ? `${cycleInfo.cycleLength} Nodes` : 'Exploring...'}
          </div>
        </div>
      </div>

      {/* Active Cycle Orbit Visualizer */}
      {cycleInfo.isCycle ? (
        <div className="border border-black dark:border-white p-2.5 bg-black/5 dark:bg-white/5 space-y-2">
          <div className="flex items-center justify-between border-b border-black/30 dark:border-white/30 pb-1">
            <span className="font-bold text-[11px] uppercase tracking-wider">
              &gt; RECURRENT CYCLE ORBIT TRAJECTORY
            </span>
            <span className="text-[10px] font-bold underline">
              RE-ENTERED AT STEP #{cycleInfo.firstSeenIndex}
            </span>
          </div>

          <div className="text-[11px] leading-relaxed">
            The system has re-entered a previously visited node key{' '}
            <span className="font-bold bg-black/10 dark:bg-white/20 px-1 rounded">
              {metrics.currentStateKey}
            </span>
            . Under optimal play, the game remains permanently trapped inside this recurrent
            state cycle.
          </div>

          {/* Cycle Step Sequence */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {cycleInfo.cycleStates.map((stateKey, idx) => {
              const isCurrent = idx === cycleInfo.cycleStates.length - 1;
              return (
                <React.Fragment key={`${stateKey}-${idx}`}>
                  {idx > 0 && <span className="text-black/40 dark:text-white/40">➔</span>}
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${
                      isCurrent
                        ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'border-black/30 dark:border-white/30 bg-white dark:bg-black'
                    }`}
                    title={`State: ${stateKey}`}
                  >
                    [{stateKey}]
                  </span>
                </React.Fragment>
              );
            })}
            <span className="text-black/40 dark:text-white/40 font-bold">➔ [LOOP ∞]</span>
          </div>
        </div>
      ) : (
        <div className="border border-black dark:border-white p-2 text-[11px] opacity-80 italic">
          No closed state loop detected yet in this move sequence. Play additional moves or enable
          AI vs AI mode to watch the engine enter its endless state orbit!
        </div>
      )}

      {/* Recent Path Trail */}
      <div className="border border-black dark:border-white p-2 space-y-1.5">
        <div className="font-bold text-[11px] uppercase tracking-wider border-b border-black dark:border-white pb-1">
          RECENT GRAPH TRAVERSAL PATH (LAST {recentPath.length} STATES)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
          {recentPath.map((step) => {
            const isCurrent = step.moveNum === metrics.totalTransitions;
            return (
              <div
                key={step.moveNum}
                className={`p-1 border ${
                  isCurrent
                    ? 'border-black dark:border-white font-bold bg-black/5 dark:bg-white/10'
                    : 'border-black/20 dark:border-white/20'
                }`}
              >
                <div className="opacity-60">Step #{step.moveNum}</div>
                <div className="font-mono">{step.key}</div>
                <div className="text-[9px] opacity-75">Abs: {step.abstractKey}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theoretical Explanation */}
      <div className="border border-black dark:border-white p-2 text-[11px] leading-relaxed space-y-1 bg-black/5 dark:bg-white/5">
        <div className="font-bold border-b border-black/30 dark:border-white/30 pb-1">
          === THE INFINITE GRAPH PARADOX ===
        </div>
        <p>
          Classic Tic-Tac-Toe is a <strong>Directed Acyclic Graph (DAG)</strong> where every game
          progresses strictly forward toward a finite terminal state (win or draw).
        </p>
        <p>
          In <strong>Tic-Toc-Toe</strong>, the line removal rule collapses the state dictionary into
          a <strong>single, fully interconnected closed graph</strong>. Because line clearances return
          full 9-cell boards back to 6-cell boards, every reachable state can navigate back to any other
          reachable state. Perfect AI players become trapped in an infinite, ergodic orbit across this
          closed state manifold.
        </p>
      </div>
    </div>
  );
};
