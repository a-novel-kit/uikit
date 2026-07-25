# Agora UI Storybook

This private workspace package is the local component workbench and rendered design-system
documentation. It consumes `@a-novel-kit/uikit`, `@a-novel-kit/uikit-tokens`, and
`@a-novel-kit/uikit-fonts`; it is never published with those packages.

## Run it

From the repository root:

```bash
pnpm storybook
```

The workbench starts in Agora's dark theme. Its dev command sets `BROWSER=none` (and passes
`--no-open`), so it prints the local URL without opening a browser tab.

Build the static verification artifact through the repository build command. The generated
`storybook-static/` directory is ignored and is not a release artifact.

## Authoring conventions

- Put native Svelte stories under `src/components/*.stories.svelte` using the maintained
  [`@storybook/addon-svelte-csf`](https://github.com/storybookjs/addon-svelte-csf).
- Give every component one attached MDX page with usage, variants, edge states, accessibility
  contract, and API. Do not also tag that story file with `autodocs`; one docs node has one owner.
- Use Storybook's maintained doc blocks for foundations, including
  [`ColorPalette`](https://storybook.js.org/docs/api/doc-blocks/doc-block-colorpalette) and
  [`Typeset`](https://storybook.js.org/docs/api/doc-blocks/doc-block-typeset).
- Keep docs-only helpers here. A helper belongs in a published package only when a platform—not
  merely Storybook—has a runtime reason to import it.

## Toolchain note

The package follows Storybook 10.5's generated Svelte+Vite setup. It intentionally pins its private
builder to Vite 7 and the matching Svelte plugin: Vite 8's Rolldown build currently hands
Storybook's internal `.svelte` files to the JavaScript parser before the Svelte transform. The
published UI-kit remains on Vite 8; this isolated tooling pin can be removed once that integration
is fixed upstream.
