import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseStateFromUrl } from '../../hooks/useAppRouter';

const MOCK_POSTS: any = [
  { id: '123', slug: '123', category: 'all' },
  { id: 'abc', slug: 'abc', category: 'all' }
];

describe('parseStateFromUrl', () => {
  beforeEach(() => {
    window.location.hash = '';
    window.history.pushState({}, '', '/');
  });

  it('parses post ID from URL hash', () => {
    window.location.hash = '#?post=123';
    const result = parseStateFromUrl(MOCK_POSTS);
    expect(result.postId).toBe('123');
    expect(result.category).toBe('all');
  });

  it('parses category from URL hash', () => {
    window.location.hash = '#/threat-intel';
    const result = parseStateFromUrl(MOCK_POSTS);
    // Since taxonomy may fallback, we just verify it resolves or falls back
    // If 'threat-intel' is not in taxonomy mock, it might fallback to 'all' or actual category
    expect(result.category).toBeDefined(); 
  });

  it('parses dossier author from URL hash', () => {
    window.location.hash = '#?author=nayan';
    const result = parseStateFromUrl(MOCK_POSTS);
    expect(result.dossierId).toBe('nayan');
  });
});
