import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

import { AppProvider, useAppContext } from './context/AppContext';
import { useAppRouter } from './hooks/useAppRouter';
import { taxonomy } from './services/taxonomy/instance';

import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { PostDashboard } from './components/post/PostDashboard';
import { PostViewer } from './components/post/PostViewer';
import { AuthorDossier } from './components/AuthorDossier';
import { getAuthorId, getAuthorDisplay } from './utils/helpers';

function AppInner() {
  const { darkMode, posts, authors } = useAppContext();
  const { 
    selectedPostId, 
    showDossier, 
    dossierSelectedResearcherId, 
    setDossierSelectedResearcherId,
    setShowDossier, 
    setSelectedPostId, 
    selectedCategory 
  } = useAppRouter();
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync scroll progress on post reader (only active when reading a post)
  useEffect(() => {
    if (!selectedPostId) return;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedPostId]);

  const activePost = posts.find(p => p.id === selectedPostId);
  const activeCategoryInfo = taxonomy.resolve(selectedCategory);

  const siteTitle = activePost ? `${activePost.title} | OffSecIntel` : 'OffSecIntel — Cyber Security Research & Threat Intelligence';
  const siteDesc = activePost?.summary || 'Technical publications by OffSecIntel covering vulnerability research, malware reverse engineering, detection engineering, exploit analysis, and cyber threat intelligence.';
  const siteImg = activePost?.bannerImage
    ? `https://blog.offsecintel.org${activePost.bannerImage.startsWith('/') ? '' : '/'}${activePost.bannerImage}`
    : 'https://blog.offsecintel.org/assets/og/offsecintel-og-default.png';
  const siteUrl = `https://blog.offsecintel.org/${activePost ? '?post=' + activePost.id : ''}`;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'bg-[#0b0f19] text-slate-200 selection:bg-rose-500/20' : 'bg-[#f8fafc] text-slate-700 selection:bg-rose-500/10'}`}>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDesc} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDesc} />
        <meta property="og:image" content={siteImg} />
        <meta property="og:url" content={siteUrl} />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDesc} />
        <meta name="twitter:image" content={siteImg} />
      </Helmet>

      <AppHeader isHeaderVisible={isHeaderVisible} scrollProgress={scrollProgress} activePost={activePost} />

      <main className="max-w-[1680px] mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {showDossier ? (
            <motion.div
              key="dossier"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <AuthorDossier
                posts={posts}
                authors={authors}
                initialSelectedResearcher={dossierSelectedResearcherId}
                isDark={darkMode}
                onSelectPost={(id) => {
                  setSelectedPostId(id);
                  setShowDossier(false);
                }}
                onSelectResearcher={(id) => {
                  setDossierSelectedResearcherId(id);
                }}
                onClose={() => setShowDossier(false)}
              />
            </motion.div>
          ) : selectedPostId && activePost ? (
            <PostViewer 
              activePost={activePost} 
              setToastMessage={setToastMessage} 
              actionMenuOpen={actionMenuOpen} 
              setActionMenuOpen={setActionMenuOpen}
            />
          ) : (
            <PostDashboard 
              activeCategoryInfo={activeCategoryInfo}
              getAuthorId={getAuthorId}
              getAuthorDisplay={getAuthorDisplay}
            />
          )}
        </AnimatePresence>
      </main>

      <AppFooter />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 z-50 right-6 max-lg:right-1/2 max-lg:translate-x-1/2"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium shadow-2xl border border-slate-700">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
