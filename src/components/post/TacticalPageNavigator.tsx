import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function TacticalPageNavigator({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (index: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] select-none shadow-sm">
      <button
        disabled={currentPage === 0}
        onClick={() => {
          onPageChange(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${currentPage === 0
            ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
            : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        <ChevronLeft size={13} />
        PREV_PAGE
      </button>

      <div className="flex items-center gap-1.5 font-bold">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              onPageChange(idx);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${currentPage === idx
                ? 'bg-[#970000]/10 border-[#970000]/30 text-[#ff4b4b] font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            {idx + 1}
          </button>
        ))}
        <span className="text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline">
          (SECTION: {currentPage + 1} / {totalPages})
        </span>
      </div>

      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => {
          onPageChange(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${currentPage === totalPages - 1
            ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
            : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        NEXT_PAGE
        <ChevronRight size={13} />
      </button>
    </div>
  );
}
