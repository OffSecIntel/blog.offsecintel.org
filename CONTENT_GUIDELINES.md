# OffSecIntel — Content Authoring Guidelines

Welcome to the authoring guide for the OffSecIntel portal. This document details how to draft, format, categorize, and publish technical security research and threat intelligence articles.

---

## 1. Site Taxonomy & Category Selection

The portal uses a strict taxonomy registry. When creating a post, you must assign it to a valid **leaf node slug** in your frontmatter (`category: <slug>`). 

### Current Taxonomy Map
```
security (Root Domain)
├── research (Pillar)
│   ├── malware-re (Malware Reverse Engineering)
│   ├── crypto-research (Cryptographic Research)
│   ├── vuln-research (Vulnerability Research)
│   └── exploit-analysis (Exploit Analysis)
├── engineering (Pillar)
│   ├── system-security (System Security & Architecture)
│   └── detection-eng (Detection Engineering)
├── intel (Pillar)
│   ├── threat-intel (Threat Intelligence Briefs)
│   └── cve-analysis (CVE Analysis)
```

**Rule:** Always map your post to the most specific leaf node (e.g., `malware-re` or `system-security`), not a pillar node like `engineering`.

---

## 2. Directory Structure & URL Formation

Blog posts live in **category-based subdirectories** under `src/posts/`.

### Directory Convention
1. Find your leaf category slug (e.g., `malware-re`).
2. Create or locate the subdirectory matching that slug: `src/posts/malware-re/`.
3. Create your markdown file inside that subdirectory (e.g., `src/posts/malware-re/my-new-post.md`).

### URL Routing (How Links Work)
The URL for your post is formed automatically based on its category and slug:
*   **Path:** `https://blog.offsecintel.org/<category-alias>?post=<slug>`
*   *Example:* `https://blog.offsecintel.org/research/malware-re?post=uncloaking-two-faced-android-game-il2cpp`

---

## 3. Blog Drafting Workflow (Step-by-Step)

1. **Create the File:** Create `src/posts/<category-slug>/<my-slug>.md`.
2. **Add Frontmatter:** Copy the YAML frontmatter block from `src/posts/templates/post-template.md`.
3. **Set Status:** While drafting, set `published: false` and `draft: true` in the frontmatter. This ensures the article never accidentally ships to the live public site during a CI/CD build.
4. **Author Content:** Write your markdown, using the local dev server (`npm run dev`) to preview live.
5. **Add Assets:** Use the "Post Assets & Artifacts" widget in the sidebar (dev mode only) to upload images, scripts, or PCAPs directly into your post's isolated `blog-assets/<slug>/` folder.
6. **Publish:** When ready for review/merge, set `published: true` and `draft: false`. Commit to your feature branch and open a PR.

---

## 4. Code Block Language Tags & Syntax Highlighting

The `MarkdownRenderer` includes specialized, highly-optimized syntax highlighters. To trigger them, always specify a language tag directly after the opening backticks of a code block.

| Language Tag | What It Does | Best For |
|---|---|---|
| `assembly`, `asm`, `armasm` | **Dedicated Assembly Highlighter.** Colors hex addresses (gold), ARM registers (cyan), mnemonics (pink), labels (green). Generically handles section prefixes (like `il2cpp:`, `.text:`). | Reverse engineering dumps, Ghidra output, raw ARM/x86 assembly. |
| `json` | **Dedicated JSON Highlighter.** Colors keys, strings, numbers, and booleans distinctly. | API responses, configuration files, decoded C2 payloads. |
| `yaml`, `yml` | **Dedicated YAML Highlighter.** | Kubernetes manifests, CI/CD pipelines, config files. |
| `js`, `ts`, `python`, `bash`, `c`, `cpp`, `rust`, etc. | **Generic Tokenizer.** Standard keyword, string, comment, and number highlighting. | Exploits, Frida scripts, backend code, terminal commands. |
| *(none)* | Renders as plain, uncolored monospace text. | Raw text dumps, hex dumps, unstructured logs. |

---

## 5. Collections & Series (Multi-Article Reading Paths)

If your post is part of a larger, structured series (like a multi-part malware analysis or a product documentation suite), you can group them into a **Collection**. 

When a post is part of a collection, it automatically gains a **Left-Hand Collapsible Sidebar** allowing users to navigate between chapters seamlessly (similar to Microsoft Learn).

1. Define the collection structure in `src/services/taxonomy/config.ts` under `COLLECTIONS_CONFIG`.
2. In your post's frontmatter, opt-in by adding the collection slug:
   ```yaml
   collections: ["android-il2cpp-series"]
   ```

---

## 6. Frontmatter Reference

Every markdown file MUST begin with valid YAML frontmatter.

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `id` | String | Yes | Unique ID string (e.g., `"uncloaking-two-faced-game"`). |
| `title` | String | Yes | Clear, clinical, descriptive title. |
| `slug` | String | Yes | URL-friendly, hyphenated equivalent of the title. |
| `summary` | String | Yes | Short 1-2 sentence overview of the research. |
| `category` | String | Yes | Leaf category slug (e.g., `malware-re`, `system-security`). |
| `author` | String | Yes | Exact name of the author (must match a name in `src/authors/`). |
| `date` | String | Yes | Publication date (`YYYY-MM-DD`). |
| `readTime` | String | Yes | Estimated reading time (`"10 min read"`). |
| `published` | Boolean | Yes | `true` for live posts, `false` to hide from builds completely. |
| `draft` | Boolean | Yes | `true` flags the post as a draft (amber UI badge). |
| `showBanner` | Boolean | No | Controls visibility of the top header vector banner. |
| `bannerImage` | String | No | Path to custom header image (e.g., `/blog-assets/slug/img.jpg`). |
| `layoutMode` | String | No | `high-density` \| `frosted-glass` \| `editorial` \| `sophisticated`. |
| `themeColor` | String | No | `crimson` \| `emerald` \| `cyan` \| `amber` \| `slate` \| `violet` \| `indigo`. |
| `showToc` | Boolean | No | Toggles the right-hand Table of Contents sidebar. |
| `showAbstract` | Boolean | No | Toggles the "Abstract / Executive Summary" box. |
| `impactLevel` | String | No | `low` \| `medium` \| `high` \| `critical`. Renders a clinical ribbon. |
| `threatIntel.*` | Objects | No | Threat indicators (e.g. `threatActor`, `iocs`, `mitreAttack`, `cves`). |
