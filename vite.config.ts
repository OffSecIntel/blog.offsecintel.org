/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function resolveAssetFile(baseDir: string, relPath: string): string | null {
  const rootDir = path.resolve(baseDir);
  const cleanRel = relPath.replace(/^[/\\]+/, '');
  const directPath = path.resolve(baseDir, cleanRel);

  // Path traversal security check
  if (!directPath.startsWith(rootDir)) {
    return null;
  }

  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  const pathParts = cleanRel.split(/[/\\]+/).filter(Boolean);
  if (pathParts.length === 0) return null;

  function search(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile()) {
        const normFull = fullPath.replace(/\\/g, '/');
        const normRel = cleanRel.replace(/\\/g, '/');
        if (normFull.endsWith(normRel)) {
          return fullPath;
        }
        if (pathParts.length >= 2) {
          const expectedEnd = `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
          if (normFull.endsWith(expectedEnd)) {
            return fullPath;
          }
        }
      } else if (entry.isDirectory()) {
        const res = search(fullPath);
        if (res) return res;
      }
    }
    return null;
  }

  return search(baseDir);
}

function copyBlogAssetsPlugin(): Plugin {
  return {
    name: 'copy-blog-assets',
    configureServer(server) {
      server.middlewares.use('/blog-assets', (req, res, next) => {
        const assetsDir = path.resolve(__dirname, 'blog-assets');
        const reqUrl = req.url || '';
        const cleanPath = reqUrl.split('?')[0];
        const filePath = resolveAssetFile(assetsDir, cleanPath);
        if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'blog-assets');
      const distDir = path.resolve(__dirname, 'dist', 'blog-assets');
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, distDir, { recursive: true });
        console.log(`[copy-blog-assets] Successfully copied blog-assets to dist/blog-assets`);
        
        // Generate static assets.json fallback for each post directory
        const getFilesRecursive = (dir: string, baseDir: string): { name: string, type: string, size: number, url: string }[] => {
          let results: any[] = [];
          if (!fs.existsSync(dir)) return results;
          const list = fs.readdirSync(dir);
          list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
              results = results.concat(getFilesRecursive(filePath, baseDir));
            } else {
              const relPath = path.relative(baseDir, filePath).replace(/\\/g, '/');
              const ext = path.extname(file).toLowerCase();
              let type = "file";
              if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext)) type = "image";
              else if ([".js", ".ts", ".py", ".sh", ".json", ".txt", ".csv"].includes(ext)) type = "code";
              
              results.push({
                name: relPath,
                size: stat.size,
                type,
                url: `/blog-assets/${relPath}`
              });
            }
          });
          return results;
        };

        const postFolders = fs.readdirSync(srcDir);
        postFolders.forEach(folder => {
          const folderPath = path.join(srcDir, folder);
          if (fs.statSync(folderPath).isDirectory()) {
            const assetsList = getFilesRecursive(folderPath, srcDir);
            fs.writeFileSync(path.join(distDir, folder, 'assets.json'), JSON.stringify(assetsList, null, 2));
            console.log(`[copy-blog-assets] Generated assets.json for ${folder}`);
          }
        });
      }
    }
  };
}

import { execSync } from 'child_process';

const getGitCommitHash = () => {
  try {
    if (process.env.GITHUB_SHA) {
      return process.env.GITHUB_SHA.substring(0, 7);
    }
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
};

export default defineConfig(() => {
  return {
    base: './',
    define: {
      __GIT_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
    },
    plugins: [react(), tailwindcss(), copyBlogAssetsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.d.ts', 'src/setupTests.ts', 'src/**/*.md', 'src/authors/**', 'src/posts/**'],
        thresholds: {
          statements: 50,
          branches: 50,
          functions: 50,
          lines: 50
        }
      }
    }
  };
});
