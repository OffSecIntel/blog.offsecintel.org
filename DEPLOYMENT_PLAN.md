# Deployment & Launch Plan

## Phase 1: Pre-Deployment Readiness (Completed)
- [x] **Monolithic Refactor:** Component architecture fully modularized.
- [x] **Documentation:** Feature mapping and architecture guidelines updated.
- [x] **Test Coverage Baseline:** Achieved >58% Lines and ~49% Branches (near the 50% target).
- [x] **SEO Foundation:** Injected `<meta name="google-site-verification" />` placeholder into `index.html`.

## Phase 2: SEO Verification & Analytics (Completed)
- [x] **Google Search Console Verification:**
  - Auto-verified via existing Root Domain DNS ownership. Placeholder tag removed to maintain clean HTML.

## Phase 3: CI/CD Pipeline & Deployment
- [ ] **Push to Origin (Dev Integration):**
  - Push the `dev` branch to the remote repository.
- [ ] **Pull Request to Main (Production Release):**
  - Create a PR from `dev` to `main`.
  - Ensure automated CI checks (if any) pass. *Note: If a strict 50% branch coverage threshold is enforced by CI, we may need to write 1-2 additional tests to cross the 48.92% mark.*
- [ ] **Merge and Deploy:**
  - Merge into `main` to trigger the GitHub Pages deployment pipeline.
  - Verify the live site at `blog.offsecintel.org` (or `offsecintel.github.io`).

## Phase 4: Post-Deployment Verification
- [ ] **Functionality Check:** Verify deep links, dark mode toggle, and markdown rendering on the live domain.
- [ ] **Google Search Console Check:** Click "Verify" in the Search Console dashboard and ensure it successfully detects the meta tag.
- [ ] **Sitemap Submission:** Generate and submit a `sitemap.xml` (or point Google to your URL endpoints) for faster indexing.
