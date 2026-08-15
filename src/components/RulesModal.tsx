import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, language = 'EN' }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'scc'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono text-black dark:text-white">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white max-w-md w-full flex flex-col p-4 shadow-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            {t(language, 'rules_modal_title')}
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
            {t(language, 'tab_rules')}
          </button>
          <button
            onClick={() => setActiveTab('scc')}
            className={`flex-1 py-1 text-center font-bold text-xs ${
              activeTab === 'scc'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {t(language, 'tab_graph')}
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 text-xs">
          {activeTab === 'rules' ? (
            <div className="space-y-3">
              <div className="border border-black dark:border-white p-2.5 leading-relaxed">
                <strong>{t(language, 'rule_ttt_title')}</strong> {t(language, 'rule_ttt_desc')}
              </div>
              <div className="border border-black dark:border-white p-2.5 leading-relaxed">
                <strong>{t(language, 'rule_oxo_title')}</strong> {t(language, 'rule_oxo_desc')}
              </div>
              <div className="border border-black dark:border-white p-2.5 leading-relaxed">
                <strong>{t(language, 'rule_clear_title')}</strong> {t(language, 'rule_clear_desc')}
              </div>
              <div className="border border-black dark:border-white p-2.5 leading-relaxed">
                <strong>{t(language, 'rule_full_title')}</strong> {t(language, 'rule_full_desc')}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-black dark:border-white p-3 leading-relaxed bg-black/5 dark:bg-white/5">
                <div className="font-bold border-b border-black/30 dark:border-white/30 pb-1 mb-2">
                  {t(language, 'graph_infinite_title')}
                </div>
                <p className="mb-2">
                  {t(language, 'graph_dag_desc')}
                </p>
                <p className="mb-2">
                  {t(language, 'graph_ttt_desc')}
                </p>
                <p>
                  {t(language, 'graph_oxo_desc')}
                </p>
              </div>

              <div className="border border-black dark:border-white p-3 leading-relaxed space-y-1">
                <div className="font-bold border-b border-black/30 dark:border-white/30 pb-1 mb-1">
                  {t(language, 'graph_map_title')}
                </div>
                <p>• <strong>{t(language, 'graph_spec_desc')}</strong></p>
                <p>• <strong>{t(language, 'graph_cent_desc')}</strong></p>
                <p>• <strong>{t(language, 'graph_stat_desc')}</strong></p>
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
            {t(language, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
