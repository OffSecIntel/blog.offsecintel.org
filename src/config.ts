/**
 * Site Configuration for the Cyber Threat Intelligence & Security Research Portal
 * 
 * Edit this file to add new menus, navigation buttons, categories, or change branding.
 */

export interface NavItem {
  label: string;
  type: 'filter' | 'link';
  value: string; // If 'filter', it filters categories. If 'link', it's an external URL.
  icon?: string; // Optional Lucide icon name
}

export interface CategoryInfo {
  id: string; // Must match the 'category' in markdown frontmatter
  label: string; // Display label
  description: string; // Small subtitle describing the category
  subcategories?: string[]; // Optional subcategories for secondary navigation/filtering
}

export const PORTAL_CONFIG = {
  title: "OffSecIntel",
  subtitle: "Security Research & Analysis Publications",
  description: "Technical publications focusing on malware reverse engineering, system security architectures, and cryptographic analysis.",
  logoText: "RESEARCH_CENTER",
  copyright: "© 2026 OffSecIntel. All rights reserved.",
  defaultTheme: "dark" // "dark" or "light" default
};

/**
 * Configure your navigation menus here.
 * - 'filter' type: Filters the catalog dynamically to only show posts matching that category.
 * - 'link' type: Opens an external link in a new tab.
 */
export const NAVIGATION_MENU: NavItem[] = [
  {
    label: "Home",
    type: "filter",
    value: "all"
  },
  {
    label: "Malware RE",
    type: "filter",
    value: "malwarere"
  },
  {
    label: "Security Research",
    type: "filter",
    value: "research"
  },
  {
    label: "System Security",
    type: "filter",
    value: "security"
  }
];

/**
 * Define your Categories and optional Subcategories here.
 * If you add a new category here, you can assign it in any `.md` file's frontmatter category field.
 */
export const CATEGORIES_CONFIG: CategoryInfo[] = [
  {
    id: "malwarere",
    label: "Malware RE",
    description: "In-depth analysis of active malware families, dynamic/static reverse engineering, and command-and-control behavior.",
    subcategories: ["Malware Analysis", "IL2CPP", "Reverse Engineering", "Frida Scripts"]
  },
  {
    id: "research",
    label: "Security Research",
    description: "Technical investigations into post-quantum algorithms, secure enclave models, and cryptography bounds.",
    subcategories: ["Cryptography", "Enclave Security", "Quantum Resistance"]
  },
  {
    id: "security",
    label: "System Security",
    description: "Analyses of kernel isolation, hypervisors, sandboxing, and enterprise security system architectures.",
    subcategories: ["Sandboxing", "Kernel Security", "Isolation Models", "Systems Security"]
  }
];
