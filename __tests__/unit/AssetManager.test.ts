import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssetManager } from '../../src/utils/AssetManager';

const API = '/api/posts/my-post/assets';
const REGISTRY = '/blog-assets/assets-registry.json';

const asset = (name: string) => ({
  name,
  size: 10,
  type: 'code',
  url: `/blog-assets/my-post/${name}`,
});

/** Build a fetch stub that answers per-URL. `undefined` means "throw". */
function stubFetch(routes: Record<string, { ok: boolean; body?: unknown } | undefined>) {
  const fn = vi.fn(async (url: string) => {
    const route = routes[url];
    if (!route) throw new TypeError('Failed to fetch');
    return { ok: route.ok, json: async () => route.body } as Response;
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AssetManager.getPostAssets', () => {
  it('returns the live API payload when the dev API answers', async () => {
    const fetchMock = stubFetch({ [API]: { ok: true, body: [asset('frida.js')] } });

    await expect(AssetManager.getPostAssets('my-post')).resolves.toEqual([asset('frida.js')]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(API);
  });

  it('falls back to the static registry when the API is unreachable', async () => {
    // API throws (static host — no /api/), registry answers.
    const fetchMock = stubFetch({
      [API]: undefined,
      [REGISTRY]: { ok: true, body: { 'my-post': [asset('ioc.csv')] } },
    });

    await expect(AssetManager.getPostAssets('my-post')).resolves.toEqual([asset('ioc.csv')]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(REGISTRY);
  });

  it('falls back to the static registry when the API responds not-ok', async () => {
    stubFetch({
      [API]: { ok: false },
      [REGISTRY]: { ok: true, body: { 'my-post': [asset('dump.txt')] } },
    });

    await expect(AssetManager.getPostAssets('my-post')).resolves.toEqual([asset('dump.txt')]);
  });

  it('returns an empty list when the registry has no entry for the slug', async () => {
    stubFetch({
      [API]: { ok: false },
      [REGISTRY]: { ok: true, body: { 'a-different-post': [asset('x.js')] } },
    });

    await expect(AssetManager.getPostAssets('my-post')).resolves.toEqual([]);
  });

  it('returns an empty list when the registry responds not-ok', async () => {
    stubFetch({ [API]: { ok: false }, [REGISTRY]: { ok: false } });

    await expect(AssetManager.getPostAssets('my-post')).resolves.toEqual([]);
  });

  it('returns an empty list and logs when both the API and the registry throw', async () => {
    stubFetch({ [API]: undefined, [REGISTRY]: undefined });

    await expect(AssetManager.getPostAssets('my-post')).resolves.toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'AssetManager: Failed to fetch static asset registry.',
      expect.any(TypeError),
    );
  });

  it('encodes the slug into both request URLs', async () => {
    const fetchMock = stubFetch({
      '/api/posts/crowdstrike-windows-screen-of-death/assets': { ok: false },
      [REGISTRY]: { ok: true, body: {} },
    });

    await AssetManager.getPostAssets('crowdstrike-windows-screen-of-death');
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/posts/crowdstrike-windows-screen-of-death/assets',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, REGISTRY);
  });
});
