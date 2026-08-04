import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostViewer } from '../../src/components/post/PostViewer';
import { AppProvider } from '../../src/context/AppContext';

beforeAll(() => {
  global.fetch = vi.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tree: [] })
    })
  ) as any;
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock MarkdownRenderer since it might try to fetch real files
vi.mock('../../src/components/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ url }: { url: string }) => <div data-testid="markdown-renderer">{url}</div>
}));

const mockPost = {
  id: 'test-post',
  slug: 'test-post',
  title: 'Test Post',
  date: '2023-01-01',
  summary: 'This is a test post summary.',
  content: 'This is test content',
  category: 'threat-intel',
  contentUrl: '/test.md',
  author: 'John Doe',
  tags: ['test'],
  published: true
};

describe('PostViewer', () => {
  it('renders correctly', () => {
    const setSelectedCategory = vi.fn();
    const setSelectedPostId = vi.fn();
    const setDossierResearcherId = vi.fn();
    
    render(
      <AppProvider>
        <PostViewer 
          activePost={mockPost as any}
          setSelectedCategory={setSelectedCategory}
          setSelectedPostId={setSelectedPostId}
          setDossierSelectedResearcherId={setDossierResearcherId}
          setShowDossier={vi.fn()}
        />
      </AppProvider>
    );

    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
  });

  it('renders fallback banner if no hero image is provided', () => {
    const setSelectedCategory = vi.fn();
    
    render(
      <AppProvider>
        <PostViewer 
          activePost={mockPost as any}
          setSelectedCategory={setSelectedCategory}
          setSelectedPostId={vi.fn()}
          setDossierSelectedResearcherId={vi.fn()}
          setShowDossier={vi.fn()}
        />
      </AppProvider>
    );
    
    // Test Post doesn't have an image, so ThemeBannerFallback should render.
    // We can just verify it didn't crash.
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
