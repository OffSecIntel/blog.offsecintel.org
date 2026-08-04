import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImpactLevelRibbon } from '../../src/components/widgets/ImpactLevelRibbon';

describe('ImpactLevelRibbon', () => {
  it('renders critical impact correctly', () => {
    render(<ImpactLevelRibbon level="critical" />);
    expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
  });
  
  it('renders high impact correctly', () => {
    render(<ImpactLevelRibbon level="high" />);
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
  });

  it('renders medium impact correctly', () => {
    render(<ImpactLevelRibbon level="medium" />);
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
  });

  it('renders low impact correctly', () => {
    render(<ImpactLevelRibbon level="low" />);
    expect(screen.getByText(/LOW/i)).toBeInTheDocument();
  });
});
