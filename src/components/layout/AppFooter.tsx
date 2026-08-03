import React from 'react';
import { PORTAL_CONFIG } from '../../config';
import { OffSecIntelLogoIcon } from '../widgets/OffSecIntelLogo';
import { useAppContext } from '../../context/AppContext';
import { useAppRouter } from '../../hooks/useAppRouter';

declare const __GIT_COMMIT_HASH__: string | undefined;

export function AppFooter() {
  const { darkMode } = useAppContext();
  const { setSelectedPostId, setDossierSelectedResearcherId, setShowDossier } = useAppRouter();

  return (
    <footer className={`mt-16 border-t py-8 text-[10px] font-mono transition-colors ${darkMode ? 'bg-[#0d1321] border-slate-800/80 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
      <div className="max-w-[1680px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <OffSecIntelLogoIcon className="w-5 h-5 p-0.5 rounded" />
          <span>{PORTAL_CONFIG.copyright}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5 text-slate-400 dark:text-slate-500">
          <button
            onClick={() => {
              setSelectedPostId(null);
              setDossierSelectedResearcherId(null);
              setShowDossier(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors uppercase font-bold"
          >
            Our Team
          </button>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-800">|</span>
          <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="break-all sm:break-normal font-mono">
              BUILD_REF: #{typeof __GIT_COMMIT_HASH__ !== 'undefined' ? __GIT_COMMIT_HASH__ : '7df0550'} · STATIC RELEASE
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
