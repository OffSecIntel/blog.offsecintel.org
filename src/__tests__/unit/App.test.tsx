import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OffSecIntelLogoIcon, TableOfContents, parseMarkdownPost, parseAuthorProfile } from '../../App';

describe('OffSecIntelLogoIcon', () => {
  it('renders the external logo image by default', () => {
    render(<OffSecIntelLogoIcon />);
    const imgElement = screen.getByAltText('OffSecIntel Logo');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', expect.stringContaining('drawing_NoText.svg'));
  });

  it('swaps to the OffSecIntelShieldSVG fallback on image error', () => {
    const { container } = render(<OffSecIntelLogoIcon />);
    const imgElement = screen.getByAltText('OffSecIntel Logo');
    
    // Simulate image load error
    fireEvent.error(imgElement);
    
    // The image should be removed from the DOM
    expect(screen.queryByAltText('OffSecIntel Logo')).not.toBeInTheDocument();
    
    // The fallback SVG should now be present (it has the OSI text)
    expect(screen.getByText('OSI')).toBeInTheDocument();
  });
});

describe('TableOfContents', () => {
  const mockContent = `
## Section 1
Some text
### Section 2
More text
  `;

  it('renders a static list of headings from content when not collapsible', () => {
    const mockThemeClasses = { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', ring: 'ring-rose-500' };
    render(
      <TableOfContents 
        content={mockContent} 
        themeClasses={mockThemeClasses}
        collapsible={false} 
      />
    );
    
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });
});

describe('parseMarkdownPost', () => {
  it('parses a complete markdown post with full frontmatter correctly (Positive)', () => {
    const markdown = `---
title: "Advanced Threat Hunting"
category: "security"
summary: 'A deep dive into APT29'
author: "Mandar"
authorSpecialties: "Threat Hunting, Reverse Engineering"
published: "true"
draft: "false"
layoutMode: "immersive"
threatIntel.threatActor: "APT29"
threatIntel.cves: "CVE-2023-1234, CVE-2024-5678"
threatIntel.confidenceScore: "95"
threatIntel.mitreAttack: "Execution | Command and Scripting Interpreter | T1059, Defense Evasion | Obfuscated Files | T1027"
threatIntel.iocs: "domain | malicious.com | C2, sha256 | abcdef | Payload"
---
# Main Content
Here is the text.`;

    const result = parseMarkdownPost('path/to/post.md', markdown);
    
    expect(result.title).toBe('Advanced Threat Hunting');
    expect(result.category).toBe('security');
    expect(result.summary).toBe('A deep dive into APT29');
    expect(result.author).toBe('Mandar');
    expect(result.authorSpecialties).toEqual(['Threat Hunting', 'Reverse Engineering']);
    expect(result.published).toBe(true);
    expect(result.draft).toBe(false);
    expect(result.layoutMode).toBe('immersive');
    expect(result.content).toBe('# Main Content\nHere is the text.');

    // Threat Intel Verification
    expect(result.threatIntel).toBeDefined();
    expect(result.threatIntel.threatActor).toBe('APT29');
    expect(result.threatIntel.cves).toEqual(['CVE-2023-1234', 'CVE-2024-5678']);
    expect(result.threatIntel.confidenceScore).toBe(95);
    
    // MITRE
    expect(result.threatIntel.mitreAttack.length).toBe(2);
    expect(result.threatIntel.mitreAttack[0].tactic).toBe('Execution');
    expect(result.threatIntel.mitreAttack[0].id).toBe('T1059');

    // IOCs
    expect(result.threatIntel.iocs.length).toBe(2);
    expect(result.threatIntel.iocs[0].type).toBe('domain');
    expect(result.threatIntel.iocs[0].value).toBe('malicious.com');
  });

  it('handles missing frontmatter and provides safe fallbacks (Negative)', () => {
    const markdown = `# Just a heading without frontmatter`;
    const result = parseMarkdownPost('untitled.md', markdown);

    expect(result.title).toBe('Untitled Post');
    expect(result.category).toBe('general');
    expect(result.author).toBe('Anonymous');
    expect(result.published).toBe(true); // Default true
    expect(result.draft).toBe(false);
    expect(result.slug).toBe('untitled');
    expect(result.threatIntel).toBeUndefined();
    expect(result.content).toBe('# Just a heading without frontmatter');
  });

  it('handles malformed threat intel arrays gracefully', () => {
    const markdown = `---
threatIntel.mitreAttack: "Incomplete"
threatIntel.iocs: "domain | malicious.com"
---
Content`;
    
    const result = parseMarkdownPost('malformed.md', markdown);
    expect(result.threatIntel).toBeDefined();
    expect(result.threatIntel.mitreAttack).toEqual([]); // Fails length >= 3 check
    expect(result.threatIntel.iocs).toEqual([]); // Fails length >= 3 check
  });
});

describe('parseAuthorProfile', () => {
  it('parses a complete author profile with frontmatter (Positive)', () => {
    const markdown = `---
name: "Sarah Jenkins"
alias: "sjenkins"
role: "Malware Analyst"
specialties: "Reversing, Rust, C++"
published: "true"
active: "true"
---
Sarah is a senior analyst.

She specializes in low-level languages.`;

    const result = parseAuthorProfile('sjenkins.md', markdown);
    
    expect(result.id).toBe('sjenkins');
    expect(result.name).toBe('Sarah Jenkins');
    expect(result.alias).toBe('sjenkins');
    expect(result.role).toBe('Malware Analyst');
    expect(result.specialties).toEqual(['Reversing', 'Rust', 'C++']);
    expect(result.published).toBe(true);
    expect(result.active).toBe(true);
    expect(result.bio).toBe('Sarah is a senior analyst.'); // Extracted first paragraph
    expect(result.content).toBe('Sarah is a senior analyst.\n\nShe specializes in low-level languages.');
  });

  it('provides safe fallbacks for missing author frontmatter (Negative)', () => {
    const markdown = `# Just content`;
    const result = parseAuthorProfile('unknown.md', markdown);

    expect(result.id).toBe('unknown');
    expect(result.name).toBe('Anonymous Contributor');
    expect(result.role).toBe('Contributing Researcher');
    expect(result.specialties).toEqual(['Threat Analysis']);
    expect(result.published).toBe(true);
    expect(result.active).toBe(true);
  });
});
