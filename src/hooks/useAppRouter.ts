import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import { taxonomy } from '../services/taxonomy/instance';
import { useAppContext } from '../context/AppContext';

function parseStateFromUrl(posts: BlogPost[]): { category: string, postId: string | null, dossierId: string | null } {
  const hash = window.location.hash;
  let category = 'all';

  if (hash) {
    const hashClean = hash.replace(/^#\/?/, '').split('?')[0];
    const resolved = taxonomy.resolveFromUrlPath(hashClean);
    if (resolved) category = resolved.slug;
  }

  if (category === 'all') {
    const pathClean = window.location.pathname;
    const resolved = taxonomy.resolveFromUrlPath(pathClean);
    if (resolved) category = resolved.slug;
  }

  const searchStr = window.location.search || (hash.includes('?') ? '?' + hash.split('?')[1] : '');
  const params = new URLSearchParams(searchStr);
  if (category === 'all') {
    const catParam = params.get('category');
    if (catParam) {
      const canonical = taxonomy.canonicalize(catParam);
      if (canonical) category = canonical;
    }
  }

  let postId: string | null = null;
  const postSlug = params.get('post') || params.get('p');
  if (postSlug && posts.length > 0) {
    const match = posts.find(p => p.slug === postSlug || p.id === postSlug);
    if (match) {
      postId = match.id;
    }
  }

  let dossierId: string | null = null;
  const dossierSlug = params.get('dossier') || params.get('author') || params.get('researcher');
  if (dossierSlug) {
    dossierId = dossierSlug;
  }

  return { category, postId, dossierId };
}

export function useAppRouter() {
  const { posts } = useAppContext();
  
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    // Initial sync will happen in useEffect once posts are loaded, 
    // but we can do a quick check here without checking posts.
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
    // Prevent overriding URL on initial load if sync hasn't happened yet
    if (posts.length === 0) return;

    let searchParams = new URLSearchParams();
    if (selectedPostId) {
      searchParams.set('post', selectedPostId);
    }
    if (showDossier && dossierSelectedResearcherId) {
      searchParams.set('author', dossierSelectedResearcherId);
    }
    
    let hashPath = '';
    if (selectedCategory && selectedCategory !== 'all') {
      hashPath = `/${selectedCategory}`;
    }

    const searchStr = searchParams.toString();
    const newHash = `${hashPath}${searchStr ? '?' + searchStr : ''}`;
    const targetHash = newHash ? `#${newHash}` : '';
    
    // Only push state if it's actually different to avoid looping
    if (window.location.hash !== targetHash) {
      if (!targetHash) {
        // Clear hash completely
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      } else {
        window.history.pushState(null, '', targetHash);
      }
    }
  }, [selectedPostId, selectedCategory, showDossier, dossierSelectedResearcherId, posts]);

  return {
    selectedCategory, setSelectedCategory,
    selectedPostId, setSelectedPostId,
    showDossier, setShowDossier,
    dossierSelectedResearcherId, setDossierSelectedResearcherId
  };
}
