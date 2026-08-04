import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import { taxonomy } from '../services/taxonomy/instance';
import { useAppContext } from '../context/AppContext';


export function parseStateFromUrl(posts: BlogPost[]): { category: string, postId: string | null, dossierId: string | null } {
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
      category = match.category;
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
  return useAppContext();
}
