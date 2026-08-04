import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from '../../src/components/layout/AppFooter';
import { AppProvider } from '../../src/context/AppContext';

describe('AppFooter', () => {
  it('renders correctly', () => {
    render(
      <AppProvider>
        <AppFooter />
      </AppProvider>
    );
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
