/**
 * URL taxonomy regression guard.
 *
 * These URLs are published on social media and in the sitemap. They MUST keep
 * resolving to the same view forever. This suite locks each one to the exact
 * { category, postId, dossierId } that `parseStateFromUrl` must return.
 *
 * If a routing refactor changes any assertion here, the refactor is wrong — not
 * the test. Update this file only when a URL form is deliberately retired.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { parseStateFromUrl } from '../../src/hooks/useAppRouter';

// Mirrors the real published post: src/posts/malware-re/uncloaking-two-faced-android-game-il2cpp.md
const POSTS: any = [
  {
    id: 'uncloaking-two-faced-android-game-il2cpp',
    slug: 'uncloaking-two-faced-android-game-il2cpp',
    category: 'malware-re',
  },
];

/** Reset path, search and hash between cases. */
function setUrl(pathAndSearch: string, hash = '') {
  window.history.pushState({}, '', pathAndSearch || '/');
  window.location.hash = hash;
}

beforeEach(() => setUrl('/'));

describe('frozen social / sitemap URLs — search-param form', () => {
  it('/ -> home catalog', () => {
    setUrl('/');
    const s = parseStateFromUrl(POSTS);
    expect(s).toMatchObject({ category: 'all', postId: null, dossierId: null });
  });

  it('/?post=<slug> -> that post, category follows the post', () => {
    setUrl('/?post=uncloaking-two-faced-android-game-il2cpp');
    const s = parseStateFromUrl(POSTS);
    expect(s.postId).toBe('uncloaking-two-faced-android-game-il2cpp');
    expect(s.category).toBe('malware-re');
    expect(s.dossierId).toBeNull();
  });

  it('/?author (no value) -> offsec team dossier', () => {
    setUrl('/?author');
    expect(parseStateFromUrl(POSTS).dossierId).toBe('offsec');
  });

  it('/?author= (empty value) -> offsec team dossier', () => {
    setUrl('/?author=');
    expect(parseStateFromUrl(POSTS).dossierId).toBe('offsec');
  });

  it.each(['nayanrande', 'mandarjk', 'rahuladhikari'])(
    '/?author=%s -> that researcher dossier',
    (id) => {
      setUrl(`/?author=${id}`);
      const s = parseStateFromUrl(POSTS);
      expect(s.dossierId).toBe(id);
      expect(s.postId).toBeNull();
    },
  );
});

describe('frozen URLs — hash form (GitHub Pages fallback / in-app navigation)', () => {
  it('#?post=<slug> -> that post', () => {
    setUrl('/', '#?post=uncloaking-two-faced-android-game-il2cpp');
    const s = parseStateFromUrl(POSTS);
    expect(s.postId).toBe('uncloaking-two-faced-android-game-il2cpp');
    expect(s.category).toBe('malware-re');
  });

  it('#?author -> offsec dossier', () => {
    setUrl('/', '#?author');
    expect(parseStateFromUrl(POSTS).dossierId).toBe('offsec');
  });

  it('#?author=nayanrande -> that researcher', () => {
    setUrl('/', '#?author=nayanrande');
    expect(parseStateFromUrl(POSTS).dossierId).toBe('nayanrande');
  });
});

describe('category path + alias resolution (real taxonomy instance)', () => {
  it.each([
    ['#/malwarere', 'malware-re'],
    ['#/MalwareRE', 'malware-re'],
    ['#/research/malware-re', 'malware-re'],
    ['#/security', 'system-security'],
    ['#/engineering/system-security', 'system-security'],
    ['#/crypto-research', 'crypto-research'],
  ])('%s -> category %s', (hash, expected) => {
    setUrl('/', hash);
    expect(parseStateFromUrl(POSTS).category).toBe(expected);
  });

  it('unknown category path falls back to "all"', () => {
    setUrl('/', '#/does-not-exist');
    expect(parseStateFromUrl(POSTS).category).toBe('all');
  });
});

describe('combined params', () => {
  it('?post wins the category even with a category path present', () => {
    setUrl('/', '#/crypto-research?post=uncloaking-two-faced-android-game-il2cpp');
    const s = parseStateFromUrl(POSTS);
    expect(s.postId).toBe('uncloaking-two-faced-android-game-il2cpp');
    expect(s.category).toBe('malware-re');
  });

  it('unknown ?post slug is ignored (no crash, no post)', () => {
    setUrl('/?post=no-such-post');
    const s = parseStateFromUrl(POSTS);
    expect(s.postId).toBeNull();
    expect(s.category).toBe('all');
  });
});
