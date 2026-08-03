import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetaManager } from '../../services/seo/metaManager';

describe('MetaManager', () => {
  beforeEach(() => {
    // Clear the document head before each test
    document.head.innerHTML = '';
    document.title = '';
  });

  it('sets default meta tags when called without options', () => {
    MetaManager.updateMeta();
    expect(document.title).toBe('OffSecIntel — Cyber Security Research & Threat Intelligence');
    
    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toContain('Technical publications by OffSecIntel');
  });

  it('updates meta tags with provided options', () => {
    MetaManager.updateMeta({
      title: 'Custom Title',
      description: 'Custom Description',
      type: 'article',
      image: '/custom/image.jpg',
      themeColor: '#ff0000',
      url: '/custom/path'
    });

    expect(document.title).toBe('Custom Title | OffSecIntel');
    
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Custom Description');
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#ff0000');
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain('/custom/image.jpg');
  });

  it('resolves absolute URLs for images', () => {
    MetaManager.updateMeta({
      image: 'https://external.com/image.png'
    });
    
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://external.com/image.png');
  });
});
