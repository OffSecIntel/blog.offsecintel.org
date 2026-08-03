import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight,
  BookOpen, Search, Layers, X
} from 'lucide-react';
import { CollectionConfig } from '../services/taxonomy/types';
import { BlogPost } from '../types';

interface CollectionSidebarProps {
  collection: CollectionConfig;
  currentPostSlug: string;
  onSelectPostBySlug: (slug: string) => void;
  isDark: boolean;
  posts?: BlogPost[];
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({
  collection,
  currentPostSlug,
  onSelectPostBySlug,
  isDark,
  posts,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer
}) => {
  // Desktop sidebar expand/collapse state (Microsoft Learn style « / »)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Helper to check if a child post exists and is published (not draft)
  const isArticlePublished = (slug: string): boolean => {
    if (!posts || posts.length === 0) return true;
    return posts.some(p => p.slug === slug && p.published && !p.draft);
  };

  // Track open sections inside the TOC (only expand section containing active published post)
  const [openSections, setOpenSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    collection.toc.forEach((section, idx) => {
      const hasActiveChild = section.children?.some(
        c => c.postSlug === currentPostSlug && isArticlePublished(c.postSlug)
      );
      initial[idx] = !!hasActiveChild;
    });
    return initial;
  });

  // Sync open sections whenever active post or collection changes
  useEffect(() => {
    const updated: Record<number, boolean> = {};
    collection.toc.forEach((section, idx) => {
      const hasActiveChild = section.children?.some(
        c => c.postSlug === currentPostSlug && isArticlePublished(c.postSlug)
      );
      updated[idx] = !!hasActiveChild;
    });
    setOpenSections(updated);
  }, [currentPostSlug, collection, posts]);

  const [filterQuery, setFilterQuery] = useState('');

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderTocTree = (isMobileView = false) => {
    const query = filterQuery.trim().toLowerCase();

    return (
      <div className="space-y-4">
        {/* Header Bar with Microsoft Learn Style Collapse Button («) */}
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-rose-500 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
              <Layers size={12} />
              <span>{collection.label}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs font-sans">
              Series Navigation
            </h3>
          </div>

          {!isMobileView && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              title="Collapse sidebar («)"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
          )}
        </div>

        {/* Find by Title Search Input */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Find by title"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* TOC Accordion Tree */}
        <div className="space-y-3 font-mono text-xs">
          {collection.toc.map((section, sIdx) => {
            const isOpen = openSections[sIdx] !== false || query.length > 0;
            const children = (section.children || []).filter(c => isArticlePublished(c.postSlug));

            // Hide empty chapter sections that contain 0 published posts
            if (children.length === 0) {
              return null;
            }

            const filteredChildren = query
              ? children.filter(c => c.label.toLowerCase().includes(query))
              : children;

            if (query && filteredChildren.length === 0 && !section.label.toLowerCase().includes(query)) {
              return null;
            }

            return (
              <div key={sIdx} className="space-y-1">
                {/* Section Header with Left-Aligned Accordion Icon (> or v) */}
                <button
                  onClick={() => toggleSection(sIdx)}
                  className="w-full flex items-center gap-2 py-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-sans"
                >
                  {isOpen ? (
                    <ChevronDown size={14} className="shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight size={14} className="shrink-0 text-slate-400" />
                  )}
                  <span className="truncate">{section.label}</span>
                </button>

                {/* Sub-Items Indented Tree */}
                {isOpen && filteredChildren.length > 0 && (
                  <div className="ml-3.5 pl-2.5 border-l border-slate-200 dark:border-slate-800 space-y-1 py-0.5">
                    {filteredChildren.map((child, cIdx) => {
                      const isActive = child.postSlug === currentPostSlug;
                      return (
                        <button
                          key={cIdx}
                          onClick={() => {
                            onSelectPostBySlug(child.postSlug);
                            if (isMobileView && onCloseMobileDrawer) onCloseMobileDrawer();
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-sans transition-all flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-rose-500/10 text-rose-500 font-bold border-l-2 border-rose-500 pl-2.5'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="truncate">{child.label}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
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
  };

  return (
    <>
      {/* Desktop Left-Hand Sidebar (Microsoft Learn Style In-Place Collapse « / ») */}
      <aside className={`hidden lg:block shrink-0 sticky top-24 self-start transition-all duration-300 ${
        isSidebarCollapsed ? 'w-10' : 'w-64'
      }`}>
        {isSidebarCollapsed ? (
          /* Slim Collapsed Rail with Re-expand Button (») */
          <div className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0d1321]/80 backdrop-blur-md shadow-sm flex flex-col items-center">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              title="Expand sidebar (»)"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        ) : (
          /* Full TOC Sidebar Card */
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0d1321]/80 backdrop-blur-md shadow-sm">
            {renderTocTree(false)}
          </div>
        )}
      </aside>

      {/* Mobile Slide-over Drawer (Opened via Three-Dots Menu) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onCloseMobileDrawer} />
          <div className="relative mr-auto w-80 max-w-full bg-white dark:bg-[#0d1321] h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-sans text-sm font-bold text-slate-900 dark:text-white">Table of contents</span>
                <button onClick={onCloseMobileDrawer} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {renderTocTree(true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
