import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve(process.cwd(), 'src/posts');
const DIST_DIR = path.resolve(process.cwd(), 'dist');

console.log("=== Starting Asset Integrity Verification ===");

if (!fs.existsSync(POSTS_DIR)) {
  console.log("No posts directory found, skipping.");
  process.exit(0);
}

const getMarkdownFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
};

const markdownFiles = getMarkdownFiles(POSTS_DIR);
let missingAssetsCount = 0;
let totalChecked = 0;

// Regex to capture markdown image paths: ![alt](/path)
const imageRegex = /!\[.*?\]\((.*?)\)/g;
// Regex to capture frontmatter bannerImage: /path
const bannerRegex = /bannerImage:\s*['"]?(.*?)['"]?(?:\r?\n|$)/g;

markdownFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const references = [];

  // Extract banner images
  let match;
  while ((match = bannerRegex.exec(content)) !== null) {
    if (match[1]) references.push(match[1]);
  }

  // Extract inline images
  while ((match = imageRegex.exec(content)) !== null) {
    if (match[1]) references.push(match[1]);
  }

  references.forEach(ref => {
    // We only statically verify absolute paths that are expected to be in the dist/ root
    if (ref.startsWith('/blog-assets/') || ref.startsWith('/assets/') || ref.startsWith('/public/')) {
      totalChecked++;
      const localDistPath = path.join(DIST_DIR, ref);
      if (!fs.existsSync(localDistPath)) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Broken link found in ${path.basename(filePath)}:`);
        console.error(`        Target: ${ref}`);
        console.error(`        Missing File: ${localDistPath}`);
        missingAssetsCount++;
      }
    }
  });
});

console.log(`\nVerification Complete. Checked ${totalChecked} internal asset links.`);

if (missingAssetsCount > 0) {
  console.error(`\x1b[31m[FAIL]\x1b[0m Build failed! Found ${missingAssetsCount} broken asset links.`);
  process.exit(1); // Fail the CI Pipeline
} else {
  console.log(`\x1b[32m[PASS]\x1b[0m All referenced assets were successfully bundled!`);
  process.exit(0);
}
