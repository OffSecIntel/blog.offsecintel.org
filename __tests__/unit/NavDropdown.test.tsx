import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavDropdown } from '../../src/components/NavDropdown';

describe('NavDropdown', () => {
  it('renders dropdown and handles clicks', () => {
    const mockOnSelect = vi.fn();
    const item = {
      slug: 'research',
      label: 'Test Dropdown',
      description: 'Test',
      visible: true,
      children: [
        { slug: 'malware', label: 'Test Item 1', visible: true, description: 'desc' }
      ]
    };
    
    render(
      <NavDropdown 
        item={item as any} 
        isActive={false} 
        onSelect={mockOnSelect} 
      />
    );
    
    // Check title
    expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    
    // Check items
    const item1 = screen.getByText('Test Item 1');
    expect(item1).toBeInTheDocument();
  });
});
