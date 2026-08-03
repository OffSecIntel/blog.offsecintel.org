import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useAppRouter } from '../../hooks/useAppRouter';
const { MOCK_POSTS } = vi.hoisted(() => ({
  MOCK_POSTS: [
    { id: '123', slug: '123' },
    { id: 'abc', slug: 'abc' }
  ]
}));

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    posts: MOCK_POSTS
  })
}));

describe('useAppRouter', () => {
  beforeEach(() => {
    window.location.hash = '';
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes state from URL hash', () => {
    window.location.hash = '#?post=123';
    const { result } = renderHook(() => useAppRouter());
    expect(result.current.selectedPostId).toBe('123');
    expect(result.current.selectedCategory).toBe('all');
  });

  it('initializes category from URL hash', () => {
    window.location.hash = '#/threat-intel';
    const { result } = renderHook(() => useAppRouter());
    expect(result.current.selectedCategory).toBe('threat-intel');
  });

  it('handles post selection and updates URL', () => {
    const { result } = renderHook(() => useAppRouter());
    
    act(() => {
      result.current.setSelectedPostId('abc');
    });

    expect(result.current.selectedPostId).toBe('abc');
    expect(window.location.hash).toBe('#?post=abc');
  });

  it('handles category selection and updates URL', () => {
    const { result } = renderHook(() => useAppRouter());
    
    act(() => {
      result.current.setSelectedCategory('threat-intel');
    });

    expect(result.current.selectedCategory).toBe('threat-intel');
    expect(window.location.hash).toBe('#/threat-intel');
  });

  it('handles dossier visibility', () => {
    const { result } = renderHook(() => useAppRouter());
    
    act(() => {
      result.current.setShowDossier(true);
      result.current.setDossierSelectedResearcherId('nayan');
    });

    expect(result.current.showDossier).toBe(true);
    expect(result.current.dossierSelectedResearcherId).toBe('nayan');
    expect(window.location.hash).toBe('#?author=nayan');
  });
});
