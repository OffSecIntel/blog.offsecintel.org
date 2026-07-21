# Dev Progress and Roadmap

## Current Progress

- Fixed author dossier URL synchronization so browser back/forward navigation restores the correct view.
- Added `dossier=...` query parameter support for author profile navigation.
- Updated `src/App.tsx` to restore dossier/open state on page refresh and popstate events.
- Verified the frontend build with `npm run build`.
- Verified TypeScript compilation with `npm run lint`.
- Committed the fix in Git.

## Current Focus

- Keep routing state consistent between:
  - selected category
  - selected post
  - author dossier open state
  - selected dossier researcher
- Avoid losing post content when switching to author view and then pressing browser back.
- Preserve support for GitHub Pages hash-based routing and normal pathname routing.

## Future Scope

### Short-term improvements

- Explore using a router abstraction to simplify state management and URL sync.
- Consider `React Router` for standard route handling and param parsing.
- Consider `Wouter` for a smaller, lightweight routing alternative.
- Add more explicit author/profile route handling such as `/author/:id` or `?dossier=:id`.
- Keep the current Vite + minimal JS approach for now because it preserves an ultra-light bundle and avoids a full framework rewrite.

### Medium-term goals

- Refactor routing logic so route changes are handled declaratively instead of manually via `history.pushState`.
- Centralize URL parameter parsing and state restoration in one place.
- Improve query parameter normalization and backward compatibility for legacy URL patterns.
- Add tests for navigation, deep linking, and popstate behavior.

### Long-term ideas

- Migrate blog content to a dynamic backend or CMS for easier authoring.
- Add authentication/authorization for asset uploads and author tools.
- Introduce a real publish workflow with draft/review/publish stages.
- Improve developer docs with a dedicated section for routing and deployment behavior.
