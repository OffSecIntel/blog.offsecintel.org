# OffSecIntel Frontend System Architecture & Engineering Blueprint

This document defines the high-level technical architecture, design patterns, taxonomy registry, SEO engine, and framework abstraction rules for `blog.offsecintel.org` and related OffSecIntel web portals.

---

## 1. Architectural Principles

## Frontend Application Architecture (React / Vite)

The frontend is a fully static, client-side rendered Single Page Application (SPA) built with React 19 and Vite.

### Core Architecture

- **State Management**: React Context API (`src/context/AppContext.tsx`) provides localized global state for themes, active datasets, and UI toggles without massive prop-drilling.
- **Routing Engine**: `src/hooks/useAppRouter.ts` handles browser popstate, hash navigation (`#?post=xyz`), and query parameter synchronization for GitHub Pages compatibility.
- **Markdown Hydration**: Articles are requested over HTTP as raw `.md` strings and processed client-side via custom parsers (`src/utils/parsers.ts`).

### Directory Structure

The UI components are decoupled by domain responsibility, with every individual feature and functionality meticulously documented:

1. **`src/components/layout/`**: Top-level macro components.
   - **`AppHeader.tsx`**: 
     - **Navigation Links**: Routes to Home, Research, Engineering, etc.
     - **Mobile Menu**: Responsive hamburger menu that reveals full navigation on small screens.
     - **Search Bar Toggle**: Initiates the global publication search filter.
     - **Theme Toggle (Dark/Light Mode)**: UI/UX toggle. By default, the app initializes the theme based on the user's OS system preferences (`prefers-color-scheme: dark`), but can be manually overridden and persisted.
     - **Reading Progress Bar**: A dynamic horizontal progress bar pinned to the top, showing how far a user has scrolled down a post.
   - **`AppFooter.tsx`**: 
     - **Branding**: Static copyright and organization branding.
     - **Utility Links**: Links to privacy policies, GitHub, and external socials.

2. **`src/components/post/`**: The core domain views.
   - **`PostDashboard.tsx`**: 
     - **Catalog Grid**: The primary layout rendering available threat intelligence reports in responsive cards.
     - **Category Filtering**: Renders clickable tags to filter the grid by high-level taxonomy (e.g. `malware-re`, `cryptography`).
     - **Search Integration**: Reacts to the global search query to filter posts by title, summary, CVEs, or threat actors.
     - **Dossier Trigger**: Clicking an author opens their `AuthorDossier` overlay.
   - **`PostViewer.tsx`**: 
     - **Markdown Hydration**: Intercepts the raw `.md` content and delegates rendering to `MarkdownRenderer`.
     - **Draft Mode Banner**: Displays a bright orange warning banner if a post is marked `published: false` (only visible in dev).
     - **Fallback Hero Generation**: If a post lacks a specific banner image, dynamically invokes `ThemeBannerFallback` to generate an algorithmic geometric header.
   - **`TableOfContents.tsx`**: 
     - **Scroll Spy**: Auto-highlights the current section in the sidebar as the user scrolls through a report.
     - **Smooth Scrolling**: Intercepts anchor links to smoothly scroll the window to the target heading.

3. **`src/components/widgets/`**: Reusable isolated display logic.
   - **`RecentIntelWidget.tsx`**: A sidebar widget highlighting the 3 most recently published reports.
   - **`ImpactLevelRibbon.tsx`**: A purely visual component rendering color-coded severity ribbons (Critical/High/Medium/Low).
   - **`ArticleIntegrityWidget.tsx`**: Performs client-side SHA-256 validation of the article content to prove it hasn't been tampered with.
   - **`OffSecIntelLogo.tsx`**: The SVG vector graphic of the organization's logo.

4. **`src/context/`**: Global Providers.
   - **`AppContext.tsx`**: Provides the top-level React Context. Stores the initialized `darkMode` state, the loaded `posts`, and the `authors` directory, mitigating prop-drilling across the app.

5. **`src/hooks/`**: Custom React Hooks.
   - **`useAppRouter.ts`**: The core routing engine.
     - **Popstate Listener**: Intercepts browser back/forward buttons to natively restore previous views.
     - **URL Hash Syncing**: Translates internal app states (like `selectedPostId` or `showDossier`) into clean URL hashes (`#?post=xyz`) so URLs are shareable and bookmarkable on GitHub Pages.

6. **`src/utils/` & `src/services/`**: 
   - **Taxonomy Registries**: Resolves slugs into readable categories.
   - **SEO Meta Managers**: Dynamically injects `<title>` and OpenGraph `<meta>` tags when a post is opened.
   - **Data Normalizers**: Parses frontmatter strings into strict TypeScript objects.

---

## 2. Taxonomy & URL Routing Engine

### Taxonomy Hierarchy & Graph Model

The site taxonomy uses a hierarchical Tree structure with graph-like cross-references (`relatedSlugs`):

```
security (Root Domain Node - Internal Data Classification Only)
├── research (Pillar)
│   ├── malware-re (Leaf | Aliases: malwarere, MalwareRE) ◄───[related]───► threat-intel
│   ├── crypto-research (Leaf | Aliases: cryptography)
│   ├── vuln-research (Leaf | visible: false)
│   └── exploit-analysis (Leaf | visible: false)
├── engineering (Pillar)
│   ├── system-security (Leaf | Aliases: security, systemsecurity)
│   └── detection-eng (Leaf | visible: false)
├── intel (Pillar | visible: false)
│   ├── threat-intel (Leaf | visible: false)
│   └── cve-analysis (Leaf | visible: false)
└── learning (Pillar | visible: false)
    ├── tutorials (Leaf | visible: false)
    └── tool-guides (Leaf | visible: false)
```

### URL Slug Policy (Option A: Domain-Implicit Clean Paths)

Because `blog.offsecintel.org` already signals an offensive security intelligence portal, URL paths omit the redundant `security` domain slug:

| Context | Canonical URL Path | Alias Redirects |
|---|---|---|
| Home Catalog | `https://blog.offsecintel.org/` | `#/`, `/?category=all` |
| Research Pillar | `https://blog.offsecintel.org/research` | `/#/research` |
| Malware RE Leaf | `https://blog.offsecintel.org/research/malware-re` | `/#/malwarere`, `/#/MalwareRE` |
| System Security Leaf | `https://blog.offsecintel.org/engineering/system-security` | `/#/security` |
| Article Post | `https://blog.offsecintel.org/research/malware-re?post=uncloaking-two-faced-android-game` | `/?p=1` |

---

## 3. Collections & Table of Contents (TOC) Architecture

For product suites (e.g. **Crux RE Platform**, **XDR Engine**, **Security AI Model**), articles from different taxonomy pillars can be aggregated into structured reading paths (similar to Microsoft Learn documentation).

### Data Schema (`src/services/taxonomy/types.ts`)

```typescript
export interface CollectionTocEntry {
  label: string;
  postSlug?: string;
  externalUrl?: string;
  children?: CollectionTocEntry[];
}

export interface CollectionConfig {
  slug: string;
  label: string;
  description: string;
  visible: boolean;
  icon?: string;
  toc: CollectionTocEntry[];
}
```

### Feature Gating Flags

- **Global Toggle**: `PORTAL_CONFIG.enableCollections = false` (defaults to `false` until product collections ship).
- **Collection-Level Toggle**: `CollectionConfig.visible = false`.
- **Post-Level Opt-In**: `collections: ["crux"]` in markdown frontmatter.

---

## 4. Theme & Aesthetic Resolution Priority

Theme styling and vector pattern selection resolve in the following priority order:

1. **Post Frontmatter Override** (`themeColor: crimson`, `layoutMode: high-density`) — Highest priority
2. **Taxonomy Node Default** (`TaxonomyNode.themePattern`) — Category fallback pattern (`malwarere`, `research`, `security`)
3. **Default Portal Theme** (`PORTAL_CONFIG.defaultTheme`) — Slate/Dark cyberpunk fallback

---

## 5. Collections & Collapsible Left-Hand Sidebar TOC

### Taxonomy (Category/Subcategory) vs. Collections Separation

| Component | Responsibility | Scope | Render Location |
|---|---|---|---|
| **Taxonomy (`category` / `subcategory`)** | Structural classification, clean URLs (`/research/malware-re`), search filtering | Catalog & Search Grid | Top Filter Bar & Breadcrumbs |
| **Collections (`collection`)** | Multi-part reading paths & structured chapter outlines | Article Reader View | **Left-Hand Collapsible Sidebar TOC** |

1. **Category / Subcategory**: Controls repository grid navigation, URL routing, and search filters. Subcategories do NOT build a left sidebar on the article reader view.
2. **Collection**: Controls the **Collapsible Left-Hand Sidebar TOC** on the Article Reader View (`collection: android-il2cpp-series`). If an article does not belong to a collection, no left sidebar is rendered (clean full-width layout).

---

## 6. Standard Developer Workflow & Commands

```bash
# Type-check TypeScript code (0 errors required)
npm run lint

# Build Vite static bundle & copy blog-assets/ to dist/blog-assets/
npm run build

# Start local full-stack development server (Express + Vite)
npm run dev
```

---

## 7. Commit Message & PR Standards

All commits must follow GitHub Desktop style with a single summary line and detailed body:

```gitcommit
refactor: implement hierarchical taxonomy registry and data-driven routing

- Add TaxonomyRegistry and TaxonomyNode interfaces in src/services/taxonomy/.
- Add data-driven URL routing, alias redirects, and hierarchy-aware filtering.
- Update index.html and MetaManager title to "OffSecIntel — Cyber Security Research & Threat Intelligence".
- Decouple navigation menu from taxonomy tree via NAVIGATION_CONFIG and NavDropdown.
```

---

## 8. Post Directory Convention

Blog posts are organized into **category-based subdirectories** under `src/posts/`:

```
src/posts/
├── malware-re/                 <-- Malware RE leaf category
│   ├── operation-dreambus-campaign-mapping.md
│   └── uncloaking-two-faced-android-game-il2cpp.md
├── crypto-research/            <-- Cryptographic Research leaf category
│   └── quantum-resistance-cryptographic-enclaves.md
├── system-security/            <-- System Security leaf category
│   └── CrowdStrike-&-the-WINDOWS-Screen-of-Death.md
└── templates/                  <-- Unpublished reference templates (published: false)
    └── post-template.md
```

**Convention Rules:**
1. The subdirectory name **must match** the post's `category` frontmatter value (using the taxonomy leaf slug, not pillar slug).
2. The file name should be the post's `slug` value with a `.md` extension.
3. The `templates/` directory holds unpublished blueprints (`published: false`, `draft: true`).
4. Vite's `import.meta.glob` recursively loads all `src/posts/**/*.md` files at build time — subdirectory depth is irrelevant to the loader.

---

## 9. MarkdownRenderer Language Handler Architecture

The `MarkdownRenderer` (`src/components/MarkdownRenderer.tsx`) uses a **chain-of-responsibility** pattern for syntax highlighting. Each language handler is an independent code path evaluated before the generic fallback, adhering to the **Open/Closed Principle**.

### Handler Chain (Evaluation Order)

```
Code Block → JSON handler? → YAML handler? → Assembly handler? → Generic fallback
```

### Supported Code Block Language Tags

| Language Tag(s) | Handler | Key Features |
|---|---|---|
| `json` | Dedicated | Key (cyan), string (emerald), number (amber), boolean (pink) |
| `yaml`, `yml` | Dedicated | Key (cyan), value (emerald), comment (slate italic) |
| `assembly`, `asm`, `armasm` | Dedicated | Hex addresses (amber), registers (cyan), mnemonics (pink), labels (emerald) |
| All others (`js`, `ts`, `python`, `bash`, etc.) | Generic | Keywords, strings, comments, numbers, types via regex tokenizer |

### Assembly Tokenizer Design

The assembly tokenizer splits on `(\s+|[,\[\]#():])` — the `:` in the split set is a deliberate design choice that generically handles any disassembler section prefix (e.g., `il2cpp:`, `.text:`, `segment:`) without content-specific hardcoding.

