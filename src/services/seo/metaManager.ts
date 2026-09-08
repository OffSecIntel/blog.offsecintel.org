/**
 * Unified Social Media Open Graph (OG) & Meta Tag Manager.
 * Pure Vanilla TypeScript engine for dynamic SEO, WhatsApp, Twitter/X, and LinkedIn share previews.
 */

export interface PageMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  themeColor?: string;
}

export class MetaManager {
  private static readonly DEFAULT_TITLE = 'OffSecIntel — Cyber Security Research & Threat Intelligence';
  private static readonly DEFAULT_DESCRIPTION = 'Technical publications by OffSecIntel covering vulnerability research, malware reverse engineering, detection engineering, exploit analysis, and cyber threat intelligence.';
  private static readonly DEFAULT_IMAGE = '/assets/og/offsecintel-og-default.png';
  private static readonly DEFAULT_THEME_COLOR = '#0b0f19';

  private static getAbsoluteUrl(pathOrUrl?: string): string {
    if (!pathOrUrl) {
      return typeof window !== 'undefined' ? window.location.href : 'https://blog.offsecintel.org';
    }
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
      return pathOrUrl;
    }
    const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://blog.offsecintel.org';
    return `${origin}${cleanPath}`;
  }

  private static setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
    if (typeof document === 'undefined') return;

    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  public static updateMeta(options: PageMetaOptions = {}): void {
    if (typeof document === 'undefined') return;

    const title = options.title ? `${options.title} | OffSecIntel` : this.DEFAULT_TITLE;
    const description = options.description || this.DEFAULT_DESCRIPTION;
    const imageUrl = this.getAbsoluteUrl(options.image || this.DEFAULT_IMAGE);
    const pageUrl = this.getAbsoluteUrl(options.url || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'));
    const ogType = options.type || 'website';
    const themeColor = options.themeColor || this.DEFAULT_THEME_COLOR;

    // 1. Standard HTML Title & Description
    document.title = title;
    this.setMetaTag('name', 'description', description);
    this.setMetaTag('name', 'theme-color', themeColor);

    // 2. Open Graph (WhatsApp, Facebook, LinkedIn)
    this.setMetaTag('property', 'og:site_name', 'OffSecIntel Research Center');
    this.setMetaTag('property', 'og:type', ogType);
    this.setMetaTag('property', 'og:title', title);
    this.setMetaTag('property', 'og:description', description);
    this.setMetaTag('property', 'og:image', imageUrl);
    this.setMetaTag('property', 'og:url', pageUrl);

    // 3. Twitter / X Card Metadata
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:site', '@OffSecIntel');
    this.setMetaTag('name', 'twitter:title', title);
    this.setMetaTag('name', 'twitter:description', description);
    this.setMetaTag('name', 'twitter:image', imageUrl);
  }
}
