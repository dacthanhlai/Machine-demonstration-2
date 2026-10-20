import React from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '../i18n';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  onExportConfig: () => void;
  onOpenReportModal: () => void;
  onResetMachine: () => void;
  onOpenNewTab?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportConfig,
  onOpenReportModal,
  onResetMachine,
  onOpenNewTab,
}) => {
  const { t } = useLanguage();

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-950 font-mono text-sm">
          TX
        </div>
        <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 font-sans">
          {t('app.title')}
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <a href="#machine" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          {t('header.nav.machine')}
        </a>
        <a href="#kinematics" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          {t('header.nav.kinematics')}
        </a>
        <a href="#clearance" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          {t('header.nav.clearance')}
        </a>
        <a href="#diagnostics" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          {t('header.nav.diagnostics')}
        </a>
        <a href="#suction" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          {t('header.nav.suction')}
        </a>
      </nav>

      {/* Zone 3: Language Selector & Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Language Selector */}
        <LanguageSelector variant="compact" />

        {onOpenNewTab && (
          <button
            onClick={onOpenNewTab}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            title={t('header.openNewTabTitle')}
          >
            <span>{t('header.openNewTab')}</span>
          </button>
        )}
        <button
          onClick={onExportConfig}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('header.exportSpecs')}</span>
        </button>
      </div>
    </header>
  );
};
