import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function copyBlogAssetsPlugin(): Plugin {
  return {
    name: 'copy-blog-assets',
    configureServer(server) {
      server.middlewares.use('/blog-assets', (req, res, next) => {
        const assetsDir = path.resolve(__dirname, 'blog-assets');
        const reqUrl = req.url || '';
        const cleanPath = reqUrl.split('?')[0];
        const filePath = path.join(assetsDir, cleanPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
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
      }
    }
  };
}

export default defineConfig(() => {
  return {
    base: './',
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
  };
});
