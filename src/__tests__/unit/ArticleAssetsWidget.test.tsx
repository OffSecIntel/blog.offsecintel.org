import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ArticleAssetsWidget } from '../../components/ArticleAssetsWidget';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ArticleAssetsWidget Asset Filtering Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWidget = (assets: any[], hiddenAssets?: string[], containsLiveMalware?: boolean) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => assets
    });
    
    render(<ArticleAssetsWidget 
      postSlug="test-post" 
      themeColor="crimson" 
      isDark={false} 
      hiddenAssets={hiddenAssets}
      containsLiveMalware={containsLiveMalware}
    />);
  };

  it('positive_shows_malware_sample_when_executable_present', async () => {
    renderWidget([{ name: 'sample.apk', type: 'file', url: '/sample.apk', size: 100 }]);
    await waitFor(() => {
      expect(screen.getByText('sample.apk')).toBeInTheDocument();
      expect(screen.getByText('ANALYST_RESOURCE: MALWARE_SAMPLE')).toBeInTheDocument();
    });
  });

  it('negative_hides_malware_sample_when_in_private_folder', async () => {
    renderWidget([{ name: '/private/secret.exe', type: 'file', url: '/secret.exe', size: 100 }]);
    await waitFor(() => {
      // It should NOT be in the document
      expect(screen.queryByText('secret.exe')).not.toBeInTheDocument();
      expect(screen.queryByText('ANALYST_RESOURCE: MALWARE_SAMPLE')).not.toBeInTheDocument();
    });
  });

  it('negative_hides_malware_sample_when_explicitly_hidden_in_frontmatter', async () => {
    renderWidget(
      [{ name: 'bad.apk', type: 'file', url: '/bad.apk', size: 100 }],
      ['bad.apk']
    );
    await waitFor(() => {
      expect(screen.queryByText('bad.apk')).not.toBeInTheDocument();
      expect(screen.queryByText('ANALYST_RESOURCE: MALWARE_SAMPLE')).not.toBeInTheDocument();
    });
  });

  it('negative_disables_malware_ui_when_containsLiveMalware_is_false', async () => {
    renderWidget(
      [{ name: 'demo.apk', type: 'file', url: '/demo.apk', size: 100 }],
      undefined,
      false // containsLiveMalware = false
    );
    await waitFor(() => {
      // The file itself should be listed normally
      expect(screen.getByText('demo.apk')).toBeInTheDocument();
      // But the prominent malware section should NOT exist
      expect(screen.queryByText('ANALYST_RESOURCE: MALWARE_SAMPLE')).not.toBeInTheDocument();
    });
  });

  it('positive_shows_non_image_files_at_root', async () => {
    renderWidget([{ name: 'script.py', type: 'file', url: '/script.py', size: 100 }]);
    await waitFor(() => {
      expect(screen.getByText('script.py')).toBeInTheDocument();
    });
  });

  it('negative_hides_presentation_images_at_root', async () => {
    renderWidget([{ name: 'hero_banner.jpg', type: 'image', url: '/hero.jpg', size: 100 }]);
    await waitFor(() => {
      expect(screen.queryByText('hero_banner.jpg')).not.toBeInTheDocument();
    });
  });

  it('positive_shows_presentation_images_if_in_downloads_folder', async () => {
    renderWidget([{ name: '/downloads/hero_banner.jpg', type: 'image', url: '/hero.jpg', size: 100 }]);
    await waitFor(() => {
      expect(screen.getByText('hero_banner.jpg')).toBeInTheDocument();
    });
  });
});
