import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlogPost, AuthorProfile } from '../types';
import { loadStaticMarkdownPosts, loadStaticAuthorProfiles } from '../utils/parsers';
import { PORTAL_CONFIG } from '../config';

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
      isMobileDrawerOpen, setIsMobileDrawerOpen
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
