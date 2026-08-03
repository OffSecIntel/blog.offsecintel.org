import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppHeader } from '../../components/layout/AppHeader';
import { AppProvider } from '../../context/AppContext';

describe('AppHeader', () => {
  it('renders header components', () => {
    const setMenu = vi.fn();
    
    render(
      <AppProvider>
        <AppHeader 
          isMobileMenuOpen={false} 
          setIsMobileMenuOpen={setMenu} 
          readingProgress={50} 
        />
      </AppProvider>
    );

    expect(screen.getByText('Research')).toBeInTheDocument();
  });

  it('handles dark mode toggle', () => {
    const setMenu = vi.fn();
    
    render(
      <AppProvider>
        <AppHeader 
          isMobileMenuOpen={false} 
          setIsMobileMenuOpen={setMenu} 
          readingProgress={0} 
        />
      </AppProvider>
    );

    const darkModeBtn = screen.queryByTitle('Switch to Light Mode') || screen.getByTitle('Switch to Dark Mode');
    expect(darkModeBtn).toBeInTheDocument();
    
    fireEvent.click(darkModeBtn);
  });

  it('renders mobile menu button', () => {
    const setMenu = vi.fn();
    
    render(
      <AppProvider>
        <AppHeader 
          isMobileMenuOpen={false} 
          setIsMobileMenuOpen={setMenu} 
          readingProgress={0} 
        />
      </AppProvider>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
