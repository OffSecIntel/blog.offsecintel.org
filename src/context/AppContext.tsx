import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { BlogPost, AuthorProfile } from '../types';
import { loadStaticMarkdownPosts, loadStaticAuthorProfiles } from '../utils/parsers';
import { PORTAL_CONFIG } from '../config';
import { taxonomy } from '../services/taxonomy/instance';
import { parseStateFromUrl } from '../hooks/useAppRouter';

interface AppContextType {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  posts: BlogPost[];
  authors: AuthorProfile[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedPostId: string | null;
  setSelectedPostId: React.Dispatch<React.SetStateAction<string | null>>;
  showDossier: boolean;
  setShowDossier: React.Dispatch<React.SetStateAction<boolean>>;
  dossierSelectedResearcherId: string | null;
  setDossierSelectedResearcherId: React.Dispatch<React.SetStateAction<string | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return PORTAL_CONFIG.defaultTheme === 'dark';
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Router State
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash) {
      const hashClean = hash.replace(/^#\/?/, '').split('?')[0];
      const resolved = taxonomy.resolveFromUrlPath(hashClean);
      if (resolved) return resolved.slug;
    }
    const pathClean = window.location.pathname;
    const resolved = taxonomy.resolveFromUrlPath(pathClean);
    if (resolved) return resolved.slug;
    return 'all';
  });
  
  const [showDossier, setShowDossier] = useState<boolean>(false);
  const [dossierSelectedResearcherId, setDossierSelectedResearcherId] = useState<string | null>(null);

  // Sync state from URL
  const syncFromUrl = useCallback(() => {
    if (posts.length === 0) return;
    const { category, postId, dossierId } = parseStateFromUrl(posts);
    
    setSelectedCategory(category);
    setSelectedPostId(postId);
    
    if (dossierId) {
      setShowDossier(true);
      setDossierSelectedResearcherId(dossierId);
    } else {
      setShowDossier(false);
      setDossierSelectedResearcherId(null);
    }
  }, [posts]);

  // Initial load and when posts are loaded
  useEffect(() => {
    syncFromUrl();
  }, [posts, syncFromUrl]);

  // Browser navigation events
  useEffect(() => {
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, [syncFromUrl]);

  // Update URL when state changes
  useEffect(() => {
    if (posts.length === 0) return;

    let searchParams = new URLSearchParams();
    if (selectedPostId) {
      const activePost = posts.find(p => p.id === selectedPostId);
      searchParams.set('post', activePost?.slug || selectedPostId);
    }
    if (showDossier && dossierSelectedResearcherId) {
      searchParams.set('author', dossierSelectedResearcherId);
    }
    
    let hashPath = '';
    // Keep URLs constant: omit category path if viewing a post or dossier
    if (selectedCategory && selectedCategory !== 'all' && !selectedPostId && !showDossier) {
      hashPath = `/${selectedCategory}`;
    }

    const searchStr = searchParams.toString();
    const newHash = `${hashPath}${searchStr ? '?' + searchStr : ''}`;
    const targetHash = newHash ? `#${newHash}` : '';
    
    if (window.location.hash !== targetHash) {
      if (!targetHash) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      } else {
        window.history.pushState(null, '', targetHash);
      }
    }
  }, [selectedPostId, selectedCategory, showDossier, dossierSelectedResearcherId, posts]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    setLoading(true);
    try {
      const initialList = loadStaticMarkdownPosts();
      setPosts(initialList);
      const initialAuthors = loadStaticAuthorProfiles();
      setAuthors(initialAuthors);
    } catch (err: any) {
      console.error("Error loading static markdown posts.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode,
      posts, authors, loading,
      searchQuery, setSearchQuery,
      menuOpen, setMenuOpen,
      isMobileDrawerOpen, setIsMobileDrawerOpen,
      selectedCategory, setSelectedCategory,
      selectedPostId, setSelectedPostId,
      showDossier, setShowDossier,
      dossierSelectedResearcherId, setDossierSelectedResearcherId
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
