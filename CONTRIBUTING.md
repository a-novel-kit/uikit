# Contributing to Agora UI

The organization-wide library taxonomy lives in the
[libraries, tooling, and platform concepts](https://github.com/a-novel-kit/.github/blob/master/CONTRIBUTING.md).
Platform setup and shared commands live in the
[developer onboarding guide](https://github.com/a-novel-kit/.github/blob/master/README.md). Read the
[README](./README.md) first for this repository's package map.

## Package boundaries

- `packages/uikit` contains generic, styled Svelte components and their public TypeScript
  contracts.
- `packages/tokens` owns primitive and semantic design values. Components consume semantic
  tokens rather than raw palette steps.
- `packages/fonts` owns the self-hosted font files, declarations, and required license copies.
- `packages/icons` owns the curated icon vocabulary and custom Agora glyphs.
- `packages/storybook-config` is the published Storybook preset used by this workbench and client
  repositories.
- `packages/storybook` is the private workbench and design-system documentation site.

Product-specific workflows, page shells, manuscript rendering, and screen composition stay in their
feature or client repository. Move a pattern into the UI kit only when it is useful without Agora
domain knowledge.

## Component contracts

Components are small composition primitives:

- prefer native HTML behavior before adding a headless primitive;
- expose content and subregions as Svelte snippets instead of growing configuration objects;
- keep optional presentation around the essential semantic element;
- forward appropriate native attributes and preserve application-owned links, values, and event
  handlers;
- use the shared public types for sizes, feedback tones, layout gaps, and selectable options;
- style with semantic CSS tokens only.

Every exported component, type, and component-specific prop has concise JSDoc. Document what the
contract accepts or returns and how a consumer uses it. Maintainer rationale that spans packages
belongs here; local comments are reserved for non-obvious implementation constraints.

## Public API

`packages/uikit/src/lib/index.ts` is the component package boundary. Export each public component
and its types there. Internal renderers, context keys, and primitive adapters remain unexported.

Each published package declares an explicit `exports` map, a `files` allowlist, and CSS side
effects where applicable. The package contract check verifies built export targets and the UI-kit
barrel before CI tests run.

## Generated assets

`packages/tokens/colors.css` and `packages/tokens/palette.js` are generated from
`packages/tokens/scripts/generate-colors.mjs`. Change the compact derivation inputs and regenerate
the artifacts rather than editing generated values.

The font vendoring script downloads pinned upstream faces, converts the required OpenType files,
and copies their licenses. Review both bytes and licensing whenever its source list changes.

## Component workflow

Run `pnpm storybook` while working on UI and add or update stories for every public state,
variant, and composition pattern. The command disables automatic browser opening; use the printed
local URL.

Before handoff, format the repository and run its lint, test, build, and package-contract scripts.
Storybook accessibility checks are test failures, so resolve violations instead of suppressing
them without a documented component constraint.

## Questions?

[Open an issue](https://github.com/a-novel-kit/uikit/issues) with the component or package involved,
the expected contract, and a minimal reproduction.
