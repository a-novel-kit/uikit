# Upgrading to the next release

Form and dialog actions follow one rule, Studio's lamp turns magenta, the file input turns compact, and uikit gains
a tag input, a chip group and a language name.

## Do I need to act?

**Required if you pass `align` to `FormActions` or `ActionGroup`, or use `--color-lamp-violet`.** Both are gone, and
type checking fails on `align` until it goes.

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
and a click anywhere on it opens the picker. Its API is unchanged, but a test that looked for the button's text now
finds none. Show a chosen image above the field, never inside it:

```svelte
<Field label="Logo">
  {#snippet children(control)}
    <div class="logo">
      {#if src}<img {src} alt="" />{/if}
      <FileInput {...control} accept="image/*" onclear={src ? remove : undefined} />
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

## Notes

- `Badge` takes `tone="accent"`, the magenta for a distinction that reports nothing, rarer than `brand`. Badges drop
  to the regular weight, so screenshots that show one change.
- A chosen ghost or text button (`aria-pressed="true"`) draws no border or glow any more: it turns blue, as the
  navigation's current item, whatever its tone. An outline button keeps its selection. Screenshots that show one
  change.
- `--layout-readable-measure-long` (80ch) bounds a short block set in a card, beside the 68ch running-text measure.
- `Card` takes `surface="ghost"`, one item of a collection: the canvas's color under a raised card's veil, ring and
  blur, lit as a raised card under the pointer.
- `TagInput` and `createTagInputController` collect tags as GitHub's topics do; `kebabTag` writes text in
  lower-kebab-case.
- `ChipGroup` picks options under a field's label, each a chip in the field's well, sized as a badge.
- `LanguageName` sets a language's flag beside its name, for every language select.
- `FileInput` takes `onclear`, a cross that removes the choice.
