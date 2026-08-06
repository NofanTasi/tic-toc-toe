import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono text-black dark:text-white">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white max-w-md w-full flex flex-col p-4 shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            === EXTRA RULES ===
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-0.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs"
          >
            [ X ]
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 text-xs">
          <div className="border border-black dark:border-white p-3 leading-relaxed">
            <strong>Line Removal Rule:</strong> At any turn, a player can remove 3 symbols in a line (row, column, or diagonal that is fully filled).
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t-2 border-black dark:border-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 border border-black dark:border-white font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            [ CLOSE ]
          </button>
        </div>
      </div>
    </div>
  );
};

