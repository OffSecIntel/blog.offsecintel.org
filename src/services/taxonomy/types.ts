/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Taxonomy Node interface for hierarchical category architecture and graph cross-linking.
 * Pure Vanilla TypeScript — zero framework dependencies.
 */
export interface TaxonomyNode {
  /** Permanent URL identity — NEVER changes once published */
  slug: string;
  /** Human-readable display label (can change freely) */
  label: string;
  /** Brief description for SEO, open graph, and category index headers */
  description: string;
  /** Parent node slug (null for top-level root domains like 'security') */
  parentSlug: string | null;
  /** Legacy or alternate slugs that redirect to this canonical node */
  aliases: string[];
  /** UI presentation flag. Controls menu/filter visibility — NOT a security boundary */
  visible: boolean;
  /** Hierarchy classification tier */
  tier: 'domain' | 'pillar' | 'leaf';
  /** Optional graph-like cross-references to related taxonomy nodes */
  relatedSlugs?: string[];
  /** Optional Lucide icon identifier for UI rendering */
  icon?: string;
  /** Optional researcher specialty label for AuthorDossier mapping */
  specialtyLabel?: string;
  /** Optional SVG theme pattern key for ThemeBannerFallback */
  themePattern?: string;
}

/**
 * Navigation Menu Item interface — INDEPENDENT of taxonomy hierarchy.
 * Allows decoupling top navigation menus from strict URL routing structures.
 */
export interface NavMenuItem {
  label: string;
  action: 'filter' | 'link';
  /** Taxonomy slug (if action === 'filter') or absolute/relative URL (if action === 'link') */
  target: string;
  visible: boolean;
  /** Sub-navigation items for expandable hover/tap dropdown menus */
  children?: NavMenuItem[];
  icon?: string;
}

/**
 * Table of Contents (TOC) entry within a Collection reading path.
 * Used to construct Microsoft Learn-style multi-article reading structures.
 */
export interface CollectionTocEntry {
  label: string;
  postSlug?: string;
  externalUrl?: string;
  children?: CollectionTocEntry[];
}

/**
 * Collection Configuration for curated reading paths (e.g. Crux RE Platform, XDR Setup Guide).
 * Completely orthogonal to taxonomy — a collection aggregates posts from multiple taxonomy nodes.
 */
export interface CollectionConfig {
  slug: string;
  label: string;
  description: string;
  visible: boolean;
  icon?: string;
  toc: CollectionTocEntry[];
}
