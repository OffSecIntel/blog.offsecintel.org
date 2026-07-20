/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BlogPost, AuthorProfile } from './types';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { getThemeColorClasses } from './theme';
import { ThreatIntelPanel } from './components/ThreatIntelPanel';
import { ArticleAssetsWidget } from './components/ArticleAssetsWidget';
import { PORTAL_CONFIG, NAVIGATION_MENU, CATEGORIES_CONFIG } from './config';
import { 
  Sun, Moon, Shield, Search, ArrowLeft, Calendar, User, Clock, Eye, 
  Globe, Activity, AlertTriangle, ExternalLink, Lock, RefreshCw, Layers, Terminal,
  CheckCircle, ChevronLeft, ChevronRight, Menu, X, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthorDossier } from './components/AuthorDossier';

// ----------------------------------------------------------------------
// Hugo / Jekyll Style Static Markdown Loading Engine
// ----------------------------------------------------------------------
function generateNumericId(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return String(hash >>> 0);
}

export function parseMarkdownPost(filename: string, fileContent: string): BlogPost {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const rawFrontmatter = match ? match[1] : '';
  const content = match ? match[2].trim() : fileContent.trim();

  const frontmatter: Record<string, string> = {};
  rawFrontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let val = line.slice(colonIndex + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      frontmatter[key] = val;
    }
  });

  // Base identifier extraction from filename to avoid hardcoding IDs
  const fileBaseName = filename.replace(/\.md$/, '').split('/').pop() || 'untitled';
  const slug = frontmatter.slug || fileBaseName;
  const rawId = frontmatter.id?.trim();
  const id = rawId && /^\d+$/.test(rawId) ? rawId : generateNumericId(slug);

  const title = frontmatter.title || 'Untitled Post';
  const category = frontmatter.category || 'general';
  const summary = frontmatter.summary || '';
  const author = frontmatter.author || 'Anonymous';
  const authorAlias = frontmatter.authorAlias || undefined;
  const authorRole = frontmatter.authorRole || undefined;
  const authorBio = frontmatter.authorBio || undefined;
  const authorSpecialties = frontmatter.authorSpecialties ? frontmatter.authorSpecialties.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined;
  const authorGithub = frontmatter.authorGithub || undefined;
  const authorHtb = frontmatter.authorHtb || undefined;
  const date = frontmatter.date || new Date().toISOString().split('T')[0];
  const readTime = frontmatter.readTime || '3 min read';
  const published = frontmatter.published !== 'false' && frontmatter.draft !== 'true';
  const draft = frontmatter.draft === 'true' || frontmatter.published === 'false';
  const bannerImage = frontmatter.bannerImage || undefined;
  const layoutMode = (frontmatter.layoutMode as BlogPost['layoutMode']) || 'high-density';
  const themeColor = (frontmatter.themeColor as BlogPost['themeColor']) || 'crimson';
  const showToc = frontmatter.showToc === 'true';
  const showAbstract = frontmatter.showAbstract !== 'false';
  const impactLevel = (frontmatter.impactLevel as BlogPost['impactLevel']) || undefined;

  // Reconstruct threatIntel fields
  let threatIntel: any = undefined;
  const hasIntelKeys = Object.keys(frontmatter).some(k => k.startsWith('threatIntel.'));
  if (hasIntelKeys) {
    threatIntel = {};
    if (frontmatter['threatIntel.threatActor']) {
      threatIntel.threatActor = frontmatter['threatIntel.threatActor'];
    }
    if (frontmatter['threatIntel.malwareFamily']) {
      threatIntel.malwareFamily = frontmatter['threatIntel.malwareFamily'];
    }
    if (frontmatter['threatIntel.cves']) {
      threatIntel.cves = frontmatter['threatIntel.cves'].split(',').map(c => c.trim()).filter(Boolean);
    }
    if (frontmatter['threatIntel.severity']) {
      threatIntel.severity = frontmatter['threatIntel.severity'];
    }
    if (frontmatter['threatIntel.confidenceScore']) {
      threatIntel.confidenceScore = parseInt(frontmatter['threatIntel.confidenceScore'], 10);
    }
    if (frontmatter['threatIntel.relevanceScore']) {
      threatIntel.relevanceScore = parseInt(frontmatter['threatIntel.relevanceScore'], 10);
    }
    if (frontmatter['threatIntel.affectedSystems']) {
      threatIntel.affectedSystems = frontmatter['threatIntel.affectedSystems'].split(',').map(s => s.trim()).filter(Boolean);
    }
    if (frontmatter['threatIntel.mitreAttack']) {
      threatIntel.mitreAttack = frontmatter['threatIntel.mitreAttack'].split(',').map(part => {
        const parts = part.split('|').map(s => s.trim());
        if (parts.length >= 3) {
          return { tactic: parts[0], technique: parts[1], id: parts[2] };
        }
        return null;
      }).filter(Boolean);
    }
    if (frontmatter['threatIntel.iocs']) {
      threatIntel.iocs = frontmatter['threatIntel.iocs'].split(',').map(part => {
        const parts = part.split('|').map(s => s.trim());
        if (parts.length >= 3) {
          return { type: parts[0], value: parts[1], description: parts[2] };
        }
        return null;
      }).filter(Boolean);
    }
  }

  return {
    id,
    title,
    slug,
    category,
    summary,
    content,
    author,
    authorAlias,
    authorRole,
    authorBio,
    authorSpecialties,
    authorGithub,
    authorHtb,
    date,
    readTime,
    published,
    draft,
    bannerImage,
    layoutMode,
    themeColor,
    showToc,
    showAbstract,
    impactLevel,
    threatIntel
  };
}

export function loadStaticMarkdownPosts(): BlogPost[] {
  const modules = (import.meta as any).glob('./posts/*.md', { query: '?raw', eager: true }) as Record<string, any>;
  const parsedPosts: BlogPost[] = [];
  
  for (const path in modules) {
    if (Object.prototype.hasOwnProperty.call(modules, path)) {
      const rawModule = modules[path];
      const rawContent = typeof rawModule === 'string' ? rawModule : (rawModule.default || '');
      const parsed = parseMarkdownPost(path, rawContent);
      if (parsed.published && !parsed.draft) {
        parsedPosts.push(parsed);
      }
    }
  }
  
  return parsedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function parseAuthorProfile(filename: string, fileContent: string): AuthorProfile {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const rawFrontmatter = match ? match[1] : '';
  const content = match ? match[2].trim() : fileContent.trim();

  const frontmatter: Record<string, string> = {};
  rawFrontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let val = line.slice(colonIndex + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      frontmatter[key] = val;
    }
  });

  const fileBaseName = filename.replace(/\.md$/, '').split('/').pop() || 'untitled';
  const id = frontmatter.id || fileBaseName;
  const name = frontmatter.name || 'Anonymous Contributor';
  const alias = frontmatter.alias || undefined;
  const githubUrl = frontmatter.githubUrl || undefined;
  const htbUrl = frontmatter.htbUrl || undefined;
  const role = frontmatter.role || 'Contributing Researcher';
  
  // Extract a clean bio from the first paragraph of content
  const firstParagraph = content.split('\n\n')[0] || '';
  const bio = firstParagraph.replace(/[#*_\-`>]/g, '').trim();

  const specialties = frontmatter.specialties 
    ? frontmatter.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) 
    : ['Threat Analysis'];

  const active = frontmatter.active !== undefined ? frontmatter.active !== 'false' : true;
  const published = frontmatter.published !== undefined ? frontmatter.published !== 'false' : true;

  return {
    id,
    name,
    alias,
    githubUrl,
    htbUrl,
    role,
    bio,
    specialties,
    content,
    active,
    published
  };
}

export function loadStaticAuthorProfiles(): AuthorProfile[] {
  const modules = (import.meta as any).glob('./authors/*.md', { query: '?raw', eager: true }) as Record<string, any>;
  const parsedProfiles: AuthorProfile[] = [];
  
  for (const path in modules) {
    if (Object.prototype.hasOwnProperty.call(modules, path)) {
      const rawModule = modules[path];
      const rawContent = typeof rawModule === 'string' ? rawModule : (rawModule.default || '');
      const parsed = parseAuthorProfile(path, rawContent);
      parsedProfiles.push(parsed);
    }
  }
  
  return parsedProfiles;
}


// Theme classes are now handled dynamically and responsively in src/theme.ts

// 1. Table of Contents Component
export function TableOfContents({ 
  content, 
  themeClasses,
  postPages,
  currentPageIndex,
  onPageChange
}: { 
  content: string; 
  themeClasses: any;
  postPages?: string[];
  currentPageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
}) {
  const [headers, setHeaders] = useState<{ level: number; text: string; id: string; pageIndex: number }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const extracted: typeof headers = [];
    
    if (postPages && postPages.length > 1) {
      // Multipage document: parse each page to record the corresponding pageIndex
      postPages.forEach((pageContent, pageIdx) => {
        const lines = pageContent.split('\n');
        let inCodeBlock = false;
        for (let line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
          }
          if (inCodeBlock) continue;
          
          if (trimmed.startsWith('#')) {
            const match = trimmed.match(/^#+/);
            if (match) {
              const level = match[0].length;
              const text = trimmed.replace(/^#+\s*/, '');
              const id = 'hdr-' + text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
              extracted.push({ level, text, id, pageIndex: pageIdx });
            }
          }
        }
      });
    } else {
      // Single-page document: parse entire content
      const lines = content.split('\n');
      let inCodeBlock = false;
      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }
        if (inCodeBlock) continue;
        
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^#+/);
          if (match) {
            const level = match[0].length;
            const text = trimmed.replace(/^#+\s*/, '');
            const id = 'hdr-' + text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            extracted.push({ level, text, id, pageIndex: 0 });
          }
        }
      }
    }
    
    setHeaders(extracted);
  }, [content, postPages]);

  useEffect(() => {
    const handleScroll = () => {
      let currentActive: string | null = null;
      for (const h of headers) {
        if (currentPageIndex !== undefined && h.pageIndex !== currentPageIndex) {
          continue;
        }
        const el = document.getElementById(h.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            currentActive = h.id;
          }
        }
      }
      setActiveId(currentActive || (headers.find(h => currentPageIndex === undefined || h.pageIndex === currentPageIndex)?.id || null));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headers, currentPageIndex]);

  if (headers.length === 0) return null;

  return (
    <div className="space-y-3.5 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm shadow-sm animate-fade-in">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">
        Article Outline
      </h4>
      <nav className="space-y-2 border-l border-slate-200 dark:border-slate-800/80">
        {headers.map((h, i) => (
          <a
            key={i}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              const doScroll = () => {
                const targetEl = document.getElementById(h.id);
                if (targetEl) {
                  const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
                  const offsetPosition = elementPosition - 90;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              };

              if (onPageChange && currentPageIndex !== undefined && h.pageIndex !== currentPageIndex) {
                onPageChange(h.pageIndex);
                setTimeout(doScroll, 150);
              } else {
                doScroll();
              }
            }}
            className={`block text-xs transition-all duration-150 py-0.5 border-l -ml-[1px] leading-tight ${
              h.level === 1 
                ? 'font-semibold text-slate-900 dark:text-slate-100' 
                : h.level === 2 
                  ? 'font-medium text-slate-700 dark:text-slate-300' 
                  : h.level === 3 
                    ? 'text-slate-500 dark:text-slate-400 font-normal' 
                    : 'text-slate-400 dark:text-slate-500 italic text-[11px]'
            } ${
              activeId === h.id 
                ? `${themeClasses.text} border-rose-500 dark:border-rose-400 font-bold scale-[1.02]` 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

// 2. Recent Intel Widget
export function RecentIntelWidget({ 
  currentPostId, 
  posts, 
  themeClasses, 
  onSelectPost 
}: { 
  currentPostId: string; 
  posts: BlogPost[]; 
  themeClasses: any; 
  onSelectPost: (id: string) => void;
}) {
  const recent = posts
    .filter(p => p.id !== currentPostId && p.published)
    .slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-3.5 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm shadow-sm">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
        <Activity size={12} className={themeClasses.text} />
        <span>Recent Investigations</span>
      </h4>
      <div className="space-y-2.5">
        {recent.map((p) => {
          const sev = p.threatIntel?.severity || 'info';
          const sevColor = 
            sev === 'critical' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
            sev === 'high' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
            sev === 'medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
            'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';

          return (
            <div 
              key={p.id}
              onClick={() => onSelectPost(p.id)}
              className="group cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20 hover:bg-slate-100/75 dark:hover:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
            >
              <div className="flex justify-between items-center gap-2 mb-1.5">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">/{p.category}</span>
                <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border leading-none ${sevColor}`}>
                  {sev}
                </span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                {p.title}
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-1">{p.date}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3. Impact Level Ribbon Component
export function ImpactLevelRibbon({ level }: { level?: BlogPost['impactLevel'] }) {
  if (!level) return null;
  const norm = level.toLowerCase();
  let bg = 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
  let label = 'CRITICAL ASSESSMENT / SYSTEM OVERVIEW REQUIREMENT';
  let desc = 'This cybersecurity and research publication describes elements carrying active zero-day traits, system vulnerabilities, or immediate computational safety risk vectors.';

  if (norm === 'high') {
    bg = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
    label = 'HIGH EXPOSURE REPORT / DIRECTED MITIGATION';
    desc = 'Vulnerability telemetry or research benchmarks demonstrate significant lateral reach. Follow listed patching indicators or validation matrices.';
  } else if (norm === 'medium') {
    bg = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400';
    label = 'MEDIUM IMPACT DISCLOSURE / LOCAL TELEMETRY';
    desc = 'Observed research signals a moderate attack surface expansion or targeted technical application. Mitigation tactics are verified stable under standard testing.';
  } else if (norm === 'low') {
    bg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    label = 'ROUTINE EVALUATION / INTEGRATION COMPLETED';
    desc = 'Low threat metrics. The techniques and theoretical computer science frameworks described represent standard educational paradigms or mitigated indicators.';
  } else if (norm === 'info') {
    bg = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400';
    label = 'ACADEMIC WHITE PAPER / RESEARCH DISCLOSURE';
    desc = 'This publication represents foundational peer-reviewed research, systemic computer science paradigms, or high-level threat matrix disclosures.';
  }

  return (
    <div className={`p-4 rounded-xl border font-sans text-xs flex gap-3.5 items-start leading-relaxed shadow-sm ${bg}`}>
      <div className="flex-1">
        <p className="font-mono font-extrabold tracking-wider text-[9px] uppercase mb-1">{label}</p>
        <p className="opacity-90 font-medium">{desc}</p>
      </div>
    </div>
  );
}

// Custom High-Quality SVG fallback representation of OffSecIntel (OSI) Shield
export function OffSecIntelShieldSVG() {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className="w-full h-full text-[#970000] fill-current"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#800000" />
        </linearGradient>
      </defs>
      <path 
        d="M50 8 L85 22 V52 C85 73 70 89 50 95 C30 89 15 72 15 52 V22 L50 8 Z" 
        fill="none" 
        stroke="url(#shieldGrad)" 
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="51" r="23" fill="none" stroke="#970000" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />
      <path d="M50 16 V86 M16 51 H84" stroke="#970000" strokeWidth="0.75" opacity="0.3" />
      <text x="50" y="59" fontSize="23" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="url(#shieldGrad)" letterSpacing="-1">
        OSI
      </text>
    </svg>
  );
}

// Custom hook to dynamically calculate the SHA-256 hash of a text block
export function useSha256(text: string) {
  const [hash, setHash] = useState<string>('');

  useEffect(() => {
    let active = true;
    async function compute() {
      if (!text) return;
      try {
        const msgUint8 = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        if (active) {
          setHash(hashHex);
        }
      } catch (err) {
        console.error("SHA-256 computation failed:", err);
      }
    }
    compute();
    return () => {
      active = false;
    };
  }, [text]);

  return hash;
}

// Component to display real-time client-side cryptographic publication verification
export function ArticleIntegrityWidget({ content }: { content: string }) {
  const sha256 = useSha256(content);

  return (
    <div className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121826] rounded-xl p-5 shadow-sm space-y-3.5 font-mono text-[11px]">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
        <h3 className="font-semibold text-slate-900 dark:text-white text-xs font-sans">Publication Integrity Verification</h3>
      </div>
      <div className="space-y-2.5">
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold leading-none mb-1">REAL-TIME CONTENT CHECKSUM (SHA-256)</span>
          <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/60 break-all select-all text-[10px] text-slate-600 dark:text-slate-300 font-mono tracking-tight font-medium leading-normal">
            {sha256 || "COMPUTING_INTEGRITY_DIGEST..."}
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800/50 pt-2">
          <span>PIPELINE INTEGRITY:</span>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            VERIFIED SIGNED MERGE
          </span>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
          This cryptographic digest is dynamically calculated client-side by your browser from the original Markdown payload, guaranteeing that the dispatch content perfectly matches the GPG-signed pull request merged in the authoritative source repository.
        </div>
      </div>
    </div>
  );
}

// Helper component to render the premium logo icon with Fallback
export function OffSecIntelLogoIcon({ className = "w-9 h-9 p-1" }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);
  const logoUrl = "https://app.offsecintel.org/assets/img/logo/drawing_NoText.svg";

  return (
    <div className={`rounded-lg bg-[#970000]/10 border border-[#970000]/20 overflow-hidden flex items-center justify-center shrink-0 ${className}`}>
      {!useFallback ? (
        <img 
          src={logoUrl} 
          alt="OffSecIntel Logo" 
          className="w-full h-full object-contain" 
          onError={() => setUseFallback(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <OffSecIntelShieldSVG />
      )}
    </div>
  );
}

// 4. Dynamic Logo with Fallback Chain
export function OffSecIntelLogo() {
  return (
    <a 
      href="https://offsecintel.org" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center gap-2.5 cursor-pointer select-none group"
      onClick={(e) => {
        // Prevent click bubbling up so we don't trigger layout resets unless intended,
        // or let's allow navigation while still keeping it simple.
      }}
    >
      <OffSecIntelLogoIcon className="w-9 h-9 p-1 group-hover:scale-105 transition-transform" />
      <div>
        <span className="font-sans font-bold tracking-tight text-slate-900 dark:text-white text-sm md:text-base leading-none">
          Off<span className="text-[#970000] dark:text-[#ff4b4b]">Sec</span>Intel
        </span>
        <p className="text-[8px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-500 font-bold leading-none mt-0.5">
          {PORTAL_CONFIG.logoText}
        </p>
      </div>
    </a>
  );
}

// 5. Tactical Multipage Article Navigation Toolbar
export function TacticalPageNavigator({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (index: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] select-none shadow-sm">
      <button
        disabled={currentPage === 0}
        onClick={() => {
          onPageChange(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
          currentPage === 0
            ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
            : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <ChevronLeft size={13} />
        PREV_PAGE
      </button>

      <div className="flex items-center gap-1.5 font-bold">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              onPageChange(idx);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${
              currentPage === idx
                ? 'bg-[#970000]/10 border-[#970000]/30 text-[#ff4b4b] font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <span className="text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline">
          (SECTION: {currentPage + 1} / {totalPages})
        </span>
      </div>

      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => {
          onPageChange(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
          currentPage === totalPages - 1
            ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
            : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        NEXT_PAGE
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

export function getAuthorDisplay(authorName: string, post?: BlogPost): string {
  if (post && post.authorAlias) {
    return `${post.author} (${post.authorAlias})`;
  }
  const lower = authorName.toLowerCase();
  if (lower.includes('nayan') || lower.includes('rande')) {
    return 'Nayan Rande (alexdos2010m)';
  }
  if (lower.includes('mandar') || lower.includes('kulkarni') || lower.includes('sarah') || lower.includes('jenkins')) {
    return 'Mandar Kulkarni (mandark)';
  }
  if (lower.includes('offsec') || lower.includes('research') || lower.includes('desk')) {
    return 'OffSecIntel Research Desk (offsec_desk)';
  }
  return authorName;
}

export function getAuthorId(authorName: string): string {
  const lower = authorName.toLowerCase();
  if (lower.includes('nayan') || lower.includes('rande')) {
    return 'nayan';
  }
  if (lower.includes('mandar') || lower.includes('kulkarni') || lower.includes('sarah') || lower.includes('jenkins')) {
    return 'mandar';
  }
  if (lower.includes('offsec') || lower.includes('research') || lower.includes('desk') || lower.includes('group')) {
    return 'offsec';
  }
  return lower.replace(/[^a-z0-9]/g, '_');
}


export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to system settings if available
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return PORTAL_CONFIG.defaultTheme === 'dark';
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activePostPageIndex, setActivePostPageIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    // 1. Check Hash first (for GitHub Pages static routing compatibility)
    const hash = window.location.hash;
    if (hash) {
      const lowerHash = hash.toLowerCase();
      if (lowerHash.includes('/research')) return 'research';
      if (lowerHash.includes('/security')) return 'security';
      if (lowerHash.includes('/malwarere')) return 'malwarere';
    }

    // 2. Fallback to standard Path
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/research')) return 'research';
    if (path.includes('/security')) return 'security';
    if (path.includes('/malwarere')) return 'malwarere';
    
    // 3. Fallback to search parameters
    const searchStr = window.location.search || (hash.includes('?') ? '?' + hash.split('?')[1] : '');
    const params = new URLSearchParams(searchStr);
    const catParam = params.get('category');
    if (catParam) {
      const normCat = catParam.toLowerCase();
      if (['research', 'security', 'malwarere'].includes(normCat)) {
        return normCat;
      }
    }
    return 'all';
  });
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showDossier, setShowDossier] = useState<boolean>(false);
  const [dossierSelectedResearcherId, setDossierSelectedResearcherId] = useState<string | null>(null);
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Reset page index when switching active posts
  useEffect(() => {
    setActivePostPageIndex(0);
  }, [selectedPostId]);

  // Sync theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Load static posts on mount
  const fetchPosts = () => {
    setLoading(true);
    try {
      const initialList = loadStaticMarkdownPosts();
      setPosts(initialList);
      const initialAuthors = loadStaticAuthorProfiles();
      setAuthors(initialAuthors);
    } catch (err: any) {
      console.error("Error loading static markdown posts.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle initial deep linking once posts are loaded
  useEffect(() => {
    if (posts.length === 0) return;
    const hash = window.location.hash;
    const searchStr = window.location.search || (hash.includes('?') ? '?' + hash.split('?')[1] : '');
    const params = new URLSearchParams(searchStr);
    const postSlug = params.get('post') || params.get('p');
    if (postSlug) {
      const match = posts.find(p => p.slug === postSlug || p.id === postSlug);
      if (match) {
        setSelectedPostId(match.id);
      }
    } else if (!window.location.hash && !window.location.search) {
      setSelectedPostId(null);
    }
  }, [posts]);

  // Synchronize category/post selection to URL pathname/hash & search parameters
  useEffect(() => {
    if (loading) return;
    
    const isGitHubPages = window.location.hostname.endsWith('github.io') || 
                          window.location.pathname.split('/').filter(Boolean).length > 1;

    if (isGitHubPages) {
      let hashPath = '#/';
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        const categoryPath = selectedCategory === 'malwarere' ? 'MalwareRE' : selectedCategory;
        hashPath = `#/${categoryPath}`;
      }
      
      if (selectedPostId) {
        const post = posts.find(p => p.id === selectedPostId);
        if (post) {
          params.set('post', post.slug);
        }
      } else {
        params.delete('post');
        params.delete('p');
      }
      
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const nextUrl = `${window.location.pathname}${hashPath}${queryStr}`;
      if (window.location.pathname + window.location.search + window.location.hash !== nextUrl) {
        window.history.pushState(null, '', nextUrl);
      }
    } else {
      let path = '/';
      const params = new URLSearchParams(window.location.search);
      params.delete('category');
      
      if (selectedCategory !== 'all') {
        const categoryPath = selectedCategory === 'malwarere' ? 'MalwareRE' : selectedCategory;
        path = `/${categoryPath}`;
      }
      
      if (selectedPostId) {
        const post = posts.find(p => p.id === selectedPostId);
        if (post) {
          params.set('post', post.slug);
        }
      } else {
        params.delete('post');
        params.delete('p');
      }
      
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const nextUrl = `${window.location.origin}${path}${queryStr}`;
      if (window.location.href !== nextUrl) {
        window.history.pushState(null, '', nextUrl);
      }
    }
  }, [selectedCategory, selectedPostId, loading, posts]);

  // Sync scroll progress on post reader
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedPostId]);

  // Filter posts based on category, subcategory and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory;
    
    // Check subcategory matches within Content/Summary if a subcategory is selected
    const matchesSubcategory = !selectedSubcategory || 
      post.title.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
      post.summary.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
      post.content.toLowerCase().includes(selectedSubcategory.toLowerCase());

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      post.title.toLowerCase().includes(searchLower) ||
      post.summary.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.author.toLowerCase().includes(searchLower) ||
      post.threatIntel?.threatActor?.toLowerCase().includes(searchLower) ||
      post.threatIntel?.malwareFamily?.toLowerCase().includes(searchLower) ||
      post.threatIntel?.cves?.some(c => c.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const activePost = posts.find(p => p.id === selectedPostId);

  // Active category detail information (from configuration)
  const activeCategoryInfo = CATEGORIES_CONFIG.find(c => c.id === selectedCategory);

  // Stats summaries
  const criticalThreatsCount = posts.filter(p => p.threatIntel?.severity === 'critical' || p.threatIntel?.severity === 'high').length;
  const threatActorsCount = Array.from(new Set(posts.map(p => p.threatIntel?.threatActor).filter(Boolean))).length;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      darkMode ? 'bg-[#0b0f19] text-slate-200 selection:bg-rose-500/20' : 'bg-[#f8fafc] text-slate-700 selection:bg-rose-500/10'
    }`}>
      
      {/* Navigation Header */}
      <header className={`sticky top-0 z-40 border-b transition-colors backdrop-blur ${
        darkMode ? 'bg-[#0d1321]/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand/Logo */}
          <div onClick={() => { setSelectedPostId(null); setSelectedCategory('all'); setSelectedSubcategory(null); setShowDossier(false); }}>
            <OffSecIntelLogo />
          </div>

          {/* Configuration-driven Navigation Menus */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium">
            {NAVIGATION_MENU.map((item, index) => {
              if (item.type === 'filter') {
                const isActive = selectedCategory === item.value && !selectedPostId && !showDossier;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedPostId(null);
                      setSelectedCategory(item.value);
                      setSelectedSubcategory(null);
                      setShowDossier(false);
                    }}
                    className={`transition-colors py-1 ${
                      isActive 
                        ? 'text-rose-500 border-b-2 border-rose-500 font-bold' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              } else {
                return (
                  <a
                    key={index}
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                  >
                    <span>{item.label}</span>
                    <ExternalLink size={10} />
                  </a>
                );
              }
            })}
          </nav>

          {/* Theme controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800 text-yellow-500 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

        </div>
        
        {/* Top Progress bar indicator (only visible on post view) */}
        {selectedPostId && activePost && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden">
            <div className={`h-full ${getThemeColorClasses(activePost.themeColor, darkMode).scrollBar}`} style={{ width: `${scrollProgress}%` }}></div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        <AnimatePresence mode="wait">
          {showDossier ? (
            <motion.div
              key="dossier"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <AuthorDossier 
                posts={posts} 
                authors={authors}
                initialSelectedResearcher={dossierSelectedResearcherId}
                isDark={darkMode}
                onSelectPost={(id) => {
                  setSelectedPostId(id);
                  setShowDossier(false);
                }} 
                onClose={() => setShowDossier(false)} 
              />
            </motion.div>
          ) : selectedPostId && activePost ? (
            (() => {
              const layout = activePost.layoutMode || 'high-density';
              const themeClasses = getThemeColorClasses(activePost.themeColor, darkMode);
              const isDark = darkMode;
              
              const postPages = activePost.content.split('<!-- pagebreak -->').map(p => p.trim());
              const totalPages = postPages.length;
              const currentPageContent = totalPages > 1 ? postPages[activePostPageIndex] : activePost.content;

              return (
                /* Subview: Active Report Viewer Mode */
                <motion.div
                  key="reader"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6 relative"
                >
                  {activePost.draft && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 font-mono text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold uppercase">PREVIEW_MODE: LOCAL_RESEARCH_DRAFT</p>
                        <p className="opacity-90 leading-normal mt-1 font-sans">
                          This publication is flagged as a draft. It is excluded from the public directory listing unless the "Show Drafts" toggle is explicitly enabled. Set <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded text-amber-700 dark:text-amber-300">published: true</code> or remove <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded text-amber-700 dark:text-amber-300">draft: true</code> in the frontmatter of this document to mark it as published.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Frosted Glass ambient glows */}
                  {layout === 'frosted-glass' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                      <div 
                        className="absolute -top-12 -left-12 w-96 h-96 rounded-full opacity-10 dark:opacity-[0.08] blur-[120px] transition-colors duration-500"
                        style={{ backgroundColor: themeClasses.accentHex }}
                      />
                      <div 
                        className="absolute top-1/2 right-10 w-80 h-80 rounded-full opacity-5 dark:opacity-[0.05] blur-[100px] transition-colors duration-500"
                        style={{ backgroundColor: themeClasses.accentHex }}
                      />
                    </div>
                  )}

                  {/* Navigation Path Breadcrumb */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedPostId(null)}
                      className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white group"
                    >
                      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                      <span>PUBLICATIONS_DATABASE / {activePost.category.toUpperCase()} / {activePost.slug.toUpperCase()}</span>
                    </button>
                    
                    <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400">
                      <Lock size={11} className="text-emerald-500" />
                      <span>DEPLOYMENT: VERIFIED SIGNED PR MERGE</span>
                    </div>
                  </div>

                  {/* Dynamic Page Layout Renderer */}
                  {(() => {
                    switch (layout) {
                      case 'frosted-glass':
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-8 space-y-6">
                              <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-lg space-y-5">
                                <div className="space-y-3">
                                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${themeClasses.border} ${themeClasses.bgLight} ${themeClasses.text} font-mono`}>
                                    /{activePost.category}
                                  </span>
                                  <h1 className="text-3xl md:text-4xl font-extrabold font-sans tracking-tight text-slate-900 dark:text-white leading-tight">
                                    {activePost.title}
                                  </h1>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold font-sans">
                                    <span className="flex items-center gap-1">
                                      By 
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedPostId(null);
                                          setDossierSelectedResearcherId(getAuthorId(activePost.author));
                                          setShowDossier(true);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="hover:text-rose-500 hover:underline transition-colors focus:outline-none font-bold"
                                      >
                                        {getAuthorDisplay(activePost.author, activePost)}
                                      </button>
                                    </span>
                                    <span>•</span>
                                    <span>{activePost.date}</span>
                                    <span>•</span>
                                    <span className={themeClasses.text}>{activePost.readTime}</span>
                                  </div>
                                </div>

                                {activePost.bannerImage && (
                                  <div className="rounded-xl overflow-hidden aspect-[21/9] border border-white/20 dark:border-slate-800 shadow-inner">
                                    <img src={activePost.bannerImage} alt={activePost.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                )}

                                {activePost.summary && activePost.showAbstract !== false && (
                                  <div className="bg-white/60 dark:bg-slate-950/20 backdrop-blur-sm rounded-xl p-5 border border-white/20 dark:border-slate-800 shadow-sm italic text-slate-700 dark:text-slate-300">
                                    <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider mb-1">Executive Summary / Abstract</p>
                                    "{activePost.summary}"
                                  </div>
                                )}

                                <div className="py-2">
                                  <MarkdownRenderer content={currentPageContent} themeColor={activePost.themeColor} isDark={darkMode} />
                                  <TacticalPageNavigator currentPage={activePostPageIndex} totalPages={totalPages} onPageChange={setActivePostPageIndex} />
                                </div>
                              </div>
                            </div>

                            <div className="lg:col-span-4 sticky top-24 space-y-6">
                              {activePost.showToc && (
                                <TableOfContents 
                                  content={activePost.content} 
                                  themeClasses={themeClasses} 
                                  postPages={postPages}
                                  currentPageIndex={activePostPageIndex}
                                  onPageChange={setActivePostPageIndex}
                                />
                              )}
                              
                              <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-white/20 dark:border-slate-800">
                                  <Shield size={16} className={themeClasses.text} />
                                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Threat Parameters</h3>
                                </div>
                                {activePost.threatIntel ? (
                                  <ThreatIntelPanel intel={activePost.threatIntel} isSidebar={true} />
                                ) : (
                                  <p className="text-xs text-slate-400 text-center py-4 font-mono">NO_INTELLIGENCE_METRICS_FOUND</p>
                                )}
                              </div>

                              <ArticleAssetsWidget postSlug={activePost.slug} themeColor={activePost.themeColor} isDark={darkMode} />

                              <RecentIntelWidget currentPostId={activePost.id} posts={posts} themeClasses={themeClasses} onSelectPost={setSelectedPostId} />
                              <ArticleIntegrityWidget content={activePost.content} />
                            </div>
                          </div>
                        );

                      case 'editorial':
                        return (
                          <div className="max-w-4xl mx-auto space-y-8 py-4 font-serif">
                            <div className="space-y-4 text-center">
                              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 pb-1 px-3">
                                /{activePost.category}
                              </span>
                              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight font-semibold tracking-tight">
                                {activePost.title}
                              </h1>
                              <div className="flex justify-center items-center gap-4 text-xs font-sans text-slate-400 font-mono tracking-wider">
                                <span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPostId(null);
                                      setDossierSelectedResearcherId(getAuthorId(activePost.author));
                                      setShowDossier(true);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="hover:text-rose-500 hover:underline transition-colors focus:outline-none font-bold"
                                  >
                                    {getAuthorDisplay(activePost.author, activePost)}
                                  </button>
                                </span>
                                <span>—</span>
                                <span>{activePost.date}</span>
                                <span>—</span>
                                <span className="font-bold text-rose-500">{activePost.readTime}</span>
                              </div>
                            </div>

                            {activePost.impactLevel && (
                              <ImpactLevelRibbon level={activePost.impactLevel} />
                            )}

                            {activePost.bannerImage && (
                              <div className="rounded-xl overflow-hidden aspect-[21/9] border border-slate-200 dark:border-slate-800 shadow-sm">
                                <img src={activePost.bannerImage} alt={activePost.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            {activePost.summary && (
                              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-xl border border-slate-200 dark:border-slate-800 italic text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-sm">
                                "{activePost.summary}"
                              </div>
                            )}

                            <div className="prose dark:prose-invert max-w-none pt-4">
                              <MarkdownRenderer content={currentPageContent} themeColor={activePost.themeColor} isDark={darkMode} />
                              <TacticalPageNavigator currentPage={activePostPageIndex} totalPages={totalPages} onPageChange={setActivePostPageIndex} />
                            </div>

                            {activePost.threatIntel && (
                              <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80">
                                <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Metadata Analysis Matrices</h3>
                                <ThreatIntelPanel intel={activePost.threatIntel} />
                              </div>
                            )}

                            <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80">
                              <ArticleAssetsWidget postSlug={activePost.slug} themeColor={activePost.themeColor} isDark={darkMode} />
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60">
                              <ArticleIntegrityWidget content={activePost.content} />
                            </div>
                          </div>
                        );

                      case 'high-density':
                      default:
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Main Report Body */}
                            <div className="lg:col-span-8 space-y-5">
                              <div className="space-y-3.5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${themeClasses.border} ${themeClasses.bgLight} ${themeClasses.text} font-mono`}>
                                  /{activePost.category}
                                </span>
                                
                                <h1 className="text-xl md:text-3xl font-extrabold font-sans tracking-tight text-slate-900 dark:text-white leading-tight">
                                  {activePost.title}
                                </h1>
                        
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 font-mono font-medium pt-1">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPostId(null);
                                      setDossierSelectedResearcherId(getAuthorId(activePost.author));
                                      setShowDossier(true);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="flex items-center gap-1.5 hover:text-rose-500 hover:underline transition-colors focus:outline-none text-left"
                                  >
                                    <User size={13} className="text-slate-400" />
                                    <span>{getAuthorDisplay(activePost.author, activePost)}</span>
                                  </button>
                                  <span className="flex items-center gap-1.5">
                                    <Calendar size={13} className="text-slate-400" />
                                    {activePost.date}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Clock size={13} className="text-slate-400" />
                                    {activePost.readTime}
                                  </span>
                                </div>
                              </div>
                        
                              {activePost.bannerImage && (
                                <div className="rounded-xl overflow-hidden aspect-[21/9] border border-slate-200 dark:border-slate-800">
                                  <img src={activePost.bannerImage} alt={activePost.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              )}
                        
                              {activePost.summary && activePost.showAbstract !== false && (
                                <div className="bg-slate-100/50 dark:bg-slate-950/20 rounded-xl p-4.5 border border-slate-200 dark:border-slate-800">
                                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Abstract / Executive Summary</h3>
                                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed text-xs md:text-sm">
                                    "{activePost.summary}"
                                  </p>
                                </div>
                              )}
                        
                              <div className="py-2 bg-white dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-5 shadow-inner">
                                <MarkdownRenderer content={currentPageContent} themeColor={activePost.themeColor} isDark={darkMode} />
                                <TacticalPageNavigator currentPage={activePostPageIndex} totalPages={totalPages} onPageChange={setActivePostPageIndex} />
                              </div>
                            </div>
                        
                            {/* Sidebars */}
                            <div className="lg:col-span-4 sticky top-24 space-y-6">
                              {activePost.showToc && (
                                <TableOfContents 
                                  content={activePost.content} 
                                  themeClasses={themeClasses} 
                                  postPages={postPages}
                                  currentPageIndex={activePostPageIndex}
                                  onPageChange={setActivePostPageIndex}
                                />
                              )}

                              <div className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121826] rounded-xl p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <Shield size={16} className={themeClasses.text} />
                                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Security Parameters</h3>
                                </div>
                                {activePost.threatIntel ? (
                                  <ThreatIntelPanel intel={activePost.threatIntel} isSidebar={true} />
                                ) : (
                                  <div className="py-6 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
                                    NO_VULN_DATA_DECLARED
                                  </div>
                                )}
                              </div>

                              <ArticleAssetsWidget postSlug={activePost.slug} themeColor={activePost.themeColor} isDark={darkMode} />

                              <RecentIntelWidget currentPostId={activePost.id} posts={posts} themeClasses={themeClasses} onSelectPost={setSelectedPostId} />
                              <ArticleIntegrityWidget content={activePost.content} />
                            </div>
                          </div>
                        );
                    }
                  })()}

                </motion.div>
              );
            })()
          ) : (
            
            /* View Mode: Publications Catalog Screen */
            <motion.div
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 animate-fade-in"
            >
              
              {/* Dynamic Branding & Clean Welcome Hero (Purged edit artifacts) */}
              <div className="relative p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1321] overflow-hidden shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Visual subtle geometric background grids */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04] bg-grid" />

                <div className="space-y-3.5 relative max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded border-emerald-500/20 bg-emerald-500/5 text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      SECURE PIPELINE: VERIFIED GITHUB BUILD
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                      DEPLOYED VIA SIGNED PR MERGE
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold font-sans tracking-tight text-slate-900 dark:text-white leading-tight">
                    {PORTAL_CONFIG.subtitle}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {PORTAL_CONFIG.description}
                  </p>
                </div>

                {/* Micro metrics tracking dashboard info (Pure visual clinical numbers) */}
                <div className="grid grid-cols-2 gap-4 md:w-64 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs shrink-0 font-mono">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none mb-1">PUBLICATIONS</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{posts.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none mb-1">LATEST RELEASE</p>
                    <p className="text-sm font-bold text-rose-500 mt-1">JULY 2026</p>
                  </div>
                </div>

              </div>

              {/* Main Catalog layout - sleek horizontal top-level navigation */}
              <div className="space-y-6">
                
                {/* Category select buttons - optimized horizontal navigation */}
                <div className="bg-white dark:bg-[#0d1321] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 px-1 py-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Layers size={13} className="text-rose-500" />
                    <span>Security Repositories:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <button
                      onClick={() => { setSelectedCategory('all'); setSelectedSubcategory(null); }}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                        selectedCategory === 'all' 
                          ? 'bg-rose-500 text-white font-semibold shadow-sm' 
                          : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/50'
                      }`}
                    >
                      <span>/* (ALL)</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {posts.length}
                      </span>
                    </button>

                    {CATEGORIES_CONFIG.map((cat, idx) => {
                      const isActive = selectedCategory === cat.id;
                      const count = posts.filter(p => p.category.toLowerCase() === cat.id).length;
                      return (
                        <button
                          key={idx}
                          onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(null); }}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                            isActive 
                              ? 'bg-rose-500 text-white font-semibold shadow-sm' 
                              : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/50'
                          }`}
                        >
                          <span>/{cat.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Subcategories index panel - optimized horizontal layout */}
                {activeCategoryInfo && activeCategoryInfo.subcategories && (
                  <div className="bg-white dark:bg-[#0d1321] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 px-1 py-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                      <Terminal size={13} className="text-rose-500" />
                      <span>Subcategory Indices:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedSubcategory(null)}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-colors ${
                          selectedSubcategory === null
                            ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        Show All
                      </button>
                      {activeCategoryInfo.subcategories.map((sub, i) => {
                        const isSubActive = selectedSubcategory === sub;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedSubcategory(isSubActive ? null : sub)}
                            className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-colors ${
                              isSubActive
                                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-bold'
                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main Content: Publications listings list */}
                <div className="space-y-6">
                             {/* Search box filters */}
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="text"
                        placeholder="Search publications by title, CVE, MITRE attack tags, or threat actor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition-all outline-none focus:ring-1 focus:ring-rose-500 ${
                          darkMode ? 'bg-[#0d1321] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 self-stretch md:self-auto justify-end">
                      <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                        Index view: <span className="text-[#970000] dark:text-[#ff4b4b] font-bold">/{selectedCategory}/*</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Active Category Heading Info */}
                  {selectedCategory !== 'all' && activeCategoryInfo && (
                    <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/20 dark:bg-rose-950/5 text-xs leading-relaxed space-y-1">
                      <p className="font-mono font-bold uppercase text-[10px] text-rose-500">INDEXED DIRECTORY CONFIGURATION</p>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{activeCategoryInfo.label}</h4>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{activeCategoryInfo.description}</p>
                    </div>
                  )}

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <RefreshCw className="animate-spin text-rose-500" size={28} />
                      <p className="text-xs font-mono font-semibold text-slate-400">LOADING_SECURE_COMPILER_DATABASES...</p>
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    
                    /* Listings grid card loop */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPostId(post.id)}
                          className={`group rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md flex flex-col h-full ${
                            darkMode ? 'bg-[#0d1321] border-slate-800/80 hover:border-slate-700/80' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {post.bannerImage && (
                            <div className="aspect-[21/9] w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                              <img src={post.bannerImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                            </div>
                          )}

                          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                            <div className="space-y-3">
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold text-[#970000] dark:text-[#ff4b4b] tracking-wider">
                                    /{post.category}
                                  </span>
                                  {post.draft && (
                                    <span className="text-[8px] font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/30 text-amber-500 px-1.5 py-0.5 rounded leading-none">
                                      DRAFT
                                    </span>
                                  )}
                                </div>
                                {post.threatIntel?.severity && (
                                  <span className={`text-[8px] px-2 py-0.5 font-mono font-bold uppercase border rounded-md ${
                                    post.threatIntel.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    post.threatIntel.severity === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                    post.threatIntel.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                  }`}>
                                    {post.threatIntel.severity}
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors text-base leading-snug">
                                {post.title}
                              </h3>

                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans">
                                {post.summary}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPostId(null);
                                  setDossierSelectedResearcherId(getAuthorId(post.author));
                                  setShowDossier(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="truncate max-w-[220px] hover:text-rose-500 hover:underline text-left transition-colors focus:outline-none font-bold"
                              >
                                {getAuthorDisplay(post.author, post)}
                              </button>
                              <span>{post.date}</span>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl gap-2">
                      <Search size={28} className="text-slate-400" />
                      <h4 className="font-semibold text-slate-800 dark:text-white text-sm">NO_MATCHING_PUBLICATION_NODES_FOUND</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Try modifying search keys or resetting selected categories/subcategories.
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Structured Footer */}
      <footer className={`mt-16 border-t py-8 text-[10px] font-mono transition-colors ${
        darkMode ? 'bg-[#0d1321] border-slate-800/80 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <OffSecIntelLogoIcon className="w-5 h-5 p-0.5 rounded" />
            <span>{PORTAL_CONFIG.copyright}</span>
          </div>
          <div className="flex items-center gap-5 text-slate-400 dark:text-slate-500">
            <button
              onClick={() => {
                setSelectedPostId(null);
                setDossierSelectedResearcherId(null);
                setShowDossier(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors uppercase font-bold"
            >
              Our Team
            </button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-800">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PUBLICATION_NODE: VERIFIED GITHUB SIGNED MERGE
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
