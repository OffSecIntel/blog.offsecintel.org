import { Asset } from '../types';

export class AssetManager {
  /**
   * Fetches the complete list of assets for a given post slug.
   * Seamlessly falls back to the statically-built assets-registry.json
   * when deployed on static hosts (e.g., GitHub Pages) where the /api/ is offline.
   */
  static async getPostAssets(slug: string): Promise<Asset[]> {
    // 1. Try Live API (Local Development / Express Backend)
    try {
      const res = await fetch(`/api/posts/${slug}/assets`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // API unreachable, gracefully continue to static fallback
    }

    // 2. Static Fallback (Production / GitHub Pages)
    try {
      const registryRes = await fetch(`/blog-assets/assets-registry.json`);
      if (registryRes.ok) {
        const registry = await registryRes.json();
        return registry[slug] || [];
      }
    } catch (err) {
      console.error("AssetManager: Failed to fetch static asset registry.", err);
    }

    return [];
  }
}
