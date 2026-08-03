import { describe, it, expect, vi } from 'vitest';
import { getAuthorDisplay, getAuthorId, resolveAssetUrl } from '../../utils/helpers';
import { BlogPost } from '../../types';

describe('helpers', () => {
  describe('getAuthorDisplay', () => {
    it('returns alias if post is provided with alias', () => {
      const mockPost: Partial<BlogPost> = { author: 'John Doe', authorAlias: 'jdoe' };
      expect(getAuthorDisplay('John Doe', mockPost as BlogPost)).toBe('John Doe (jdoe)');
    });

    it('returns mapped names for internal authors', () => {
      expect(getAuthorDisplay('Nayan')).toBe('Nayan Rande (alexdos2010m)');
      expect(getAuthorDisplay('Mandar')).toBe('Mandar Kulkarni (mandark)');
      expect(getAuthorDisplay('OffSec Research')).toBe('OffSecIntel Research Desk (offsec_desk)');
      expect(getAuthorDisplay('Rahul')).toBe('Rahul Adhikari (ci9her)');
    });

    it('returns exact name for unknown authors', () => {
      expect(getAuthorDisplay('Unknown Analyst')).toBe('Unknown Analyst');
    });
  });

  describe('getAuthorId', () => {
    it('returns correct mapped IDs', () => {
      expect(getAuthorId('Nayan')).toBe('nayan');
      expect(getAuthorId('Mandar')).toBe('mandar');
      expect(getAuthorId('OffSec Research')).toBe('offsec');
      expect(getAuthorId('Rahul')).toBe('rahul');
    });

    it('returns sanitized string for unknown authors', () => {
      expect(getAuthorId('Jane Doe!')).toBe('jane_doe_');
    });
  });

  describe('resolveAssetUrl', () => {
    it('returns undefined if url is not provided', () => {
      expect(resolveAssetUrl(undefined)).toBeUndefined();
    });

    it('returns absolute URLs as is', () => {
      expect(resolveAssetUrl('http://example.com/img.jpg')).toBe('http://example.com/img.jpg');
      expect(resolveAssetUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
      expect(resolveAssetUrl('data:image/png;base64,iVBORw0KGgo')).toBe('data:image/png;base64,iVBORw0KGgo');
    });

    it('adds leading slash if missing', () => {
      expect(resolveAssetUrl('images/test.png')).toBe('/images/test.png');
    });

    it('handles GitHub Pages repos properly', () => {
      // Mock window.location for github pages scenario
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, hostname: 'user.github.io', pathname: '/repo-name/' } as any;

      expect(resolveAssetUrl('/images/test.png')).toBe('/repo-name/images/test.png');
      expect(resolveAssetUrl('images/test.png')).toBe('/repo-name/images/test.png');
      expect(resolveAssetUrl('/repo-name/images/test.png')).toBe('/repo-name/images/test.png'); // avoid double base

      window.location = originalLocation;
    });
  });
});
