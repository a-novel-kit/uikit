# Upgrading to NEXT

Form and dialog actions follow one rule, Studio's lamp turns magenta, the file input turns compact, and uikit gains
a tag input, a chip group and a language name.

## Do I need to act?

**Required if you pass `align` to `FormActions` or `ActionGroup`, `defaultChecked` to `Checkbox` or `Switch`, or use
`--color-lamp-violet`.** They are gone, and type checking fails on `align` and `defaultChecked` until they go: the
controller sets a box's default now, so pass `createCheckedController({ initialChecked: true })` instead. Every app's
screenshots change anyway: actions that sat at the start of their line, with no `align`, now end it.

## Drop `align` from form and dialog actions

Every group of actions now follows one rule: side by side at the end of the line at their natural width, and stacked
full width below 35rem, the primary action last. A dialog's `actions` already did. Remove the prop:

```diff
-<FormActions align="stretch">
+<FormActions>
   <Button type="submit">Save</Button>
 </FormActions>
```

A test that measured a stretched or start-aligned action now finds it at the form's end, as wide as its label on a
wide screen and as wide as the form on a phone.

## Expect a compact file input

`FileInput` drops its "Choose a file" button. The field shows the chosen file's name, a folder icon sits at its end,
and a click anywhere on it opens the picker. Its existing props are unchanged, and it gains `onClear`, but a test
that looked for the button's text now finds none. Show a chosen image above the field, never inside it:

```svelte
<Field label="Logo">
  {#snippet children(control)}
    <div class="logo">
      {#if src}<img {src} alt="" />{/if}
      <FileInput {...control} accept="image/*" onClear={src ? remove : undefined} />
    </div>
  {/snippet}
</Field>
```

## Light Studio's lamp in magenta

`--color-lamp-violet` blended the brand blue and the magenta into a fourth hue. The lamp takes the magenta itself:

```diff
 html {
-  --color-lamp: var(--color-lamp-violet);
+  --color-lamp: var(--color-lamp-magenta);
 }
```

Nothing fails if you miss this: the unknown token leaves the lamp ember. Check the light behind the page once you
upgrade.

## Notes

- `Badge` takes `tone="accent"`, the magenta for a distinction that reports nothing, rarer than `brand`, from the new
  `--color-accent-secondary` token. Badges drop to the regular weight, so screenshots that show one change.
- A chosen ghost or text button (`aria-pressed="true"`, as a pressed `ToggleButton` or `ToolbarToggleButton` sets)
  draws no border or glow any more, but for its indicator's: it turns blue, as the navigation's current item, whatever
  its tone. An outline button keeps its selection, and a disabled ghost or text button loses its border. A disabled
  choice, on a button or a chip, stays visible, dimmed. Screenshots that show one change.
- `--layout-readable-measure-long` (80ch) bounds a short block set in a card, beside the 68ch running-text measure.
- `Card` takes `surface="ghost"`, one item of a collection: the canvas's color under a raised card's veil and blur,
  ringed as a divider, lit as a raised card under the pointer or the keyboard's focus.
- `TagInput` and `createTagInputController` collect tags as GitHub's topics do. `kebabTag` writes text in
  lower-kebab-case, and `splitTags` splits a form entry where the field ends a tag, for a server. A controller's `add`
  reports whether it took the text, so a tag it refuses stays typed.
- `ChipGroup` picks options under a field's label, each a chip in the field's well, sized as a badge.
- `Checkbox`, `Switch`, `RadioGroup` and `ChipGroup` keep their controller's choice through a form reset, as SvelteKit's
  `enhance` runs after a successful action, so the next submission sends what they show; `Combobox` keeps its shown
  label.
- `LanguageName` sets a language's flag beside its name, for every language select. `SelectionOption` takes `lang`,
  which Select, Combobox, RadioGroup and ChipGroup set on the option, so assistive technology reads each name in its
  own language.
- uikit's messages: `fileInput.choose` and `fileInput.chooseMany` are gone, and `fileInput.clear`, `tagInput.count`,
  `tagInput.none`, `tagInput.one` and `tagInput.remove` are new. An app that rewords uikit's messages updates its
  overrides.
