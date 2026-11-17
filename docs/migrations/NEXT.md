# Upgrading to NEXT

uikit drops the components that duplicated another part of the system, the tokens nothing read and the empty icons
package, and states its browser baseline: Baseline widely available.

## Do I need to act?

**Required only if you import a removed component, pass `variant` to `Link`, read a removed token, or install
`@a-novel-kit/uikit-icons`.** None of the A-Novel platforms does, so they take this release as is: type checking fails
on a removed import or prop, and a removed token resolves to nothing. Layout now follows the width a component gets,
not the screen's: form and dialog actions stack full width in any container under 35rem, and description lists fall to
one column under 48rem, so a small dialog's actions stack on a desktop, and so may the actions of a form capped
narrower, such as Account's short-code form (68ch). Screenshots that show those, or `Pagination` (Account's devices
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
with a labeled button's radius and type size, and no longer glows while its menu is open. A toast's dismiss is a small
text button. Their props are unchanged; expect the screenshots that show them to change.

## Expect actions and description lists to follow their own width

`ActionGroup`, behind `FormActions` and every dialog's `actions`, stacks its actions where it has less than 35rem, and
`DescriptionList` falls to one column where it has less than 48rem, whatever the screen's width. A small dialog's
actions now stack on a desktop too. Each renders a wrapper `div` that measures its width; `class` and the other
attributes of `ActionGroup` go on that wrapper, and those of `DescriptionList` stay on the `dl`. Each takes its
parent's full width.

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
