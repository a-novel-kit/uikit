# A-Novel UI Storybook

This private package is the component workbench and the rendered documentation of the design system.
Its stories import the UI packages the way an application does, and its Vite configuration resolves
them to their workspace source. It applies the shared preset of `@a-novel-kit/uikit-storybook`.

## Run it

Serve it from the repository root:

```bash
pnpm storybook
```

`pnpm build` also builds the static Storybook into `storybook-static/`, which git ignores. The
`storybook` workflow publishes that build to GitHub Pages from `master`.

## Authoring conventions

- Write stories as Svelte CSF files (`*.stories.svelte`) with the maintained
  [`@storybook/addon-svelte-csf`](https://github.com/storybookjs/addon-svelte-csf), in the `src/`
  folder of their sidebar group.
- Give each story file one docs page: an attached MDX page (`<Meta of={Stories} />`), or the page
  Storybook generates for the `autodocs` tag.
- Render foundations with the real tokens, so the pages show what components use.
- Keep docs-only helpers here. A helper belongs in a published package only when an application, not
  merely Storybook, has a runtime reason to import it.
