/**
 * Cross-platform `npm run clean`.
 *
 * Replaces `rm -rf`, which is not available in PowerShell / cmd — the previous
 * script silently failed for anyone developing on Windows.
 */
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const TARGETS = ['dist', 'coverage', 'server.js'];

for (const target of TARGETS) {
  rmSync(path.join(ROOT, target), { recursive: true, force: true });
  console.log(`[clean] removed ${target}`);
}
