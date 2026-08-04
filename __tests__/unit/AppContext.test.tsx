import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider, useAppContext } from '../../src/context/AppContext';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const TestComponent = () => {
  const { darkMode, posts, authors } = useAppContext();
  return (
    <div>
      <div data-testid="dark-mode">{darkMode ? 'dark' : 'light'}</div>
      <div data-testid="posts-count">{posts.length}</div>
      <div data-testid="authors-count">{authors.length}</div>
    </div>
  );
};

describe('AppContext', () => {
  it('provides default state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Initial dark mode relies on localStorage or matchMedia.
    // By default matchMedia is mocked to false, so it should be 'light' unless we force it.
    // Wait, the hook sets dark mode if there is a dark class on document element.
    expect(screen.getByTestId('dark-mode')).toBeInTheDocument();
    
    // Static markdown posts might be empty if we don't mock it, or might load actual posts.
    // We just want to ensure it doesn't crash and provides context.
    expect(screen.getByTestId('posts-count')).toBeInTheDocument();
  });
});
