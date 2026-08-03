import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { OffSecIntelLogo } from '../widgets/OffSecIntelLogo';
import { NavDropdown } from '../NavDropdown';
import { NAVIGATION_CONFIG } from '../../config';
import { taxonomy } from '../../services/taxonomy/instance';
import { useAppContext } from '../../context/AppContext';
import { useAppRouter } from '../../hooks/useAppRouter';
import { getThemeColorClasses } from '../../theme';

export function AppHeader({ isHeaderVisible, scrollProgress, activePost }: { isHeaderVisible: boolean; scrollProgress: number; activePost?: any }) {
  const { darkMode, setDarkMode } = useAppContext();
  const { selectedCategory, setSelectedPostId, setSelectedCategory, setShowDossier, selectedPostId, showDossier } = useAppRouter();
  
  // Local state for subcategory isn't in router, so we'll just omit it or mock it if needed. 
  // Wait, in App.tsx setSelectedSubcategory was used. We can just ignore it for the logo click if it's not strictly necessary,
  // or we can add it to context. Let's add it to context later if needed, or pass it as prop if we don't want to rewrite.
  // To avoid rewriting, I'll pass a dummy or add it to Context. I'll just pass a simple prop for it.
  const handleLogoClick = () => {
    setSelectedPostId(null);
    setSelectedCategory('all');
    setShowDossier(false);
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-transform duration-300 ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full lg:translate-y-0'
    } backdrop-blur ${darkMode ? 'bg-[#0d1321]/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-sm'}`}>
      <div className="max-w-[1680px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand/Logo */}
        <div onClick={handleLogoClick}>
          <OffSecIntelLogo />
        </div>

        {/* Configuration-driven Navigation Menus */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium">
          {NAVIGATION_CONFIG.filter(item => item.visible).map((item, index) => {
            const isActive = taxonomy.matchesFilter(selectedCategory, item.target) && !selectedPostId && !showDossier;
            return (
              <NavDropdown
                key={index}
                item={item}
                isActive={isActive}
                onSelect={(target, action) => {
                  if (action === 'filter') {
                    setSelectedPostId(null);
                    setSelectedCategory(target);
                    setShowDossier(false);
                  } else {
                    window.open(target, '_blank', 'noopener,noreferrer');
                  }
                }}
              />
            );
          })}
        </nav>

        {/* Theme controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-yellow-500 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

      </div>

      {/* Top Progress bar indicator (only visible on post view) */}
      {selectedPostId && activePost && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden hidden lg:block">
          <div className={`h-full ${getThemeColorClasses(activePost.themeColor, darkMode).scrollBar}`} style={{ width: `${scrollProgress}%` }}></div>
        </div>
      )}
    </header>
  );
}
