---
id: "post-template"
title: "Technical Publication Blueprint: Formatting Guidelines & Content Template"
slug: "post-template"
summary: "A reference blueprint for authors detailing metadata schemas, markdown layout configurations, pagination, and threat intelligence mapping."
category: "research"
author: "Template Author"
date: "2026-07-21"
readTime: "5 min read"
published: false
draft: true
showBanner: true
layoutMode: "sophisticated"
themeColor: "indigo"
showToc: true
showAbstract: true
impactLevel: "medium"
threatIntel.threatActor: "Sample Threat Actor"
threatIntel.malwareFamily: "Sample Malware Family"
threatIntel.cves: "CVE-2026-0001, CVE-2026-0002"
threatIntel.mitreAttack: "Initial Access|Phishing|T1566, Execution|User Execution|T1204"
threatIntel.iocs: "sha256|0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef|Malicious Stage-1 Dropper, domain|malicious-c2-beacon.local|Active command and control endpoint"
threatIntel.severity: "high"
threatIntel.confidenceScore: "85"
threatIntel.affectedSystems: "Enterprise Domain Controllers, Windows 11 Workstations"
---

# Technical Publication Blueprint: Formatting Guidelines

This document serves as both a structural blueprint and an interactive guidelines template for adding new blog posts to this secure threat research repository. When creating a new post, copy the frontmatter and markdown structures defined below.

---

## 🚀 1. Frontmatter Metadata Configuration

Every post must begin with a YAML frontmatter block. Below is the documentation of each available parameter:

| Parameter | Type | Required? | Accepted Values / Description |
|---|---|---|---|
| `id` | String | Yes | Unique ID string (e.g., `"uncloaking-two-faced-game"`). |
| `title` | String | Yes | Clear, clinical, descriptive title of the publication. |
| `slug` | String | Yes | URL-friendly, hyphenated equivalent of the title. |
| `summary` | String | Yes | Short 1-2 sentence overview of the research content. |
| `category` | String | Yes | `malwarere` \| `research` \| `security`. Selects the abstract header banner vector motif. |
| `author` | String | Yes | Exact name of the author. Must match the `name` field in `/src/authors/<author_id>.md`. |
| `date` | String | Yes | Publication date in `YYYY-MM-DD` format. |
| `readTime` | String | Yes | Estimated reading time (e.g., `"10 min read"`). |
| `published` | Boolean | Yes | Set to `false` to prevent the post from displaying in production lists. |
| `draft` | Boolean | Yes | Set to `true` to flag the post as a draft during development. |
| `showBanner` | Boolean | No | `true` \| `false`. Controls whether the banner area displays at the top of the article. |
| `bannerImage` | String | No | Path to header image (e.g., `/blog-assets/my-post/image.jpg`). If omitted, uses high-tech SVG fallbacks. |
| `layoutMode` | String | No | `high-density` \| `frosted-glass` \| `editorial` \| `sophisticated` \| `professional`. |
| `themeColor` | String | No | `crimson` \| `emerald` \| `cyan` \| `amber` \| `slate` \| `violet` \| `indigo`. Sets accent colors. |
| `showToc` | Boolean | No | `true` \| `false`. Toggles the Table of Contents sidebar. |
| `showAbstract` | Boolean | No | `true` \| `false`. Toggles the "Abstract / Executive Summary" container. |
| `impactLevel` | String | No | `low` \| `medium` \| `high` \| `critical`. Places a clinical ribbon on the article. |

<!-- pagebreak -->

## 📑 2. Writing Multi-Page Content (Pagination)

For long-form, highly detailed technical guides, you can split content into clean sequential pages. This improves reader focus and prevents infinite vertical scrolling.

### The Pagebreak Tag
To introduce a page boundary, insert the HTML comment tag:
`<!-- pagebreak -->` on a blank line.

The platform's markdown parser will automatically:
- Split the post into multiple pages.
- Mount the responsive `TacticalPageNavigator` progress indicator at both the top and bottom of the article.
- Integrate the active page state with the Table of Contents.

<!-- pagebreak -->

## 🎨 3. Markdown Formatting Features

### Standard Markdown Elements
The built-in parser supports standard markdown structures styled directly with Tailwind CSS variables:

- **Bold text** (`**bold**`), *italic text* (`*italic*`), and `inline code` (using backticks).
- **Blockquotes:**
  > "This is a styled blockquote container used to highlight key threat intelligence takeaways or direct analyst quotes."

### Tables
Tables must be well-formed with headers and alignment options. The renderer will automatically frame them in high-contrast grid layouts.

### Lists
Unordered and ordered lists render with customized markers:
1.  **First point:** Nested descriptions look cleaner with proper indentation.
    -   Use bullet points for secondary specifications.
2.  **Second point:** Standard multi-step analytical methodology representation.

### Responsive Markdown Images
Standard markdown image syntax `![Alt Caption Text](URL)` is compiled natively:
`![Figure 1: High-tech enclave perimeter defense conceptual illustration.](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200)`

The output will automatically include:
- A responsive image element with rounded corners.
- A subtle outer border to fit light and dark mode styles.
- A centered, italicized caption displaying the alternative text.

<!-- pagebreak -->

## 🛡️ 4. Structured Threat Intelligence (IOCs & MITRE)

Our metadata processor maps the custom `threatIntel` frontmatter variables into clinical tabular sidebars or expandable threat cards inside the article view:

### Indicators of Compromise (IOCs)
List IOCs in the frontmatter `threatIntel.iocs` parameter using the format:
`[type]|[value]|[description]`, separated by commas. Supported types: `sha256`, `md5`, `ip`, `domain`, `url`, `registry`.

### MITRE ATT&CK Mapping
Specify mappings in `threatIntel.mitreAttack` using the format:
`[Tactic]|[Technique]|[ID]`, separated by commas. These render as color-coordinated tactical badges for defenders.
