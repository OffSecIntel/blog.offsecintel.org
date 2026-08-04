import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthorDossier } from '../../src/components/AuthorDossier';
import { BlogPost, AuthorProfile } from '../../src/types';

describe('AuthorDossier Component', () => {
  const mockAuthors: AuthorProfile[] = [
    {
      id: 'nayan',
      name: 'Nayan',
      alias: 'nayan',
      role: 'Lead',
      bio: 'Test bio',
      specialties: ['Security'],
      content: '',
      active: true,
      published: true
    },
    {
      id: 'hidden',
      name: 'Hidden',
      role: 'Ghost',
      bio: '',
      specialties: [],
      content: '',
      active: false,
      published: false
    }
  ];

  const mockPosts: BlogPost[] = [
    {
      id: 'post-1',
      slug: 'first-post',
      title: 'First Post',
      summary: 'Summary 1',
      date: '2026-08-01',
      author: 'Nayan',
      category: 'security',
      readTime: '5 min',
      content: '',
      published: true
    },
    {
      id: 'post-2',
      slug: 'unregistered-post',
      title: 'Unregistered Post',
      summary: 'Summary 2',
      date: '2026-08-02',
      author: 'Dynamic User',
      category: 'malwarere',
      readTime: '10 min',
      content: '',
      published: true
    }
  ];

  it('renders registered visible authors and dynamically generated authors', () => {
    const handleClose = vi.fn();
    const handleSelectPost = vi.fn();

    render(
      <AuthorDossier 
        posts={mockPosts} 
        authors={mockAuthors} 
        onSelectPost={handleSelectPost} 
        onClose={handleClose} 
      />
    );

    // Should render Nayan (registered)
    expect(screen.getAllByText('Nayan').length).toBeGreaterThan(0);
    
    // Should NOT render Hidden (active: false)
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    
    // Should render Dynamic User (dynamically discovered from post-2)
    expect(screen.getAllByText('Dynamic User').length).toBeGreaterThan(0);
  });

  it('displays authored posts when selecting an author', () => {
    const handleClose = vi.fn();
    const handleSelectPost = vi.fn();

    render(
      <AuthorDossier 
        posts={mockPosts} 
        authors={mockAuthors} 
        onSelectPost={handleSelectPost} 
        onClose={handleClose} 
      />
    );

    // Nayan is selected by default based on code logic for 'nayan' ID fallback
    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.queryByText('Unregistered Post')).not.toBeInTheDocument();

    // Click Dynamic User
    fireEvent.click(screen.getAllByText('Dynamic User')[0]);
    
    // Now it should show Unregistered Post
    expect(screen.getByText('Unregistered Post')).toBeInTheDocument();
  });

  it('calls onClose when Back to Articles is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <AuthorDossier 
        posts={[]} 
        authors={mockAuthors} 
        onSelectPost={vi.fn()} 
        onClose={handleClose} 
      />
    );

    fireEvent.click(screen.getByText('Back to Articles'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
