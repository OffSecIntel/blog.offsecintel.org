/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaxonomyNode, NavMenuItem, CollectionConfig } from './services/taxonomy/types';

export interface NavItem {
  label: string;
  type: 'filter' | 'link';
  value: string;
  icon?: string;
}

export interface CategoryInfo {
  id: string;
  label: string;
  description: string;
  subcategories?: string[];
}

export const PORTAL_CONFIG = {
  title: "OffSecIntel",
  subtitle: "Cyber Security Research & Threat Intelligence",
  description: "Technical publications focusing on cyber threat intelligence, vulnerability dissections, malware reverse engineering, detection engineering, and security systems architecture.",
  logoText: "RESEARCH_CENTER",
  copyright: "© 2026 OffSecIntel. All rights reserved.",
  defaultTheme: 'slate',
  enableCollections: true, // Master toggle for Microsoft Learn style reading paths
};

export const COLLECTIONS_CONFIG: CollectionConfig[] = [
  {
    slug: 'android-il2cpp-series',
    label: 'Android IL2CPP Reverse Engineering',
    description: 'Multi-part research series decompiling and analyzing dual-behavior Android games and IL2CPP cloaking mechanisms.',
    visible: true,
    toc: [
      {
        label: 'Fundamentals & Analysis Tools',
        children: [
          { label: 'Environment & Frida Setup', postSlug: 'android-re-setup' },
          { label: 'AppsFlyer & PlayerPrefs Tracking', postSlug: 'appsflyer-playerprefs' }
        ]
      },
      {
        label: 'Deep-Dive Case Studies',
        children: [
          { label: 'Uncloaking Two-Faced Android Game', postSlug: 'uncloaking-two-faced-android-game-il2cpp' },
          { label: 'Operation DreamBus Campaign', postSlug: 'operation-dreambus-campaign-mapping' }
        ]
      }
    ]
  }
];

// ============================================================
// HIERARCHICAL TAXONOMY TREE
// ============================================================
// Add nodes here to expand domain taxonomy.
// Set visible: false to keep a category hidden until content is ready to publish.
export const TAXONOMY_NODES: TaxonomyNode[] = [
  // ── Root Domain (Internal classification boundary) ──
  {
    slug: 'security',
    label: 'Security',
    description: 'Cyber security research, threat intelligence, reverse engineering, and security engineering.',
    parentSlug: null,
    aliases: [],
    visible: true,
    tier: 'domain'
  },

  // ── Pillars under Security ──
  {
    slug: 'research',
    label: 'Research',
    description: 'Technical investigations into vulnerabilities, malware reverse engineering, and cryptographic models.',
    parentSlug: 'security',
    aliases: [],
    visible: true,
    tier: 'pillar',
    themePattern: 'research',
    icon: 'search'
  },
  {
    slug: 'engineering',
    label: 'Engineering',
    description: 'Security systems engineering, kernel isolation, hypervisors, and detection automation.',
    parentSlug: 'security',
    aliases: [],
    visible: true,
    tier: 'pillar',
    themePattern: 'security',
    icon: 'shield'
  },
  {
    slug: 'intel',
    label: 'Intelligence',
    description: 'Cyber threat intelligence, adversary tracking, IOC feeds, and vulnerability advisories.',
    parentSlug: 'security',
    aliases: [],
    visible: false, // Flip to true when content is ready
    tier: 'pillar',
    icon: 'activity'
  },
  {
    slug: 'learning',
    label: 'Learning',
    description: 'Tutorials, reverse-engineering guides, tool walk-throughs, and technical resources.',
    parentSlug: 'security',
    aliases: [],
    visible: false, // Flip to true when content is ready
    tier: 'pillar',
    icon: 'book-open'
  },

  // ── Leaf Categories under Research ──
  {
    slug: 'malware-re',
    label: 'Malware RE',
    description: 'In-depth static & dynamic reverse engineering of active malware families, IL2CPP decompilation, and C2 protocols.',
    parentSlug: 'research',
    aliases: ['malwarere', 'MalwareRE'],
    visible: true,
    tier: 'leaf',
    specialtyLabel: 'Malware Reversing',
    themePattern: 'malwarere',
    relatedSlugs: ['threat-intel']
  },
  {
    slug: 'crypto-research',
    label: 'Cryptography',
    description: 'Technical investigations into post-quantum algorithms, secure enclave models, and cryptography bounds.',
    parentSlug: 'research',
    aliases: ['cryptography'],
    visible: true,
    tier: 'leaf',
    specialtyLabel: 'Threat Analysis',
    themePattern: 'research'
  },
  {
    slug: 'vuln-research',
    label: 'Vulnerability Research',
    description: 'Deep-dive vulnerability dissections, attack surface mapping, and zero-day impact analysis.',
    parentSlug: 'research',
    aliases: [],
    visible: false,
    tier: 'leaf'
  },
  {
    slug: 'exploit-analysis',
    label: 'Exploit Analysis',
    description: 'Exploit primitive analysis, payload construction, and bypass techniques.',
    parentSlug: 'research',
    aliases: [],
    visible: false,
    tier: 'leaf'
  },

  // ── Leaf Categories under Engineering ──
  {
    slug: 'system-security',
    label: 'System Security',
    description: 'Analyses of kernel isolation, hypervisors, sandboxing, and enterprise security system architectures.',
    parentSlug: 'engineering',
    aliases: ['security', 'systemsecurity'],
    visible: true,
    tier: 'leaf',
    specialtyLabel: 'Security Operations',
    themePattern: 'security'
  },
  {
    slug: 'detection-eng',
    label: 'Detection Engineering',
    description: 'Behavioral detection rules, YARA signatures, SIEM correlation, and automated incident response.',
    parentSlug: 'engineering',
    aliases: [],
    visible: false,
    tier: 'leaf'
  },

  // ── Leaf Categories under Intelligence (future) ──
  {
    slug: 'threat-intel',
    label: 'Threat Intelligence',
    description: 'APT actor campaign mapping, operational infrastructure tracking, and campaign indicators.',
    parentSlug: 'intel',
    aliases: [],
    visible: false,
    tier: 'leaf',
    relatedSlugs: ['malware-re']
  },
  {
    slug: 'cve-analysis',
    label: 'CVE Analysis',
    description: 'Structured analysis of published CVE advisories, severity scores, and mitigation pathways.',
    parentSlug: 'intel',
    aliases: [],
    visible: false,
    tier: 'leaf'
  },

  // ── Leaf Categories under Learning (future) ──
  {
    slug: 'tutorials',
    label: 'Tutorials',
    description: 'Step-by-step technical guides for security tools, reverse engineering, and threat hunting.',
    parentSlug: 'learning',
    aliases: [],
    visible: false,
    tier: 'leaf'
  },
  {
    slug: 'tool-guides',
    label: 'Tool Guides',
    description: 'Frida, Ghidra, IDA Pro, Burp Suite, and custom security tooling documentation.',
    parentSlug: 'learning',
    aliases: [],
    visible: false,
    tier: 'leaf'
  }
];

// ============================================================
// DECOUPLED NAVIGATION MENU CONFIGURATION
// ============================================================
// Navigation menu is decoupled from taxonomy hierarchy.
// Menu items reference taxonomy targets but can be structured independently.
export const NAVIGATION_CONFIG: NavMenuItem[] = [
  {
    label: "Home",
    action: "filter",
    target: "all",
    visible: true,
    icon: "home"
  },
  {
    label: "Research",
    action: "filter",
    target: "research",
    visible: true,
    icon: "search",
    children: [
      { label: "Malware RE", action: "filter", target: "malware-re", visible: true },
      { label: "Cryptography", action: "filter", target: "crypto-research", visible: true },
      { label: "Vulnerability Research", action: "filter", target: "vuln-research", visible: false },
      { label: "Exploit Analysis", action: "filter", target: "exploit-analysis", visible: false }
    ]
  },
  {
    label: "Engineering",
    action: "filter",
    target: "engineering",
    visible: true,
    icon: "shield",
    children: [
      { label: "System Security", action: "filter", target: "system-security", visible: true },
      { label: "Detection Eng", action: "filter", target: "detection-eng", visible: false }
    ]
  },
  {
    label: "Intelligence",
    action: "filter",
    target: "intel",
    visible: false,
    children: [
      { label: "Threat Intel", action: "filter", target: "threat-intel", visible: false },
      { label: "CVE Analysis", action: "filter", target: "cve-analysis", visible: false }
    ]
  },
  {
    label: "Learning",
    action: "filter",
    target: "learning",
    visible: false,
    children: [
      { label: "Tutorials", action: "filter", target: "tutorials", visible: false },
      { label: "Tool Guides", action: "filter", target: "tool-guides", visible: false }
    ]
  }
];

// ============================================================
// COLLECTIONS CONFIGURATION (Microsoft Learn Style Reading Paths)
// ============================================================
// Aggregates posts from multiple taxonomy categories into structured reading paths. (See COLLECTIONS_CONFIG defined above)

// Legacy exports for backward compatibility
export const NAVIGATION_MENU: NavItem[] = NAVIGATION_CONFIG
  .filter(item => item.visible)
  .map(item => ({
    label: item.label,
    type: item.action,
    value: item.target,
    icon: item.icon
  }));

export const CATEGORIES_CONFIG: CategoryInfo[] = TAXONOMY_NODES
  .filter(n => n.visible && n.tier !== 'domain')
  .map(n => ({
    id: n.slug,
    label: n.label,
    description: n.description,
    subcategories: TAXONOMY_NODES.filter(c => c.parentSlug === n.slug && c.visible).map(c => c.label)
  }));
