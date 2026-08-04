import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('src/posts');
const DIST_DIR = path.resolve('dist');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');
const BASE_URL = 'https://blog.offsecintel.org';

function generateSitemap() {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  let urls = [`  <url>\n    <loc>${BASE_URL}/</loc>\n    <priority>1.0</priority>\n  </url>`];

  function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (match) {
          const frontmatter = match[1];
          let slug = entry.name.replace(/\.md$/, '');
          
          // Try to extract slug from frontmatter
          const slugMatch = frontmatter.match(/^slug:\s*(.*)$/m);
          if (slugMatch) {
            slug = slugMatch[1].trim();
          }

          // Check if post is published and not a draft
          const publishedMatch = frontmatter.match(/^published:\s*(true|false)$/m);
          const isPublished = publishedMatch ? publishedMatch[1].trim() === 'true' : false;
          
          const draftMatch = frontmatter.match(/^draft:\s*(true|false)$/m);
          const isDraft = draftMatch ? draftMatch[1].trim() === 'true' : false;

          if (!isPublished || isDraft) {
            continue; // Skip generating URL for this post
          }

          // Generate URL
          const url = `${BASE_URL}/?post=${slug}`;
          urls.push(`  <url>\n    <loc>${url}</loc>\n    <priority>0.8</priority>\n  </url>`);
        }
      }
    }
  }

  searchDir(POSTS_DIR);

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf-8');
  console.log(`[SEO] Successfully generated sitemap.xml at ${SITEMAP_PATH} with ${urls.length} URLs.`);
}

generateSitemap();
