import { BlogPost } from '../types';

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
  if (lower.includes('rahul') || lower.includes('adhikari')) {
    return 'Rahul Adhikari (ci9her)';
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
  if (lower.includes('rahul') || lower.includes('adhikari')) {
    return 'rahul';
  }
  return lower.replace(/[^a-z0-9]/g, '_');
}

export function resolveAssetUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const cleanUrl = url.startsWith('/') ? url : '/' + url;
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);
  const isGitHubPagesRepo = window.location.hostname.endsWith('github.io') && pathParts.length > 0;

  if (isGitHubPagesRepo) {
    const base = '/' + pathParts[0];
    if (cleanUrl === base || cleanUrl.startsWith(`${base}/`)) {
      return cleanUrl;
    }
    return `${base}${cleanUrl}`;
  }

  return cleanUrl;
}
