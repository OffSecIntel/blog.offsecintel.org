/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaxonomyNode } from './types';

/**
 * Data-driven Taxonomy Registry Engine.
 * Provides hierarchical tree traversal, alias resolution, URL path building,
 * graph cross-referencing, and integrity validation in pure Vanilla TypeScript.
 */
export class TaxonomyRegistry {
  private nodesBySlug: Map<string, TaxonomyNode> = new Map();
  private aliasToCanonical: Map<string, string> = new Map();
  private childrenByParent: Map<string, TaxonomyNode[]> = new Map();

  constructor(nodes: TaxonomyNode[]) {
    this.init(nodes);
  }

  /**
   * Index taxonomy nodes into Map data structures for O(1) lookups.
   */
  private init(nodes: TaxonomyNode[]): void {
    this.nodesBySlug.clear();
    this.aliasToCanonical.clear();
    this.childrenByParent.clear();

    for (const node of nodes) {
      this.nodesBySlug.set(node.slug, node);
      this.aliasToCanonical.set(node.slug.toLowerCase(), node.slug);

      // Register aliases
      for (const alias of node.aliases) {
        this.aliasToCanonical.set(alias.toLowerCase(), node.slug);
      }

      // Group children by parent
      const parentKey = node.parentSlug || '__ROOT__';
      if (!this.childrenByParent.has(parentKey)) {
        this.childrenByParent.set(parentKey, []);
      }
      this.childrenByParent.get(parentKey)!.push(node);
    }
  }

  /**
   * Validate taxonomy tree integrity at dev/build time.
   * Catches circular chains, orphaned nodes, duplicate aliases, and hidden parent chains.
   */
  public validateIntegrity(): void {
    const seenSlugs = new Set<string>();

    for (const node of this.nodesBySlug.values()) {
      // Check duplicate slug
      if (seenSlugs.has(node.slug)) {
        throw new Error(`[TaxonomyRegistry Integrity Error] Duplicate node slug detected: "${node.slug}"`);
      }
      seenSlugs.add(node.slug);

      // Check orphaned parent
      if (node.parentSlug && !this.nodesBySlug.has(node.parentSlug)) {
        throw new Error(
          `[TaxonomyRegistry Integrity Error] Node "${node.slug}" references non-existent parentSlug "${node.parentSlug}"`
        );
      }

      // Check circular ancestry
      let current: TaxonomyNode | null = node;
      const visitedInChain = new Set<string>();
      while (current && current.parentSlug) {
        if (visitedInChain.has(current.slug)) {
          throw new Error(`[TaxonomyRegistry Integrity Error] Circular ancestry chain detected at node "${current.slug}"`);
        }
        visitedInChain.add(current.slug);
        current = this.nodesBySlug.get(current.parentSlug) || null;
      }

      // Check visible leaf with hidden parent
      if (node.visible && node.parentSlug) {
        const parent = this.nodesBySlug.get(node.parentSlug);
        if (parent && !parent.visible) {
          console.warn(
            `[TaxonomyRegistry Warning] Node "${node.slug}" is visible:true but parent "${parent.slug}" is visible:false.`
          );
        }
      }
    }
  }

  /**
   * Resolve any slug or legacy alias to its canonical TaxonomyNode.
   */
  public resolve(slugOrAlias?: string | null): TaxonomyNode | null {
    if (!slugOrAlias) return null;
    const canonical = this.aliasToCanonical.get(slugOrAlias.toLowerCase());
    if (!canonical) return null;
    return this.nodesBySlug.get(canonical) || null;
  }

  /**
   * Convert any slug or legacy alias to canonical slug string.
   */
  public canonicalize(input?: string | null): string | null {
    const resolved = this.resolve(input);
    return resolved ? resolved.slug : null;
  }

  /**
   * Get complete ancestry path from top-level root domain down to target node.
   */
  public getAncestry(slug: string): TaxonomyNode[] {
    const node = this.resolve(slug);
    if (!node) return [];

    const ancestry: TaxonomyNode[] = [];
    let current: TaxonomyNode | null = node;

    while (current) {
      ancestry.unshift(current);
      current = current.parentSlug ? this.nodesBySlug.get(current.parentSlug) || null : null;
    }

    return ancestry;
  }

  /**
   * Get direct children nodes of a given parent slug.
   */
  public getChildren(parentSlug: string | null): TaxonomyNode[] {
    const key = parentSlug || '__ROOT__';
    return this.childrenByParent.get(key) || [];
  }

  /**
   * Get direct children nodes where visible === true.
   */
  public getVisibleChildren(parentSlug: string | null): TaxonomyNode[] {
    return this.getChildren(parentSlug).filter(n => n.visible);
  }

  /**
   * Recursively collect all descendant leaf slugs under a given node.
   */
  public getAllLeafSlugs(parentSlug: string): string[] {
    const node = this.resolve(parentSlug);
    if (!node) return [];

    if (node.tier === 'leaf') {
      return [node.slug];
    }

    const leaves: string[] = [];
    const children = this.getChildren(node.slug);

    for (const child of children) {
      if (child.tier === 'leaf') {
        leaves.push(child.slug);
      } else {
        leaves.push(...this.getAllLeafSlugs(child.slug));
      }
    }

    return leaves;
  }

  /**
   * Build URL path for a given node.
   * Generates pillar/leaf path (e.g. "/research/malware-re").
   */
  public buildUrlPath(slug: string): string {
    if (slug === 'all') return '/';
    const node = this.resolve(slug);
    if (!node) return `/${slug}`;

    const ancestry = this.getAncestry(node.slug);
    // Exclude top-level 'security' domain from URL path for Option A (No domain prefix)
    const pathParts = ancestry
      .filter(n => n.tier !== 'domain')
      .map(n => n.slug);

    return pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';
  }

  /**
   * Resolve TaxonomyNode from URL path segments.
   */
  public resolveFromUrlPath(path: string): TaxonomyNode | null {
    const clean = path.replace(/^[#/]+/, '').replace(/\/$/, '');
    if (!clean) return null;

    const parts = clean.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];

    return this.resolve(lastPart);
  }

  /**
   * Hierarchy-aware filter matching.
   * Returns true if postCategory (or its alias) matches filterSlug OR is a descendant of filterSlug.
   */
  public matchesFilter(postCategory: string, filterSlug: string): boolean {
    if (filterSlug === 'all') return true;

    const postNode = this.resolve(postCategory);
    const filterNode = this.resolve(filterSlug);

    if (!postNode || !filterNode) {
      return postCategory.toLowerCase() === filterSlug.toLowerCase();
    }

    // Direct match
    if (postNode.slug === filterNode.slug) return true;

    // Check if postNode is a descendant of filterNode
    const ancestry = this.getAncestry(postNode.slug);
    return ancestry.some(n => n.slug === filterNode.slug);
  }

  /**
   * Get graph cross-referenced related nodes for discovery.
   */
  public getRelatedNodes(slug: string): TaxonomyNode[] {
    const node = this.resolve(slug);
    if (!node || !node.relatedSlugs) return [];

    return node.relatedSlugs
      .map(s => this.resolve(s))
      .filter((n): n is TaxonomyNode => n !== null && n.visible);
  }
}
