/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MITRETechnique {
  tactic: string;
  technique: string;
  id: string;
}

export interface IoCEntry {
  type: 'sha256' | 'md5' | 'ip' | 'domain' | 'url' | 'registry';
  value: string;
  description: string;
}

export interface ThreatIntel {
  threatActor?: string;
  malwareFamily?: string;
  cves?: string[];
  mitreAttack?: MITRETechnique[];
  iocs?: IoCEntry[];
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidenceScore?: number; // 0 to 100
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string; // e.g. "security", "research", "threat-intel", "ai-safety"
  summary: string;
  content: string;
  author: string;
  authorAlias?: string;
  authorRole?: string;
  authorBio?: string;
  authorSpecialties?: string[];
  authorGithub?: string;
  authorHtb?: string;
  date: string;
  readTime: string;
  threatIntel?: ThreatIntel;
  published: boolean;
  draft?: boolean;
  bannerImage?: string;
  layoutMode?: 'high-density' | 'frosted-glass' | 'editorial' | 'sophisticated' | 'professional';
  themeColor?: 'crimson' | 'emerald' | 'cyan' | 'amber' | 'slate' | 'violet' | 'indigo';
  showToc?: boolean;
  showAbstract?: boolean;
  impactLevel?: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export interface ExportSettings {
  generator: 'hugo' | 'jekyll';
  siteTitle: string;
  siteAuthor: string;
  baseUrl: string;
  themeName: string;
  githubUsername: string;
  githubRepo: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  alias?: string;
  githubUrl?: string;
  htbUrl?: string;
  role: string;
  bio: string;
  specialties: string[];
  content: string;
  active?: boolean;
  published?: boolean;
}
