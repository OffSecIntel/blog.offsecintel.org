import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThreatIntelPanel } from '../../components/ThreatIntelPanel';
import { ThreatIntel } from '../../types';

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ThreatIntelPanel Component', () => {
  const mockIntel: ThreatIntel = {
    threatActor: 'APT29',
    malwareFamily: 'CozyCar',
    severity: 'critical',
    confidenceScore: 95,
    cves: ['CVE-2023-12345'],
    mitreAttack: [
      {
        tactic: 'Execution',
        id: 'T1059',
        technique: 'Command and Scripting Interpreter'
      }
    ],
    iocs: [
      {
        type: 'domain',
        value: 'malicious-c2.com',
        description: 'C2 Domain'
      },
      {
        type: 'sha256',
        value: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      }
    ]
  };

  it('renders overview stats correctly', () => {
    render(<ThreatIntelPanel intel={mockIntel} />);

    expect(screen.getByText('APT29')).toBeInTheDocument();
    expect(screen.getByText('CozyCar')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders CVE references', () => {
    render(<ThreatIntelPanel intel={mockIntel} />);
    expect(screen.getByText('CVE-2023-12345')).toBeInTheDocument();
    expect(screen.getByText('CVE-2023-12345').closest('a')).toHaveAttribute('href', 'https://nvd.nist.gov/vuln/detail/CVE-2023-12345');
  });

  it('renders MITRE ATT&CK techniques', () => {
    render(<ThreatIntelPanel intel={mockIntel} />);
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('T1059')).toBeInTheDocument();
    expect(screen.getByText('Command and Scripting Interpreter')).toBeInTheDocument();
  });

  it('renders IoCs and supports copying to clipboard', async () => {
    render(<ThreatIntelPanel intel={mockIntel} />);

    // Verify IOCs
    expect(screen.getByText('domain')).toBeInTheDocument();
    expect(screen.getByText('malicious-c2.com')).toBeInTheDocument();
    expect(screen.getByText('C2 Domain')).toBeInTheDocument();

    expect(screen.getByText('sha256')).toBeInTheDocument();
    expect(screen.getByText('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890')).toBeInTheDocument();

    // Find copy buttons
    const copyButtons = screen.getAllByRole('button');
    expect(copyButtons.length).toBe(2);

    // Click first copy button
    fireEvent.click(copyButtons[0]);

    // Verify clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('malicious-c2.com');

    // Verify button changed state to COPIED
    expect(screen.getByText('COPIED')).toBeInTheDocument();

    // Verify it reverts after 2 seconds (using fast forward timers is better but waitFor works too)
    await waitFor(() => {
      expect(screen.queryByText('COPIED')).not.toBeInTheDocument();
    }, { timeout: 2500 });
  });

  it('handles empty intel properties gracefully', () => {
    const emptyIntel: ThreatIntel = {};
    render(<ThreatIntelPanel intel={emptyIntel} />);
    
    // Ensure it renders without crashing
    expect(screen.queryByText('Threat Actor')).not.toBeInTheDocument();
    expect(screen.queryByText('Vulnerability References')).not.toBeInTheDocument();
    expect(screen.queryByText('MITRE ATT&CK® Techniques')).not.toBeInTheDocument();
    expect(screen.queryByText('Indicators of Compromise (IoCs)')).not.toBeInTheDocument();
  });
});
