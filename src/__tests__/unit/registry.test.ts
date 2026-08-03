import { describe, it, expect } from 'vitest';
import { TaxonomyRegistry } from '../../services/taxonomy/registry';
import { TaxonomyNode } from '../../services/taxonomy/types';

describe('TaxonomyRegistry', () => {
  const mockNodes: TaxonomyNode[] = [
    {
      slug: 'security',
      name: 'Security',
      tier: 'domain',
      visible: true,
      aliases: [],
    },
    {
      slug: 'research',
      name: 'Research',
      tier: 'pillar',
      parentSlug: 'security',
      visible: true,
      aliases: ['labs'],
    },
    {
      slug: 'malware-re',
      name: 'Malware RE',
      tier: 'leaf',
      parentSlug: 'research',
      visible: true,
      aliases: ['malware', 'reverse-engineering'],
    },
    {
      slug: 'hidden-leaf',
      name: 'Hidden Leaf',
      tier: 'leaf',
      parentSlug: 'research',
      visible: false,
      aliases: [],
    }
  ];

  const registry = new TaxonomyRegistry(mockNodes);

  describe('resolveFromUrlPath', () => {
    it('resolves a clean leaf path to its node', () => {
      const node = registry.resolveFromUrlPath('/research/malware-re');
      expect(node).not.toBeNull();
      expect(node?.slug).toBe('malware-re');
    });

    it('resolves using an alias in the path', () => {
      // 'reverse-engineering' is an alias for 'malware-re'
      const node = registry.resolveFromUrlPath('reverse-engineering');
      expect(node).not.toBeNull();
      expect(node?.slug).toBe('malware-re');
    });

    it('ignores leading, trailing slashes, and hash symbols', () => {
      const node = registry.resolveFromUrlPath('#/research/labs/');
      expect(node).not.toBeNull();
      expect(node?.slug).toBe('research'); // 'labs' is alias for research
    });

    it('returns null for invalid paths', () => {
      const node = registry.resolveFromUrlPath('/invalid-path/');
      expect(node).toBeNull();
    });
  });

  describe('matchesFilter', () => {
    it('returns true when filter is "all"', () => {
      expect(registry.matchesFilter('malware-re', 'all')).toBe(true);
    });

    it('returns true for an exact slug match', () => {
      expect(registry.matchesFilter('malware-re', 'malware-re')).toBe(true);
    });

    it('returns true when post category is a descendant of filter slug', () => {
      // malware-re is a child of research
      expect(registry.matchesFilter('malware-re', 'research')).toBe(true);
      // malware-re is a grandchild of security
      expect(registry.matchesFilter('malware-re', 'security')).toBe(true);
    });

    it('returns false when post category is not a descendant of filter slug', () => {
      // research is not a descendant of malware-re
      expect(registry.matchesFilter('research', 'malware-re')).toBe(false);
    });

    it('handles unresolved aliases gracefully', () => {
      expect(registry.matchesFilter('unknown-post', 'unknown-filter')).toBe(false);
      expect(registry.matchesFilter('unknown-post', 'unknown-post')).toBe(true); // fallback to exact string match
    });
  });

  describe('getAncestry', () => {
    it('returns complete ancestry for a leaf node', () => {
      const ancestry = registry.getAncestry('malware-re');
      expect(ancestry.map(n => n.slug)).toEqual(['security', 'research', 'malware-re']);
    });
  });

  describe('getAllLeafSlugs', () => {
    it('collects all leaf slugs under a pillar', () => {
      const leaves = registry.getAllLeafSlugs('research');
      expect(leaves).toContain('malware-re');
      expect(leaves).toContain('hidden-leaf');
      expect(leaves.length).toBe(2);
    });
  });
});
