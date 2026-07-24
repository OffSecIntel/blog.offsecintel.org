# OffSecIntel Frontend System Architecture & Engineering Blueprint

This document defines the high-level technical architecture, design patterns, taxonomy registry, SEO engine, and framework abstraction rules for `blog.offsecintel.org` and related OffSecIntel web portals.

---

## 1. Architectural Principles

1. **Pure Vanilla TypeScript Core (Zero Library Bloat)**:
   All business logic, taxonomy registries, URL parsers, SEO meta tag managers, and Markdown AST generators are built in pure Vanilla TypeScript with **zero framework dependencies**. This guarantees lightning-fast execution and easy migration to static site generator (SSG) frameworks like Jekyll, Hugo, or custom compilers.

2. **Strict UI Layer vs. Service Layer Separation**:
   - **Configuration Layer (`src/config.ts`)**: Pure JSON/TypeScript data schemas (`TAXONOMY_NODES`, `NAVIGATION_CONFIG`, `PORTAL_CONFIG`, `COLLECTIONS_CONFIG`).
   - **Service Layer (`src/services/`)**: Pure TypeScript classes (`TaxonomyRegistry`, `MetaManager`, `MarkdownParser`). Zero React or DOM rendering concerns.
   - **UI Layer (`src/components/`, `src/theme.ts`)**: Presentation-only React 19 components consuming data provided by the service layer.

3. **Convention Over Configuration for Post Frontmatter**:
   Markdown authors write clean frontmatter (`category: malware-re`, `collections: [crux]`). The taxonomy registry automatically resolves ancestral nodes, SEO metadata, theme patterns, and researcher specialty labels.

4. **Security Boundaries & Integrity Assertions**:
   - **Security Boundary**: The `published: false` flag in markdown frontmatter. Posts with `published: false` are excluded during compilation and never ship in production build artifacts.
   - **UI Presentation Flag**: `visible: boolean` in taxonomy nodes and navigation items controls UI visibility.
   - **Integrity Assertion**: `TaxonomyRegistry.validateIntegrity()` runs at startup to catch circular parent chains, orphaned nodes, duplicate aliases, and hidden parent chains.

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

## 6. Commit Message & PR Standards

All commits must follow GitHub Desktop style with a single summary line and detailed body:

```gitcommit
refactor: implement hierarchical taxonomy registry and data-driven routing

- Add TaxonomyRegistry and TaxonomyNode interfaces in src/services/taxonomy/.
- Add data-driven URL routing, alias redirects, and hierarchy-aware filtering.
- Update index.html and MetaManager title to "OffSecIntel — Cyber Security Research & Threat Intelligence".
- Decouple navigation menu from taxonomy tree via NAVIGATION_CONFIG and NavDropdown.
```
