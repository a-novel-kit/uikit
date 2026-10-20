# Contributing to A-Novel UI

This guide covers what is specific to the design system. Set up the shared toolchain with the
[developer guide](https://a-novel-kit.github.io/stack/), and read the [README](./README.md) first for
the package map. The
[libraries, tooling, and platform concepts](https://github.com/a-novel-kit/.github/blob/master/CONTRIBUTING.md)
hold what is true of every library.

## What belongs here

A pattern belongs in uikit when an application can use it without product knowledge. Product
workflows, page shells, manuscript rendering, and screen composition stay in the application or
feature package that owns them.

Each package owns one layer of the system:

- `packages/tokens` owns every design value. Components read semantic tokens, never primitive palette
  steps.
- `packages/fonts` owns the font files, their declarations, and their licenses.
- `packages/images` owns the brand logos and their source artwork.
- `packages/icons` owns the canvas for custom glyphs. Standard icons come from `@lucide/svelte`.
- `packages/storybook-config` is the Storybook preset that the workbench and the applications share.
- `packages/storybook` is the private workbench that documents every component and foundation.

`pnpm lint` fails when a source file authors a color outside OKLCH, or when a component reads a
primitive palette token.

## Component contracts

Components are small composition primitives:

- Start from the native element that owns the behavior before adding custom keyboard or focus logic.
- Expose content and subregions as Svelte snippets rather than configuration objects.
- Keep optional presentation around the essential semantic element.
- Forward the native attributes a consumer needs, and preserve the links, values, and event handlers
  the application owns.
- Reuse the shared public types for sizes, feedback tones, layout gaps, and selectable options.
- Keep rendered state in a controller. A stateful component takes one `controller` prop, and
  `controllers.svelte.ts` exports a default factory for it.
- Style with semantic CSS tokens only.

Every exported component, type, and component-specific prop has concise JSDoc, and every public
component opens with an `@component` comment. `pnpm lint` fails when one is missing. Document what the
contract accepts or returns and how a consumer uses it. Rationale that spans packages belongs in this
guide, and source comments explain the constraints a reader cannot see in the code.

## Public API

`packages/uikit/src/lib/index.ts` is the component package boundary. Export each public component and
its types there. Internal renderers, context keys, and helpers stay unexported.

Each published package declares an explicit `exports` map, a `files` allowlist, and CSS side effects
where applicable. `pnpm build:ci` builds every package, verifies the built export targets and the
uikit barrel, and dry-runs the publish.

## Generated files

The color tokens, brand images, and vendored fonts are generated from sources in their package.
Change the source, never the generated values, and regenerate as the
[tokens](./packages/tokens/README.md#color), [images](./packages/images/README.md#reproducing-the-images),
and [fonts](./packages/fonts/README.md#reproducing-the-vendored-fonts) READMEs show. `pnpm lint` fails
when a generated color or image file drifts from its source. Review both bytes and licensing whenever
the font source list changes.

## Working on a component

Run Storybook while working on UI, and add or update stories for every public state, variant, and
composition pattern. It serves on port 6006 without opening a browser.

```bash
pnpm storybook
```

Before handing off, format the repository and run every gate CI runs:

```bash
pnpm format
pnpm lint
pnpm test:ci
pnpm build:ci
```

`pnpm test:ci` runs the unit, browser, and Storybook suites in turn. The browser and Storybook suites
need Chromium. `pnpm exec playwright install chromium` downloads it, and CI runs them in the Playwright
container image.

Storybook accessibility violations fail `pnpm test:storybook`. Fix the violation, and suppress a rule
only for a documented component constraint.

## Visual changes

CI compares every story's viewport with the reference screenshots of `master`, kept in a private
Google Drive. A pull request that changes how a story looks fails the `visual-comparison` check, which
links an **Old / New / Diff** page. A maintainer reviews that page, then adds the
`allow-screenshot-change` label. A push removes the label. New stories need no approval, and approval
never waives a failing play function or accessibility check.

## Questions?

[Open an issue](https://github.com/a-novel-kit/uikit/issues) with the component or package involved,
the expected contract, and a minimal reproduction.
