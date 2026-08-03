import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostDashboard } from '../../components/post/PostDashboard';

const mockPosts = [
  {
    id: 'post-1',
    slug: 'post-1',
    title: 'Test Malware Report',
    date: '2023-01-01',
    summary: 'A test report.',
    category: 'malware',
    content: 'This is the test malware report content.',
    contentUrl: '/test1.md',
    author: 'nayan',
    tags: ['malware', 'apt'],
    published: true,
    impactLevel: 4
  },
  {
    id: 'post-2',
    slug: 'post-2',
    title: 'Test Engineering Blog',
    date: '2023-01-02',
    summary: 'Another test report.',
    category: 'engineering',
    content: 'This is the test engineering content.',
    contentUrl: '/test2.md',
    author: 'mandar',
    tags: ['engineering'],
    published: true,
    impactLevel: 1
  }
];

const mockUseAppContext = vi.fn();
vi.mock('../../context/AppContext', () => ({
  useAppContext: () => mockUseAppContext()
}));

vi.mock('../../hooks/useAppRouter', () => ({
  useAppRouter: () => ({
    selectedCategory: 'all',
    setSelectedCategory: vi.fn(),
    setSelectedPostId: vi.fn(),
    setShowDossier: vi.fn(),
    setDossierSelectedResearcherId: vi.fn()
  })
}));

describe('PostDashboard', () => {
  beforeEach(() => {
    mockUseAppContext.mockReturnValue({
      darkMode: false,
      posts: mockPosts,
      loading: false
    });
  });

  it('renders posts correctly', () => {
    render(
      <PostDashboard 
        getAuthorDisplay={() => 'test author'}
        getAuthorId={() => 'test-author'}
      />
    );

    // Verify it renders the titles of the posts
    expect(screen.getAllByText('Test Malware Report').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Engineering Blog').length).toBeGreaterThan(0);
  });

  it('renders empty state if no posts', () => {
    mockUseAppContext.mockReturnValue({
      darkMode: false,
      posts: [],
      loading: false
    });

    render(
      <PostDashboard 
        getAuthorDisplay={() => 'test author'}
        getAuthorId={() => 'test-author'}
      />
    );

    expect(screen.getByText('NO_MATCHING_PUBLICATION_NODES_FOUND')).toBeInTheDocument();
  });

  it('filters posts by search query', () => {
    render(
      <PostDashboard 
        getAuthorDisplay={() => 'test author'}
        getAuthorId={() => 'test-author'}
      />
    );

    const input = screen.getByPlaceholderText(/Search publications by title/i);
    fireEvent.change(input, { target: { value: 'Malware Report' } });
    
    expect(screen.getAllByText('Test Malware Report').length).toBeGreaterThan(0);
    expect(screen.queryByText('Test Engineering Blog')).not.toBeInTheDocument();
  });
});
