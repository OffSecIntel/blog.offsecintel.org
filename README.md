# OffSecIntel - Security Research & Malware RE Portal

A highly polished, high-performance security research publication and malware reverse-engineering portal built using **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Express**. It operates as a full-stack system that serves static, markdown-based publication cards while providing dynamic local asset management APIs and AI-assisted Threat Intel research tools.

---

## 🎨 Brand Identity Customizations
*   **OffSecIntel Shield:** A custom vector shield renders with a smooth spin rotation and crisp line pairings representing modern digital safety.
*   **Custom Brand Accent:** The branding next to the shield represents the premium emblem. The **Sec** inside **OffSecIntel** is styled in a crimson-rose theme (`OffSecIntel`), contrasting with the general slate and white typography of the layout.

---

## 📂 Multi-Stage Blog Post Asset Management
To support clinical, in-depth malware analyses and systems research, each blog post features a separate, isolated assets directory under `blog-assets/<slug>/`. This architecture bridges the gap between local research tools and zero-overhead static production hosting.

### The Staging-to-Production Asset Lifecycle:
1.  **Phase 1 — Local Asset Staging:** 
    While running the portal locally in development mode (`npm run dev`), researchers can use the **Post Assets & Artifacts** widget inside the report view sidebar.
    *   **Drag-and-Drop Upload:** Drop any decompiled native symbols, Frida scripts, network PCAP files, or screenshot diagrams directly onto the upload zone.
    *   **Automated Storage:** The local Express API catches the uploaded file and writes it immediately into `blog-assets/<slug>/` in your physical repository.
2.  **Phase 2 — Direct Markdown Integration:** 
    Once a file is uploaded, it appears in the widget listing.
    *   **Clipboard Helper:** Click the Copy icon next to any asset. The widget automatically formats and copies the exact markdown reference (e.g., `![screenshot](./blog-assets/slug/screenshot.png)` for images, or `[script.js](./blog-assets/slug/script.js)` for scripts) directly to your clipboard.
    *   **Paste & Revise:** Paste this link straight into your markdown file. It resolves using relative paths, guaranteeing perfect cross-compatibility between local previews and production builds.
3.  **Phase 3 — Git Check-In & Static Asset Commitment:**
    Commit both the completed article markdown and the newly populated `blog-assets/<slug>/` folder to your Git repository.
4.  **Phase 4 — Zero-Overhead Production Serving:**
    When the portal is compiled for production (or built by GitHub Actions), Vite bundles these directories into the optimized output. When deployed to GitHub Pages, Netlify, or similar static hosts, all these analysis assets are served as plain static files. The interactive client widget continues to display download buttons and copy helpers smoothly in the browser, completely without a backend database!

---

## 🧭 Directory URL Structures & SPA Routing
The portal uses a path-based URL resolver with a single-view, single-screen responsive canvas. It preserves deep-links dynamically in the address bar:
*   **Malware RE Category:** `/MalwareRE` (matches `malwarere` category in configuration)
*   **Security Research Category:** `/research` (matches `research` category in configuration)
*   **System Security Category:** `/security` (matches `security` category in configuration)
*   **Direct Post Deep Links:** Slugs append dynamically (e.g., `/MalwareRE?post=uncloaking-two-faced-android-game-il2cpp`). refreshing and deep links work flawlessly!

---

## 📝 Draft vs. Published State Management
All blog files support live draft state tracking:
*   **Header Flag:** Add `draft: true` or `draft: false` in the markdown YAML frontmatter.
*   **Directory Listing:** Draft articles are excluded from public listings by default.
*   **Show Drafts Control:** Authorized developers/researchers can toggle the **`SHOW_DRAFTS`** switch on the catalog dashboard to display drafts inline, flagged with an amber **[DRAFT]** badge.
*   **Preview Mode Warning:** Viewing a draft article displays a high-visibility, technical warning banner at the top of the publication page.

---

## 📑 Multipage Article Infrastructure
To accommodate very long, extensive malware analyses, intelligence briefs, or systems research books:
*   **Page Boundary Delimiter:** Simply insert `<!-- pagebreak -->` at any point in the markdown content.
*   **Dynamic Pagination:** The portal splits the post contents on these delimiters at run-time.
*   **Tactical Page Navigator:** Includes an interactive subcomponent with previous/next triggers, quick section buttons, and current progress indicators.
*   **Contextual Table of Contents:** The Table of Contents automatically refines its indices to reflect the headings present on the current page.

---

## ✍️ How to Add a New Blog Post
All blog posts are parsed from standalone markdown files inside **`src/posts/`**:
1.  Create a `.md` file inside `src/posts/` (e.g., `src/posts/new-vulnerability.md`).
2.  Add a standard YAML frontmatter block to declare post variables, severity tiers, and MITRE mapping:
    ```yaml
    ---
    title: Uncloaking the Two-Faced Android Game
    slug: uncloaking-two-faced-android-game-il2cpp
    summary: Technical analysis of a dual-behavior Android application.
    category: malwarere
    author: OffSecIntel Research
    date: 2026-07-01
    readTime: 12 min read
    published: true
    bannerImage: https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&q=80&w=1200
    layoutMode: high-density # Choose 'high-density', 'frosted-glass', or 'editorial'
    themeColor: cyan # Choose 'crimson', 'emerald', 'cyan', 'amber', 'slate', 'violet', or 'indigo'
    showToc: true
    impactLevel: critical # Choose 'critical', 'high', 'medium', 'low', 'info'
    threatIntel.threatActor: "Teenpatti RM Operators"
    threatIntel.malwareFamily: "CircleLanes Cloaker"
    threatIntel.severity: critical
    ---
    ```
3.  Save the file. It will be immediately compiled and registered into the interactive catalog interface.

---

## 👥 Researcher Profiles & Portfolios
The portal supports dynamic dossier rendering for security researchers and authors. Their profiles are managed under **`src/authors/`**:
1.  Create a `.md` file inside `src/authors/` (e.g., `src/authors/john.md`).
2.  Add a frontmatter block declaring the researcher's name, role, social links, and skills:
    ```yaml
    ---
    id: "john"                             # Matches file name and internal author ID
    name: "John Doe"
    alias: "johnd_sec"
    githubUrl: "https://github.com/johndoe"
    htbUrl: "https://www.linkedin.com/in/johndoe" # Resolves automatically to standard LinkedIn or HackTheBox icon
    role: "Senior Security Architect"
    specialties: "Cloud Security, Threat Modeling"
    ---
    Detailed bio, portfolio, or resume markdown text goes here...
    ```
3.  To link a blog post to an author, set the post's `author` frontmatter property in their `src/posts/*.md` file to match the author's exact `name` (e.g., `author: John Doe`). The portal dynamically resolves the mapping!
4.  **Show/Hide Profiles (Toggle Status):** To temporarily disable or hide a researcher's profile dossier from the portal, simply add `active: false` or `published: false` to their frontmatter block. Omitting these fields or setting them to `true` keeps the profile visible.

---

## 💻 Running & Building

### 1. Installation
Install all dependencies from the workspace root:
```bash
npm install
```

### 2. Development
Run the combined Node/Express server and Vite development environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Compilation
Bundle the client SPA assets and the Express backend server into optimized production structures:
```bash
npm run build
```

### 4. Launch Production Server
Run the compiled full-stack environment:
```bash
npm run start
```

---

## 🚀 Automated Deployment to GitHub Pages (Static Hosting)

OffSecIntel is fully optimized to be built, packed, and deployed as a **zero-overhead, static application** hosted on **GitHub Pages**, with **automated CI/CD pipelines** configured via GitHub Actions.

### 1. Zero-Cost, Static-First Architecture
This portal follows a highly elegant, local-first hybrid model:
*   **The Developer's Workstation (Local Dev):** You run the local Express server (`npm run dev`) on your machine. This gives you the full-featured, local-only staging environment where you can use the **Threat Intel Assistant** and the **Post Assets & Artifacts** upload API to manage and stage your decompiled files, scripts, and diagrams inside the repository.
*   **Production Deployment (Static Hosting):** Once you check your finished posts and assets into Git, they are built and served statically. There is no live database or server-side script running in production. This guarantees maximum security (no server vector to attack), lightning-fast loading speeds, and 100% free global hosting!

### 2. Smart SPA Routing & Refresh-Safety
Standard Single Page Applications (SPAs) that use pathname-based routing (e.g., `/MalwareRE`) will break with a standard `404 Not Found` error when a user refreshes the page on static servers like GitHub Pages, since the directories do not physically exist on the server.
*   **Automatic Host Detection:** The router inside OffSecIntel automatically detects if the site is running in a static GitHub Pages environment (e.g., under a `.github.io` subdomain or nested repository path).
*   **Hash Routing Fallback:** In static environments, it automatically falls back to secure, refresh-safe hash-based paths (e.g., `https://username.github.io/repo-name/#/MalwareRE?post=slug`). This preserves your repository's subpath, prevents 404s, and ensures deep-linked refreshes and bookmarking work flawlessly out-of-the-box!

### 3. Activating the Automated GitHub Actions Pipeline (Recommended)
We have included a pre-configured GitHub Actions deploy file at `.github/workflows/deploy.yml`. To activate automatic push-to-deploy:
1.  Push your code to your GitHub repository.
2.  Go to your repository's **Settings** tab on GitHub.
3.  In the left sidebar, click on **Pages**.
4.  Under **Build and deployment** > **Source**, change the dropdown to **GitHub Actions** (instead of "Deploy from a branch").
5.  Commit and push any change to the `main` or `master` branch. GitHub will automatically trigger the workflow, compile your optimized static assets, and deploy them to Pages in under 60 seconds!

### 4. Manual Compile & Deployment (Alternative)
If you prefer to compile the static application locally and manually deploy the output:
1.  Run the Vite compiler to produce optimized static HTML, JS, and CSS files:
    ```bash
    npx vite build
    ```
2.  All compile assets are outputted inside the `/dist/` folder.
3.  Upload the contents of the `/dist/` folder directly to GitHub Pages, Netlify, Vercel, or any static file host of your choice.

---

## 📄 Developer Documentation & Upgrading Guide
For detailed system architecture maps, REST API endpoint schemas, JSON formats, and step-by-step instructions on connecting database engines (e.g. Cloud SQL / PostgreSQL) or cloud-hosted buckets (GCS), please refer to **`DEVELOPER.md`** at the project root.
