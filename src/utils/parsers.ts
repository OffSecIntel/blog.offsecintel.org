import { BlogPost, AuthorProfile } from '../types';

export function generateNumericId(value: string): string {
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

  const fileBaseName = filename.replace(/\.md$/, '').split('/').pop() || 'untitled';
  const slug = frontmatter.slug || fileBaseName;
  const rawId = frontmatter.id?.trim();
  const id = rawId && rawId.length > 0 ? rawId : generateNumericId(slug);

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
  const showBanner = frontmatter.showBanner !== 'false';
  const layoutMode = (frontmatter.layoutMode as BlogPost['layoutMode']) || 'high-density';
  const themeColor = (frontmatter.themeColor as BlogPost['themeColor']) || 'crimson';
  const showToc = frontmatter.showToc !== 'false';
  const showAbstract = frontmatter.showAbstract !== 'false';
  const impactLevel = (frontmatter.impactLevel as BlogPost['impactLevel']) || undefined;
  const coAuthor = frontmatter.coAuthor || undefined;
  const reviewer = frontmatter.reviewer || undefined;
  const collection = frontmatter.collection || undefined;

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
    id, title, slug, category, summary, content, author, authorAlias, authorRole,
    authorBio, authorSpecialties, authorGithub, authorHtb, date, readTime, published,
    draft, bannerImage, showBanner, layoutMode, themeColor, showToc, showAbstract,
    impactLevel, coAuthor, reviewer, collection, threatIntel
  };
}

export function loadStaticMarkdownPosts(): BlogPost[] {
  const modules = (import.meta as any).glob('../posts/**/*.md', { query: '?raw', eager: true }) as Record<string, any>;
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

  const firstParagraph = content.split('\n\n')[0] || '';
  const bio = firstParagraph.replace(/[#*_\-`>]/g, '').trim();

  const specialties = frontmatter.specialties
    ? frontmatter.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
    : ['Threat Analysis'];

  const active = frontmatter.active !== undefined ? frontmatter.active !== 'false' : true;
  const published = frontmatter.published !== undefined ? frontmatter.published !== 'false' : true;

  return { id, name, alias, githubUrl, htbUrl, role, bio, specialties, content, active, published };
}

export function loadStaticAuthorProfiles(): AuthorProfile[] {
  const modules = (import.meta as any).glob('../authors/**/*.md', { query: '?raw', eager: true }) as Record<string, any>;
  const parsedProfiles: AuthorProfile[] = [];
  for (const path in modules) {
    if (Object.prototype.hasOwnProperty.call(modules, path)) {
      const rawModule = modules[path];
      const rawContent = typeof rawModule === 'string' ? rawModule : (rawModule.default || '');
      const parsed = parseAuthorProfile(path, rawContent);
      if (parsed.published) {
        parsedProfiles.push(parsed);
      }
    }
  }
  return parsedProfiles;
}
