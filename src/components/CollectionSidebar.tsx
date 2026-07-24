import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Layers, X, Menu } from 'lucide-react';
import { CollectionConfig, CollectionTocEntry } from '../services/taxonomy/types';

interface CollectionSidebarProps {
  collection: CollectionConfig;
  currentPostSlug: string;
  onSelectPostBySlug: (slug: string) => void;
  isDark: boolean;
}

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({
  collection,
  currentPostSlug,
  onSelectPostBySlug,
  isDark
}) => {
  // Track open sections (default to expanding all sections initially)
  const [openSections, setOpenSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    collection.toc.forEach((_, idx) => {
      initial[idx] = true;
    });
    return initial;
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderTocTree = () => (
    <div className="space-y-4">
      {/* Collection Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-rose-500 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
          <Layers size={13} />
          <span>Series Collection</span>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white text-sm font-sans leading-snug">
          {collection.label}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {collection.description}
        </p>
      </div>

      {/* Accordion Chapters */}
      <div className="space-y-2 font-mono text-xs">
        {collection.toc.map((section, sIdx) => {
          const isOpen = openSections[sIdx] !== false;
          const hasActiveChild = section.children?.some(c => c.postSlug === currentPostSlug);

          return (
            <div key={sIdx} className="rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
              {/* Section Header Button */}
              <button
                onClick={() => toggleSection(sIdx)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-bold transition-colors ${
                  hasActiveChild
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="truncate pr-2">{section.label}</span>
                {isOpen ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronRight size={14} className="shrink-0 text-slate-400" />}
              </button>

              {/* Children Links */}
              {isOpen && section.children && section.children.length > 0 && (
                <div className="px-2 py-1.5 space-y-1 bg-white dark:bg-[#0b0f19] border-t border-slate-200/40 dark:border-slate-800/40">
                  {section.children.map((child, cIdx) => {
                    const isActive = child.postSlug === currentPostSlug;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => {
                          onSelectPostBySlug(child.postSlug);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition-all flex items-center gap-2 ${
                          isActive
                            ? 'bg-rose-500 text-white font-bold shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left-Hand Collapsible Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0d1321]/80 backdrop-blur-md shadow-sm">
        {renderTocTree()}
      </aside>

      {/* Mobile Floating Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold shadow-sm"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={14} />
            <span>Collection Contents: {collection.label}</span>
          </div>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Mobile Slide-over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full bg-white dark:bg-[#0d1321] h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-mono text-xs font-bold text-slate-400 uppercase">Series TOC</span>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {renderTocTree()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
