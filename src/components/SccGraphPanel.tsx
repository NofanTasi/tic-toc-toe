import React from 'react';
import { BoardState, GameVariant } from '../types';
import { calculateSccMetrics } from '../utils/sccGraph';

interface SccGraphPanelProps {
  historyBoards: BoardState[];
  variant?: GameVariant;
  isAiVsAi?: boolean;
  onFastOrbit?: () => void;
  aiSpeed?: number;
}

export const SccGraphPanel: React.FC<SccGraphPanelProps> = ({
  historyBoards,
  variant = 'TTT',
}) => {
  const activeVariant: GameVariant = (variant as GameVariant) || 'TTT';
  const metrics = calculateSccMetrics(historyBoards, activeVariant);
  const { cycleInfo, recentPath, topology } = metrics;

  return (
    <div className="w-full border-2 border-black dark:border-white p-3 font-mono text-xs bg-white dark:bg-black text-black dark:text-white space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-sm">
            ∞ {variant === 'OXO' ? 'XOX' : 'TTT'} GAME GRAPH EXPLORER
          </span>
          {cycleInfo.isCycle && (
            <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-bold animate-pulse">
              LOOP DETECTED ({cycleInfo.cycleLength} STEPS)
            </span>
          )}
        </div>
        <span className="text-[10px] opacity-75">{metrics.totalCanonicalStates} CANONICAL STATES</span>
      </div>

      {/* Primary Topology & Spectral Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">Visited States</div>
          <div className="text-lg font-bold">{metrics.uniqueStatesCount} / {metrics.totalCanonicalStates}</div>
        </div>

        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">Spectral Radius λ</div>
          <div className="text-lg font-bold">{metrics.spectralRadius}</div>
        </div>

        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">Node Centrality</div>
          <div className="text-lg font-bold">{topology.centralityScore.toFixed(4)}</div>
        </div>

        <div className="border border-black dark:border-white p-2">
          <div className="text-[10px] opacity-75 uppercase">Stationary Density</div>
          <div className="text-lg font-bold">{(topology.stationaryProb * 100).toFixed(2)}%</div>
        </div>
      </div>

      {/* Active Node Strategic Designation */}
      <div className="border border-black dark:border-white p-2 bg-black/5 dark:bg-white/5 space-y-1">
        <div className="flex items-center justify-between border-b border-black/30 dark:border-white/30 pb-1">
          <span className="font-bold text-[11px] uppercase tracking-wider">
            &gt; CURRENT STATE TOPOLOGY RATING
          </span>
          <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black">
            {topology.designation}
          </span>
        </div>
        <div className="text-[11px]">
          {topology.rankNotice ? (
            <div className="font-bold text-black dark:text-white">{topology.rankNotice}</div>
          ) : (
            <div>
              Eigenvector Centrality: <strong>{topology.centralityScore.toFixed(4)}</strong> | Long-run Ergodic Visit Density: <strong>{(topology.stationaryProb * 100).toFixed(2)}%</strong>
            </div>
          )}
        </div>
      </div>

      {/* Active Cycle Orbit Visualizer */}
      {cycleInfo.isCycle ? (
        <div className="border border-black dark:border-white p-2.5 space-y-2">
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
                    {stateKey}
                  </span>
                </React.Fragment>
              );
            })}
            <span className="text-black/40 dark:text-white/40 font-bold">➔ LOOP ∞</span>
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

      {/* Structural Analysis breakdown */}
      <div className="border border-black dark:border-white p-2 text-[11px] leading-relaxed space-y-1.5 bg-black/5 dark:bg-white/5">
        <div className="font-bold border-b border-black/30 dark:border-white/30 pb-1">
          === STRUCTURAL ANALYSIS OF THE {metrics.totalCanonicalStates}-NODE {variant} GRAPH ===
        </div>
        <p>
          • <strong>Spectral Radius (λ ≈ {metrics.spectralRadius}):</strong> The largest Perron-Frobenius eigenvalue of the adjacency matrix. Shows exponential growth of distinct infinite trajectories.
        </p>
        <p>
          • <strong>Centrality (Right Eigenvector):</strong> Measures hub-like flexibility. High centrality nodes offer maximum safe choices to adapt to opponent play.
        </p>
        <p>
          • <strong>Stationary Probability (Left Eigenvector):</strong> Long-run fraction of time spent in a random walk. High stationary nodes act as sticky reservoirs.
        </p>
        <p>
          • <strong>Sweet Spot Assets:</strong> Nodes in the top centrality bracket with low stationary probability give high player choice while remaining rare for opponents to anticipate.
        </p>
      </div>
    </div>
  );
};
