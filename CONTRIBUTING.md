# Contributing

## Branching

```
<username>/<type>/<name>   →   dev   →   main
```

- Cut every branch from `dev`. Never commit directly to `dev` or `main` — the repository ruleset blocks it.
- **One branch = one unit of work** (a feature, an iteration, or a substantial bug fix). Everything on the branch relates to that single theme.
- **Branch naming — username first**: `<username>/<type>/<name>`, where `<type>` is one of `feature`, `fix`, `test`, `chore`, `refactor`, `docs`.

  ```
  alexdos2010m/feature/guardrails
  alexdos2010m/fix/og-image-404-path
  alexdos2010m/test/url-taxonomy-guard
  ```

  This groups every branch under its author in the branch list, which is why the username leads.

## Commits

Commit after each completed, verified step — not once at the end. Multiple small related commits per branch is the norm; it keeps history bisectable and means finished work is never lost when the next step begins.

Never commit a broken tree. Before committing, `npm run lint` must pass and the tests relevant to the change must pass.

Never commit generated output — `dist/`, `coverage/`, `node_modules/` are gitignored.

### Message format

```
<type>: <imperative summary, 50-72 chars>

- what changed and why
- second point if needed
```

`<type>` is one of `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`.

Messages must be self-contained: describe the change by real file and module names, the bug's symptom, or the feature's behaviour. Do not reference internal planning documents or their identifiers.

## Promotion

Work never reaches `main` directly. It always goes through `dev` first:

1. **`<username>/<type>/<name>` → `dev`** — one pull request per branch, opened when that branch's unit of work is done. CI-gated, deploys nothing. This is the frequent step.
2. **`dev` → `main`** — batched, and only once everything accumulated on `dev` is ready to ship: a full iteration complete, a substantial bug fix done, or an end-of-sprint roll-up. **Merging to `main` deploys to production.**

## Before opening a `dev` → `main` pull request

- [ ] `npm run lint` — 0 errors
- [ ] `npm run test` — all pass
- [ ] `npm run coverage` — all four 50% thresholds hold
- [ ] `npm run build` succeeds, then `node scripts/verify-build-assets.js` passes
- [ ] `__tests__/regression/url-taxonomy.test.tsx` passes — this locks the published URLs
- [ ] `npm run start` against a fresh `dist/` — homepage, the published post and every author dossier render; deep-link refresh works
- [ ] `dist/sitemap.xml` diffed against the live sitemap — no URL removed or altered unintentionally

## Published URLs are frozen

These are live on social media and in the sitemap. They must keep resolving forever:

```
/
/?post=<slug>
/?author              (empty value = the OffSecIntel team dossier)
/?author=<researcher-id>
```

Routing logic may be refactored freely, but these URLs may not break. `__tests__/regression/url-taxonomy.test.tsx` is the guard — if a change makes it fail, the change is wrong, not the test.

## Authoring posts

See `CONTENT_GUIDELINES.md` for frontmatter, taxonomy and asset conventions.

## Tooling

Use the Node version in `.nvmrc`. Avoid GitHub Desktop for branch switching and staging on this repository — it has previously produced stale-branch and orphaned-stash states. Use the git CLI.
