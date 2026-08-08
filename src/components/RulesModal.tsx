import React, { useState } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'scc'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono text-black dark:text-white">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white max-w-md w-full flex flex-col p-4 shadow-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            === GAME RULES & MATHEMATICS ===
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-0.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border border-black dark:border-white mb-3">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-1 text-center font-bold text-xs border-r border-black dark:border-white ${
              activeTab === 'rules'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            Extra Rules
          </button>
          <button
            onClick={() => setActiveTab('scc')}
            className={`flex-1 py-1 text-center font-bold text-xs ${
              activeTab === 'scc'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            Graph Theory
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 text-xs">
          {activeTab === 'rules' ? (
            <div className="space-y-3">
              <div className="border border-black dark:border-white p-3 leading-relaxed">
                <strong>Line Removal Rule:</strong> At any turn, a player can remove 3 symbols in a line (row, column, or diagonal that is fully filled).
              </div>
              <div className="border border-black dark:border-white p-3 leading-relaxed">
                <strong>Placement Rule:</strong> If there are empty cells on the board, a player can place their symbol ('X' or 'O') in any open cell.
              </div>
              <div className="border border-black dark:border-white p-3 leading-relaxed">
                <strong>Full Board Dynamic:</strong> When all 9 cells are full, a player must clear a filled line to continue play.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-black dark:border-white p-3 leading-relaxed bg-black/5 dark:bg-white/5">
                <div className="font-bold border-b border-black/30 dark:border-white/30 pb-1 mb-2">
                  THE INFINITE RECURRENT GAME GRAPH
                </div>
                <p className="mb-2">
                  In classical games like Tic-Tac-Toe, the state space is a <strong>Directed Acyclic Graph (DAG)</strong> leading to terminal leaves (win, loss, draw).
                </p>
                <p className="mb-2">
                  In <strong>Tic-Toc-Toe</strong>, the state dictionary condenses into a <strong>Single 211-Node Interconnected Graph</strong> under D4 symmetry and role swap.
                </p>
                <p>
                  Because clearing a line converts 9-piece full boards back to 6-piece boards, every reachable state can navigate to every other state in an ergodic loop!
                </p>
              </div>

              <div className="border border-black dark:border-white p-3 leading-relaxed space-y-1">
                <div className="font-bold border-b border-black/30 dark:border-white/30 pb-1 mb-1">
                  SPECTRAL TOPOLOGY MAP
                </div>
                <p>• <strong>Branching Factor (λ ≈ 2.8109):</strong> The largest eigenvalue governing exponential path growth.</p>
                <p>• <strong>Centrality Hubs:</strong> States with high eigenvector centrality (up to 0.2139) offering maximum strategic flexibility.</p>
                <p>• <strong>Sticky Reservoirs:</strong> States with high long-run stationary probability (up to 0.0191) where players spend most of their game time.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t-2 border-black dark:border-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 border border-black dark:border-white font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
