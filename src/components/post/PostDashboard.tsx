import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Terminal, Search, RefreshCw } from 'lucide-react';
import { PORTAL_CONFIG } from '../../config';
import { taxonomy } from '../../services/taxonomy/instance';
import { useAppContext } from '../../context/AppContext';
import { useAppRouter } from '../../hooks/useAppRouter';
import { resolveAssetUrl } from '../../utils/helpers';
import { ThemeBannerFallback } from '../../components/ThemeBannerFallback';

export function PostDashboard({ activeCategoryInfo, getAuthorId, getAuthorDisplay }: any) {
  const { darkMode, posts, loading } = useAppContext();
  const { selectedCategory, setSelectedCategory, setSelectedPostId, setShowDossier, setDossierSelectedResearcherId } = useAppRouter();
  
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter posts based on category, subcategory and search query (Exact logic from App.tsx)
  const filteredPosts = posts.filter(post => {
    const matchesCategory = taxonomy.matchesFilter(post.category, selectedCategory);

    // Check subcategory matches within Content/Summary if a subcategory is selected
    const matchesSubcategory = !selectedSubcategory ||
      post.title.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
      post.summary.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
      post.content.toLowerCase().includes(selectedSubcategory.toLowerCase());

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchLower) ||
      post.summary.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.author.toLowerCase().includes(searchLower) ||
      post.threatIntel?.threatActor?.toLowerCase().includes(searchLower) ||
      post.threatIntel?.malwareFamily?.toLowerCase().includes(searchLower) ||
      post.threatIntel?.cves?.some((c: string) => c.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  return (
    <motion.div
      key="catalog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 animate-fade-in"
    >

      {/* Dynamic Branding & Clean Welcome Hero (Purged edit artifacts) */}
      <div className="relative p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1321] overflow-hidden shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        {/* Visual subtle geometric background grids */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04] bg-grid" />

        <div className="space-y-3.5 relative max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans tracking-tight text-slate-900 dark:text-white leading-tight">
            {PORTAL_CONFIG.subtitle}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {PORTAL_CONFIG.description}
          </p>
        </div>

        {/* Micro metrics tracking dashboard info (Pure visual clinical numbers) */}
        <div className="grid grid-cols-2 gap-4 md:w-64 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs shrink-0 font-mono">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none mb-1">PUBLICATIONS</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{posts.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none mb-1">LATEST RELEASE</p>
            <p className="text-sm font-bold text-rose-500 mt-1">JULY 2026</p>
          </div>
        </div>

      </div>

      {/* Main Catalog layout - sleek horizontal top-level navigation */}
      <div className="space-y-6">

        {/* Category select buttons - optimized horizontal navigation */}
        <div className="bg-white dark:bg-[#0d1321] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-1 py-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
            <Layers size={13} className="text-rose-500" />
            <span>Security Repositories:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedSubcategory(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                selectedCategory === 'all' 
                  ? 'bg-rose-500 text-white font-semibold shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/50'
              }`}
            >
              <span>/* (ALL)</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {posts.length}
              </span>
            </button>

            {/* Level-1 Pillars Only */}
            {taxonomy.getVisibleChildren('security').map((pillar, idx) => {
              const isActive = selectedCategory === pillar.slug || (activeCategoryInfo?.parentSlug === pillar.slug);
              const count = posts.filter(p => taxonomy.matchesFilter(p.category, pillar.slug)).length;
              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedCategory(pillar.slug); setSelectedSubcategory(null); }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'bg-rose-500 text-white font-semibold shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/50'
                  }`}
                >
                  <span>/{pillar.slug}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Level-2 Subcategories index panel */}
        {(() => {
          // Determine subcategories to show: if pillar selected, show its children. If leaf selected, show sibling leaves. If 'all', show all leaves.
          const parentPillarSlug = activeCategoryInfo?.tier === 'pillar' 
            ? activeCategoryInfo.slug 
            : activeCategoryInfo?.parentSlug && activeCategoryInfo.parentSlug !== 'security' 
            ? activeCategoryInfo.parentSlug 
            : null;

          const subcategoriesToShow = parentPillarSlug 
            ? taxonomy.getVisibleChildren(parentPillarSlug) 
            : taxonomy.getVisibleChildren('security').flatMap(p => taxonomy.getVisibleChildren(p.slug));

          if (subcategoriesToShow.length === 0) return null;

          return (
            <div className="bg-white dark:bg-[#0d1321] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4 animate-fade-in">
              <div className="flex items-center gap-2 px-1 py-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                <Terminal size={13} className="text-rose-500" />
                <span>Subcategory Indices:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    if (parentPillarSlug) {
                      setSelectedCategory(parentPillarSlug);
                    } else {
                      setSelectedCategory('all');
                    }
                    setSelectedSubcategory(null);
                  }}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-colors ${
                    activeCategoryInfo?.tier === 'pillar' || selectedCategory === 'all'
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Show All {parentPillarSlug ? `(${parentPillarSlug.toUpperCase()})` : ''}
                </button>
                {subcategoriesToShow.map((sub, i) => {
                  const isSubActive = selectedCategory === sub.slug;
                  const count = posts.filter(p => taxonomy.matchesFilter(p.category, sub.slug)).length;
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedCategory(sub.slug); setSelectedSubcategory(null); }}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                        isSubActive
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span className="opacity-60 text-[9px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Main Content: Publications listings list */}
        <div className="space-y-6">
          {/* Search box filters */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search publications by title, CVE, MITRE attack tags, or threat actor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition-all outline-none focus:ring-1 focus:ring-rose-500 ${darkMode ? 'bg-[#0d1321] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
              />
            </div>

            <div className="flex items-center gap-4 self-stretch md:self-auto justify-end">
              <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                Index view: <span className="text-[#970000] dark:text-[#ff4b4b] font-bold">/{selectedCategory}/*</span>
              </div>
            </div>
          </div>

          {/* Current Active Category Heading Info */}
          {selectedCategory !== 'all' && activeCategoryInfo && (
            <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/20 dark:bg-rose-950/5 text-xs leading-relaxed space-y-1">
              <p className="font-mono font-bold uppercase text-[10px] text-rose-500">INDEXED DIRECTORY CONFIGURATION</p>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{activeCategoryInfo.label}</h4>
              <p className="text-slate-600 dark:text-slate-400 font-medium">{activeCategoryInfo.description}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="animate-spin text-rose-500" size={28} />
              <p className="text-xs font-mono font-semibold text-slate-400">LOADING_SECURE_COMPILER_DATABASES...</p>
            </div>
          ) : filteredPosts.length > 0 ? (

            /* Listings grid card loop */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`group rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md flex flex-col h-full ${darkMode ? 'bg-[#0d1321] border-slate-800/80 hover:border-slate-700/80' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                >
                  {post.bannerImage ? (
                    <div className="aspect-[21/9] w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                      <img src={resolveAssetUrl(post.bannerImage)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="aspect-[21/9] w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                      <ThemeBannerFallback
                        themeColor={post.themeColor}
                        category={post.category}
                        title={post.title}
                        isDark={darkMode}
                        className="h-full rounded-none"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-3">

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#970000] dark:text-[#ff4b4b] tracking-wider">
                            /{post.category}
                          </span>
                          {post.draft && (
                            <span className="text-[8px] font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/30 text-amber-500 px-1.5 py-0.5 rounded leading-none">
                              DRAFT
                            </span>
                          )}
                        </div>
                        {post.threatIntel?.severity && (
                          <span className={`text-[8px] px-2 py-0.5 font-mono font-bold uppercase border rounded-md ${post.threatIntel.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              post.threatIntel.severity === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                post.threatIntel.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                  'bg-slate-500/10 border-slate-500/20 text-slate-400'
                            }`}>
                            {post.threatIntel.severity}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors text-base leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans">
                        {post.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPostId(null);
                          setDossierSelectedResearcherId(getAuthorId(post.author));
                          setShowDossier(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="truncate max-w-[220px] hover:text-rose-500 hover:underline text-left transition-colors focus:outline-none font-bold"
                      >
                        {getAuthorDisplay(post.author, post)}
                      </button>
                      <span>{post.date}</span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl gap-2 px-4">
              <Search size={28} className="text-slate-400" />
              <h4 className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm font-mono break-all sm:break-normal">NO_MATCHING_PUBLICATION_NODES_FOUND</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Try modifying search keys or resetting selected categories/subcategories.
              </p>
            </div>
          )}

        </div>

      </div>

    </motion.div>
  );
}
