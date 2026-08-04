import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function TableOfContents({
  id = "in-this-article-section",
  content,
  themeClasses,
  postPages,
  currentPageIndex,
  onPageChange,
  collapsible = false,
  defaultCollapsed = false
}: {
  id?: string;
  content: string;
  themeClasses: any;
  postPages?: string[];
  currentPageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}) {
  const [headers, setHeaders] = useState<{ level: number; text: string; id: string; pageIndex: number }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);

  useEffect(() => {
    const extracted: typeof headers = [];

    if (postPages && postPages.length > 1) {
      postPages.forEach((pageContent, pageIdx) => {
        const lines = pageContent.split('\n');
        let inCodeBlock = false;
        for (let line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
          }
          if (inCodeBlock) continue;

          if (trimmed.startsWith('#')) {
            const match = trimmed.match(/^#+/);
            if (match) {
              const level = match[0].length;
              const text = trimmed.replace(/^#+\s*/, '');
              const id = 'hdr-' + text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
              extracted.push({ level, text, id, pageIndex: pageIdx });
            }
          }
        }
      });
    } else {
      const lines = content.split('\n');
      let inCodeBlock = false;
      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }
        if (inCodeBlock) continue;

        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^#+/);
          if (match) {
            const level = match[0].length;
            const text = trimmed.replace(/^#+\s*/, '');
            const id = 'hdr-' + text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            extracted.push({ level, text, id, pageIndex: 0 });
          }
        }
      }
    }

    setHeaders(extracted);
  }, [content, postPages]);

  useEffect(() => {
    const handleScroll = () => {
      let currentActive: string | null = null;
      for (const h of headers) {
        if (currentPageIndex !== undefined && h.pageIndex !== currentPageIndex) {
          continue;
        }
        const el = document.getElementById(h.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            currentActive = h.id;
          }
        }
      }
      setActiveId(currentActive || (headers.find(h => currentPageIndex === undefined || h.pageIndex === currentPageIndex)?.id || null));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headers, currentPageIndex]);

  if (headers.length === 0) return null;

  const tocNav = (
    <nav className="space-y-2 border-l border-slate-200 dark:border-slate-800/80">
      {headers.map((h, i) => (
        <a
          key={i}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault();
            const doScroll = () => {
              const targetEl = document.getElementById(h.id);
              if (targetEl) {
                const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - 90;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            };

            if (onPageChange && currentPageIndex !== undefined && h.pageIndex !== currentPageIndex) {
              onPageChange(h.pageIndex);
              setTimeout(doScroll, 150);
            } else {
              doScroll();
            }
          }}
          className={`block text-xs transition-all duration-150 py-0.5 border-l -ml-[1px] leading-tight ${h.level === 1
              ? 'font-semibold text-slate-900 dark:text-slate-100'
              : h.level === 2
                ? 'font-medium text-slate-700 dark:text-slate-300'
                : h.level === 3
                  ? 'text-slate-500 dark:text-slate-400 font-normal'
                  : 'text-slate-400 dark:text-slate-500 italic text-[11px]'
            } ${activeId === h.id
              ? `${themeClasses.text} border-rose-500 dark:border-rose-400 font-bold scale-[1.02]`
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );

  if (collapsible) {
    return (
      <div id={id} className="rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm shadow-sm animate-fade-in overflow-hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-4 text-xs md:text-sm font-bold text-slate-900 dark:text-white font-sans hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        >
          <span>In this article</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
        {!isCollapsed && (
          <div className="px-4 pb-4 space-y-2">
            {tocNav}
          </div>
        )}
      </div>
    );
  }

  return (
    <div id={id} className="space-y-3.5 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm shadow-sm animate-fade-in">
      <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white font-sans">
        In this article
      </h4>
      {tocNav}
    </div>
  );
}
