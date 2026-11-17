# Upgrading to NEXT

uikit drops the components that duplicated another part of the system, the tokens nothing read and the empty icons
package, and states its browser baseline: Baseline widely available.

## Do I need to act?

**Required only if you import a removed component, pass `variant` to `Link`, read a removed token, or install
`@a-novel-kit/uikit-icons`.** None of the A-Novel platforms does, so they take this release as is: type checking fails
on a removed import or prop, and a removed token resolves to nothing. A description list now falls to one column
where it has less than 48rem, whatever the screen's width. Screenshots that show one, or `Pagination` (Account's devices
page), change.

## Replace the removed components

| Removed                                                                          | Use instead                                                                                                                                                     |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Toolbar`, `ToolbarGroup`, `ToolbarButton`, `ToolbarToggleButton`, `ToolbarLink` | `ButtonGroup` with `Button` and `IconButton`; every control keeps its own tab stop, with no arrow keys, and `label` names the group                             |
| `ToggleButton`, `ToggleGroup`                                                    | `Button` or `IconButton` with `aria-pressed`, inside a `ButtonGroup` named with `label`, its state in a `createPressedController` you read and toggle           |
| `Popover`                                                                        | `Dialog modal={false}`, which leaves the page usable as the popover did, or a `Disclosure` for supporting content in the page's flow                            |
| `Accordion`, `AccordionItem`                                                     | `Disclosure`s sharing one `name`: where the browser supports a `details` `name`, one stays open at a time; elsewhere each opens on its own, as with `Accordion` |
| `Link variant="quiet"`                                                           | `Button variant="text" href`                                                                                                                                    |

```diff
-<ToggleButton controller={snap} variant="ghost">Snap</ToggleButton>
+<Button variant="ghost" aria-pressed={snap.state.pressed} onclick={snap.toggle}>Snap</Button>

-<Accordion>
-  <AccordionItem controller={sharing} summary="Sharing">…</AccordionItem>
-  <AccordionItem controller={exports} summary="Exports">…</AccordionItem>
-</Accordion>
+<Disclosure controller={sharing} name="preferences" summary="Sharing">…</Disclosure>
+<Disclosure controller={exports} name="preferences" summary="Exports">…</Disclosure>
```

`Link` keeps only its prose look, so its `variant` prop is gone: drop `variant="inline"`. The removed types go with
their components: `ToolbarProps`, `ToolbarGroupProps`, `ToolbarButtonProps`, `ToolbarToggleButtonProps`,
`ToolbarToggleButtonController`, `ToolbarLinkProps`, `ToggleButtonProps`, `ToggleButtonController`, `ToggleGroupProps`,
`PopoverProps`, `PopoverController`, `PopoverTriggerAttributes`, `AccordionProps`, `AccordionItemProps` and
`AccordionItemController`. `createPressedController` and `PressedController` stay.

## Stop reading the removed tokens

These tokens had no reader in any A-Novel repository and are gone:

- `--color-action-ghost-text`, `--color-action-ghost-hover`, `--color-action-ghost-hover-text`,
  `--color-action-ghost-selected`, `--color-action-ghost-selected-border` (`--color-action-ghost-hover` equaled
  `--color-action-subtle-hover`)
- `--color-feedback-info-border`, `--color-feedback-success-border`, `--color-feedback-warning-border`,
  `--color-feedback-highlight-border`
- `--color-graphic-axis`, `--color-graphic-grid`, `--color-graphic-pressure`, `--color-graphic-signal`,
  `--gradient-telemetry-grid`
- `--font-size-3xl`, `--letter-spacing-display`, `--layer-base`, `--opacity-muted`, `--opacity-overlay`, `--space-20`
- `--color-mix-7`, `--color-mix-9`

The `--multiplier-N` tokens are gone too: each one equaled its own number, so write the number,
`calc(var(--space-base) * 4)` where you wrote `calc(var(--space-base) * var(--multiplier-4))`.

`colors.css` now lists every palette step as a literal `oklch()` color, which `scripts/generate-colors.mjs` writes from
its bases. The formula variables it held (`--color-hue-*`, `--color-harmony-*`, `--color-peak-*`, `--color-scale-*`,
`--color-gamut-chroma-*`, `--color-accent-lightness-floor` and `--color-neutral-{chroma,lightness-*}`) are gone; read a
palette step or a `--base-*` color instead. Every color renders as before.

## Expect controls drawn by Button

Pagination, the ActionMenu trigger and a toast's dismiss button are now `Button`s, so they follow its rules
everywhere. Pagination's controls are small neutral ghost buttons: the page numbers turn bold, and the current page
reads as the navigation's current item, with no border or glow. The ActionMenu trigger is a neutral outline button
with a labeled button's radius and type size; while its menu is open it keeps the outline button's hover look instead
of a glow. A toast's dismiss is a small text button. Their props are unchanged; expect the screenshots that show them
to change.

## Expect description lists to follow their own width

`DescriptionList` falls to one column where it has less than 48rem, whatever the screen's width, so a list in a narrow
card stacks on a desktop too. It renders a wrapper `div` that measures its width and takes its parent's full width;
`class` and the other attributes stay on the `dl`. Form and dialog actions keep the screen's rule: full width and
stacked below 35rem, side by side at their natural width and aligned to the end above it.

## Uninstall `@a-novel-kit/uikit-icons`

The package shipped one empty canvas and no glyph. Take icons from `@lucide/svelte`, and remove the dependency:

```bash
pnpm remove @a-novel-kit/uikit-icons
```

## Notes

- uikit targets [Baseline widely available](https://web.dev/baseline). Its frosted surfaces no longer keep an opaque
  fallback for a browser without `backdrop-filter`, which no browser in that baseline is.
- `TagInput` words its tag count through i18next plural forms (`tagInput.count_zero`, `_one`, `_other`). An app that
  overrode `tagInput.none`, `tagInput.one` or `tagInput.count` overrides those three keys instead: with a numeric count,
  i18next reads the plural forms before the plain key.
