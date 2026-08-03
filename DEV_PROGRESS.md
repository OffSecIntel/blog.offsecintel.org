# Dev Progress and Roadmap

## Current Progress

- **Monolithic Refactor Completed**: Successfully decomposed the 2,200-line `App.tsx` monolith into a modular component architecture.
- **Routing Engine Extracted**: Implemented `useAppRouter.ts` to manage static popstate navigation, query parameters (`?post=`, `?author=`), and browser history natively.
- **Global Context Provider**: Migrated prop-drilled variables into `AppContext.tsx` for seamless theme and catalog state distribution.
- **Domain Segmentation**: Established dedicated directories (`src/components/layout/`, `src/components/post/`, `src/components/widgets/`) for feature isolation.
- **Coverage Checkpoints**: Hit ~47% test coverage utilizing comprehensive mock structures for `AppContext` and routing logic.
- Verified the frontend build with `npm run build` targeting a static output.
- Committed Phase 1 of the structural re-organization.

## Current Focus

- **Achieve 50% Test Coverage**: Add unit tests for `PostViewer.tsx` and `AppHeader.tsx` to cross the critical threshold.
- **Documentation Overhaul**: Update `ARCHITECTURE.md` to map out the new component trees.
- Maintain support for GitHub Pages hash-based routing alongside standard pathnames.

## Future Scope

### Short-term improvements

- Introduce `vitest` unit tests for remaining complex widget components (`TableOfContents`, `TacticalPageNavigator`).
- Evaluate migrating markdown parsing entirely to an external loader plugin in Vite to save client-side parsing time.

### Medium-term goals

- Centralize URL parameter normalization and backward compatibility for legacy URL patterns natively in `useAppRouter.ts`.
- Expand testing suite for full e2e browser navigation, deep linking, and popstate behavior.

### Long-term ideas

- Migrate blog content to a dynamic backend or CMS for easier authoring.
- Add authentication/authorization for asset uploads and author tools.
- Introduce a real publish workflow with draft/review/publish stages.
