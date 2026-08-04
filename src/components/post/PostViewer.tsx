import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, ListOrdered, AlignLeft, Copy, Shield, AlertTriangle, User, Calendar, Clock } from 'lucide-react';
import { BlogPost } from '../../types';
import { PORTAL_CONFIG, COLLECTIONS_CONFIG } from '../../config';
import { taxonomy } from '../../services/taxonomy/instance';
import { useAppContext } from '../../context/AppContext';
import { useAppRouter } from '../../hooks/useAppRouter';
import { resolveAssetUrl, getAuthorId } from '../../utils/helpers';
import { getThemeColorClasses } from '../../theme';
import { ThemeBannerFallback } from '../../components/ThemeBannerFallback';
import { CollectionSidebar } from '../../components/CollectionSidebar';
import { TableOfContents } from './TableOfContents';
import { TacticalPageNavigator } from './TacticalPageNavigator';
import { RecentIntelWidget } from '../widgets/RecentIntelWidget';
import { ArticleIntegrityWidget } from '../widgets/ArticleIntegrityWidget';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import { ThreatIntelPanel } from '../../components/ThreatIntelPanel';
import { ArticleAssetsWidget } from '../../components/ArticleAssetsWidget';
import { FeedbackWidget } from '../widgets/FeedbackWidget';

export function PostViewer({ activePost, setToastMessage, actionMenuOpen, setActionMenuOpen }: any) {
  const { darkMode, posts } = useAppContext();
  const { setSelectedPostId, setDossierSelectedResearcherId, setShowDossier, setIsMobileDrawerOpen } = useAppRouter();
  const [activePostPageIndex, setActivePostPageIndex] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const layout = activePost.layoutMode || 'high-density';
  const themeClasses = getThemeColorClasses(activePost.themeColor, darkMode);
  const isDark = darkMode;

  const postPages = activePost.content.split('<!-- pagebreak -->').map((p: string) => p.trim());
  const totalPages = postPages.length;
  const currentPageContent = totalPages > 1 ? postPages[activePostPageIndex] : activePost.content;

  const layoutContent = (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

      {/* 1. Left Navigation Sidebar (Hidden on mobile) */}
      <div className={`hidden lg:flex shrink-0 flex-col sticky top-24 space-y-4 transition-all duration-300 ${isSidebarCollapsed ? 'w-10' : 'w-64'}`}>
        <button
          onClick={() => setSelectedPostId(null)}
          className={`flex items-center gap-2 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group mb-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title="Return"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {!isSidebarCollapsed && <span>RETURN</span>}
        </button>
        {activePost.collection && COLLECTIONS_CONFIG.find(c => c.slug === activePost.collection) && (
          <CollectionSidebar 
            collection={COLLECTIONS_CONFIG.find(c => c.slug === activePost.collection)!} 
            currentPostSlug={activePost.slug} 
            onSelectPostBySlug={(slug) => {
              const matched = posts.find(p => p.slug === slug);
              if (matched) setSelectedPostId(matched.id);
            }} 
            isDark={darkMode} 
            posts={posts} 
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
          />
        )}
      </div>

      {/* 2. Primary Content Document Wrapper */}
      <div className="flex-1 min-w-0 w-full space-y-6">

        {/* Navigation Path Breadcrumb with Contextual Three-Dots Action Menu (...) */}
        <div className="flex justify-between items-center relative sticky top-0 lg:relative lg:top-auto z-30 pt-3 lg:pt-0 -mt-3 lg:mt-0">
          <button
            onClick={() => setSelectedPostId(null)}
            className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white group truncate max-w-[75%]"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform shrink-0 lg:hidden" />
            <span className="truncate">
              Publications / {taxonomy.resolve(activePost.category)?.label || activePost.category}
            </span>
          </button>

          {/* Contextual Mobile Action Menu (...) */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setActionMenuOpen(!actionMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
              title="More options"
            >
              <MoreVertical size={16} />
            </button>

            {actionMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 z-50 bg-white dark:bg-[#0d1321] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-1 text-xs font-sans">
                  {PORTAL_CONFIG.enableCollections && activePost.collection && (
                    <button
                      onClick={() => {
                        setActionMenuOpen(false);
                        setIsMobileDrawerOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium transition-colors"
                    >
                      <ListOrdered size={15} className="text-rose-500 shrink-0" />
                      <span>Table of contents</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActionMenuOpen(false);
                      setTimeout(() => {
                        let targetEl = document.getElementById('in-this-article-mobile')
                                    || document.getElementById('in-this-article-desktop')
                                    || document.getElementById('in-this-article-section');
                        if (!targetEl) {
                          targetEl = document.querySelector('article h2, main h2, article h1, main h1');
                        }
                        if (targetEl) {
                          const y = targetEl.getBoundingClientRect().top + window.scrollY - 70;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }, 50);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium transition-colors"
                  >
                    <AlignLeft size={15} className="text-cyan-400 shrink-0" />
                    <span>In this article</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionMenuOpen(false);
                      navigator.clipboard.writeText(window.location.href);
                      setToastMessage('Link copied to clipboard');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium transition-colors border-t border-slate-100 dark:border-slate-800/60 pt-2"
                  >
                    <Copy size={15} className="text-slate-400 shrink-0" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hero Section & Title */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight font-sans tracking-tight">
            {activePost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono font-bold text-slate-500 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <User size={13} className="text-slate-400" />
              <span>By <button
                onClick={() => {
                  setSelectedPostId(null);
                  setDossierSelectedResearcherId(getAuthorId(activePost.author));
                  setShowDossier(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 font-bold transition-colors underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4"
              >
                {activePost.author} {activePost.authorAlias ? `(${activePost.authorAlias})` : ''}
              </button></span>
              {activePost.reviewer && (
                <span className="ml-1">(Reviewed by: {activePost.reviewer})</span>
              )}
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>{activePost.date}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              <span>{activePost.readTime}</span>
            </div>
          </div>
        </div>

        {/* Feature / Banner Image */}
        {activePost.showBanner && (
          activePost.bannerImage ? (
            <div className="rounded-xl overflow-hidden aspect-[21/9] border border-slate-200 dark:border-slate-800 relative">
              <img src={resolveAssetUrl(activePost.bannerImage)} alt={activePost.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden aspect-[21/9] border border-slate-200 dark:border-slate-800 relative">
              <ThemeBannerFallback
                themeColor={activePost.themeColor}
                category={activePost.category}
                title={activePost.title}
                isDark={darkMode}
                className="h-full rounded-xl"
              />
            </div>
          )
        )}

        {/* Abstract / Summary */}
        {activePost.summary && activePost.showAbstract !== false && (
          <div className="bg-slate-100/50 dark:bg-slate-950/20 rounded-xl p-4.5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Abstract / Executive Summary</h3>
            <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed text-xs md:text-sm">
              "{activePost.summary}"
            </p>
          </div>
        )}

        {/* Mobile "In this article" outline */}
        {activePost.showToc && (
          <div className="lg:hidden">
            <TableOfContents
              id="in-this-article-mobile"
              collapsible
              content={activePost.content}
              themeClasses={themeClasses}
              postPages={postPages}
              currentPageIndex={activePostPageIndex}
              onPageChange={setActivePostPageIndex}
            />
          </div>
        )}

        {/* Markdown Report Body */}
        <div className="py-2 bg-white dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3 md:p-5 shadow-inner">
          <MarkdownRenderer content={currentPageContent} themeColor={activePost.themeColor} isDark={darkMode} />
          <TacticalPageNavigator currentPage={activePostPageIndex} totalPages={totalPages} onPageChange={setActivePostPageIndex} />
        </div>
      </div>

      {/* 3. Right Table of Contents & Parameters */}
      <div className="hidden lg:block w-72 shrink-0 sticky top-24 space-y-6">
        {activePost.showToc && (
          <TableOfContents
            id="in-this-article-desktop"
            collapsible
            content={activePost.content}
            themeClasses={themeClasses}
            postPages={postPages}
            currentPageIndex={activePostPageIndex}
            onPageChange={setActivePostPageIndex}
          />
        )}
        
        <FeedbackWidget />
        <ArticleAssetsWidget
                postSlug={activePost.slug}
                themeColor={activePost.themeColor || "crimson"}
                isDark={darkMode}
                hiddenAssets={activePost.hiddenAssets}
                containsLiveMalware={activePost.containsLiveMalware}
              />
        <div className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121826] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield size={16} className={themeClasses.text} />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Security Parameters</h3>
          </div>
          {activePost.threatIntel ? (
            <ThreatIntelPanel intel={activePost.threatIntel} isSidebar={true} />
          ) : (
            <div className="py-6 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
              NO_VULN_DATA_DECLARED
            </div>
          )}
        </div>

        <RecentIntelWidget currentPostId={activePost.id} posts={posts} themeClasses={themeClasses} onSelectPost={setSelectedPostId} />
        <ArticleIntegrityWidget content={activePost.content} />
      </div>
    </div>
  );

  return (
    <motion.div
      key="reader"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 relative"
    >
      {activePost.draft && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 font-mono text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold uppercase">PREVIEW_MODE: LOCAL_RESEARCH_DRAFT</p>
            <p className="opacity-90 leading-normal mt-1 font-sans">
              This publication is flagged as a draft. It is excluded from the public directory listing unless the "Show Drafts" toggle is explicitly enabled. Set <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded text-amber-700 dark:text-amber-300">published: true</code> or remove <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded text-amber-700 dark:text-amber-300">draft: true</code> in the frontmatter of this document to mark it as published.
            </p>
          </div>
        </div>
      )}

      {/* Frosted Glass ambient glows */}
      {layout === 'frosted-glass' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div
            className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-10 dark:opacity-10 blur-[120px] transition-colors duration-500"
            style={{ backgroundColor: themeClasses.accentHex }}
          />
          <div
            className="absolute top-1/2 right-10 w-80 h-80 rounded-full opacity-5 dark:opacity-[0.05] blur-[100px] transition-colors duration-500"
            style={{ backgroundColor: themeClasses.accentHex }}
          />
        </div>
      )}

      {layoutContent}
    </motion.div>
  );
}
