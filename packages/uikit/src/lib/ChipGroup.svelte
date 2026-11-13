<!--
@component
Picks any number of short options under a label, as a field does: each option is a chip in the field's well, lit
when chosen. Each chip is a native checkbox, so the keyboard, assistive technology and the form need nothing else:
the form receives every chosen value under `name`, in the options' order, except a disabled option's, which a form
never sends; the controller keeps the order of choice. A `searchLabel` opens the well with a search that shows only
the chips whose label holds it, whatever their case and accents: a hidden chip keeps its choice, and the form still
sends it. The chips under a search scroll past the height of an open select's list. Options that name a `section`
run together under its title, in the order the sections first appear, each run set apart by a divider. On a narrow
screen, a searchable group shows only its choice, or a `placeholder`, in a field that opens the search and the chips
over the whole screen.

```svelte
<script lang="ts">
  import { ChipGroup } from "@a-novel-kit/uikit";
</script>

<ChipGroup
  legend="Genres"
  hint="Up to 10."
  name="genres"
  searchLabel="Search genres"
  options={[{ value: "fantasy", label: "Fantasy" }]}
/>
```
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { ChipGroupController as ChoiceController } from "./controllers.svelte";
  import type { SelectionOption } from "./types";

  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import { MediaQuery } from "svelte/reactivity";

  /** One chip, with the section it runs in when the group has sections. */
  export interface ChipOption extends SelectionOption<string> {
    /** Visible title of the section the chip runs in. */
    section?: string;
  }

  /** External state contract for a chip group: the chosen option values and the search over them. */
  export type ChipGroupController = ChoiceController;

  // Gathers the options by section, in the order each section first appears.
  function sectionsOf(options: readonly ChipOption[]): [string | undefined, ChipOption[]][] {
    const sections = new Map<string | undefined, ChipOption[]>();
    for (const option of options) {
      const members = sections.get(option.section);
      if (members) members.push(option);
      else sections.set(option.section, [option]);
    }
    return [...sections];
  }

  // One query for every group, made at first use: jsdom has no media queries for a group without a search.
  let narrowScreen: MediaQuery | undefined;
  function narrow() {
    narrowScreen ??= new MediaQuery("(width < 48rem)");
    return narrowScreen.current;
  }

  /** Props for a group of options that each turn on and off. */
  export interface ChipGroupProps extends Omit<HTMLFieldsetAttributes, "children"> {
    /** Visible name of the group, set as a field's label. */
    legend: Content;
    /** Supporting content rendered below the chips, before any error. */
    hint?: Content;
    /** Validation message; its presence outlines the group as invalid. */
    error?: Content;
    /** Form name of every chip. */
    name: string;
    /** The options, in the order they show, gathered by section. */
    options: readonly ChipOption[];
    /** Names the search atop the chips and shows as its placeholder; without it, the group has no search. */
    searchLabel?: string;
    /** Shown in a narrow screen's field while nothing is chosen. */
    placeholder?: string;
    /** The color a chosen chip lights in: the brand blue by default, or the rarer accent magenta. */
    tone?: "brand" | "accent";
    /** State owner of the chosen values; each group has its own by default. */
    controller?: ChipGroupController;
  }
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import RenderContent from "./Content.svelte";
  import Dialog from "./Dialog.svelte";
  import { createChipGroupController } from "./controllers.svelte";
  import { useMessages } from "./internal/i18n";
  import { matchesSearch } from "./selection";

  import { Search as SearchIcon } from "@lucide/svelte";

  const id = $props.id();

  let {
    legend,
    hint,
    error,
    name,
    options,
    searchLabel,
    placeholder,
    tone = "brand",
    controller = createChipGroupController(),
    class: className = "",
    "aria-describedby": describedBy,
    ...rest
  }: ChipGroupProps = $props();

  const { t } = useMessages();

  const chosen = $derived(controller.state.value);
  const sheet = $derived(Boolean(searchLabel) && narrow());
  const chosenOptions = $derived(chosen.flatMap((value) => options.find((option) => option.value === value) ?? []));
  const sections = $derived(sectionsOf(options));
  const shown = $derived(
    new Set(options.filter((option) => matchesSearch(option.label, controller.state.query)).map(({ value }) => value))
  );
  const hintId = $derived(hint ? `${id}-hint` : undefined);
  const errorId = $derived(error ? `${id}-error` : undefined);

  // The checkbox flips before its change event, so it takes back whatever the controller refuses.
  function choose(input: HTMLInputElement) {
    const others = chosen.filter((value) => value !== input.value);
    controller.setValue(input.checked ? [...others, input.value] : others);
    input.checked = controller.state.value.includes(input.value);
  }

  // The field shows whatever search the controller keeps.
  function search(input: HTMLInputElement) {
    controller.setQuery(input.value);
    input.value = controller.state.query;
  }

  // The search only filters: Enter never submits the form, and Escape empties the search before it closes a dialog.
  function keepSearching(event: KeyboardEvent) {
    if (event.key === "Enter") event.preventDefault();
    if (event.key !== "Escape" || controller.state.query === "") return;
    event.preventDefault();
    event.stopPropagation();
    controller.setQuery("");
  }
</script>

{#snippet well(inSheet: boolean)}
  <div class="chips" class:sheet={inSheet}>
    {#if searchLabel}
      <label class="search">
        <SearchIcon class="search-icon" aria-hidden="true" />
        <input
          type="search"
          class="query"
          aria-label={searchLabel}
          placeholder={searchLabel}
          autocomplete="off"
          spellcheck="false"
          value={controller.state.query}
          oninput={(event) => search(event.currentTarget)}
          onkeydown={keepSearching}
        />
      </label>
    {/if}
    <div class="options">
      {#each sections as [section, members], index (section)}
        <div
          class="section"
          role={section ? "group" : undefined}
          aria-labelledby={section ? `${id}-section-${index}` : undefined}
          hidden={!members.some((option) => shown.has(option.value))}
        >
          {#if section}<span id="{id}-section-{index}" class="section-title">{section}</span>{/if}
          {#each members as option (option.value)}
            <label class="chip" lang={option.lang} hidden={!shown.has(option.value)}>
              <input
                type="checkbox"
                {name}
                value={option.value}
                checked={chosen.includes(option.value)}
                defaultChecked={chosen.includes(option.value)}
                disabled={option.disabled}
                aria-invalid={error ? true : undefined}
                form={rest.form}
                onchange={(event) => choose(event.currentTarget)}
              />
              {option.label}
            </label>
          {/each}
        </div>
      {/each}
    </div>
    {#if searchLabel}
      <span class="empty" role="status">{shown.size === 0 ? t("chipGroup.empty") : ""}</span>
    {/if}
  </div>
{/snippet}

<fieldset
  class="chip-group {tone} {className}"
  class:invalid={Boolean(error)}
  class:searchable={Boolean(searchLabel)}
  {...rest}
  aria-describedby={[describedBy, hintId, errorId].filter(Boolean).join(" ") || undefined}
>
  <legend><RenderContent content={legend} /></legend>
  {#if sheet}
    <!-- A narrow screen keeps only the choice in the form, and opens the search and the chips over the whole screen. -->
    <button
      type="button"
      class="chips trigger"
      aria-haspopup="dialog"
      aria-expanded={controller.state.open}
      onclick={controller.open}
    >
      {#if chosenOptions.length > 0}
        <span class="section">
          {#each chosenOptions as option (option.value)}<Badge {tone}>{option.label}</Badge>{/each}
        </span>
      {:else}
        <span class="placeholder">{placeholder ?? t("chipGroup.placeholder")}</span>
      {/if}
    </button>
    <Dialog {controller} title={legend} presentation="fullscreen">
      {@render well(true)}
      {#snippet actions()}
        <Button onclick={controller.close}>{t("chipGroup.done")}</Button>
      {/snippet}
    </Dialog>
  {:else}
    {@render well(false)}
  {/if}
  {#if hint}<div id={hintId} class="hint"><RenderContent content={hint} /></div>{/if}
  {#if error}<div id={errorId} class="error"><RenderContent content={error} /></div>{/if}
</fieldset>

<style>
  .chip-group {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    border: 0;
    padding: 0;
    min-inline-size: 0;
  }

  /* The name reads as a field's label: regular, above the well. */
  legend {
    margin-block-end: var(--space-2);
    padding: 0;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  /* The chips sit in a field's well, which outlines only an error. */
  /* As a medium field: a button's height and the same inset, growing with its rows. */
  .chips {
    display: grid;
    align-content: center;
    gap: var(--space-1-5);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-field-border);
    border-radius: var(--radius-md);
    background: var(--chip-well);
    padding: var(--space-1) var(--space-3);
    min-block-size: var(--control-height-md);
    --chip-well: var(--color-control-surface);
  }

  /* Under a search, the well ends on its side inset, so a search that leaves a row or none still reads as a field
     rather than a line. */
  .searchable .chips:not(.trigger) {
    padding-block-end: var(--space-3);
  }

  /* The field that opens the chips' screen reads as the well it opens, showing only its choice as badges. */
  .trigger {
    cursor: pointer;
    inline-size: 100%;
    color: inherit;
    font: inherit;
    text-align: start;
  }

  .placeholder {
    color: var(--color-control-placeholder);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  /* On the chips' screen, the well fills the screen and its chips scroll under the search; a search that leaves few
     chips, or none and its status, keeps them under it. */
  .chips.sheet {
    display: flex;
    flex-direction: column;
  }

  /* The sections pack at the top of a list taller than them, as on the chips' screen. */
  .options {
    display: grid;
    align-content: start;
    gap: var(--space-2);
  }

  .section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1-5);
  }

  /* A section's title takes its own line over its chips, quieter than the group's legend. */
  .section-title {
    flex-basis: 100%;
    color: var(--color-text-hint);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  /* Under a search, a section's title stays flush under the search while its chips scroll under it. It paints the
     well's color over a dialog's, which the well shows inside a dialog: the well's own color is translucent and
     would let the chips show through. Its inset widens the band without moving the text. */
  .searchable .section-title {
    position: sticky;
    z-index: 1;
    margin-block: calc(var(--space-1) * -1);
    inset-block-start: calc((var(--focus-ring-width) + var(--border-width-strong)) * -1);
    background: linear-gradient(var(--chip-well), var(--chip-well)), var(--color-surface-island-strong);
    padding-block: var(--space-1);
  }

  /* A divider sets each shown section apart from the one before it. */
  .section:not([hidden]) ~ .section:not([hidden]) {
    border-block-start: var(--border-width-thin) solid var(--color-border-divider);
    padding-block-start: var(--space-2);
  }

  /* Under a search, the chips scroll past an open select's height, while the search stays in place. Their inset
     keeps a chip's focus ring clear of the scrolling edge, and an equal margin keeps the chips where they sat. */
  .searchable .options {
    box-sizing: border-box;
    margin: calc((var(--focus-ring-width) + var(--border-width-strong)) * -1);
    padding: calc(var(--focus-ring-width) + var(--border-width-strong));
    max-block-size: var(--control-menu-max-height);
    overflow-y: auto;
  }

  .sheet .options {
    min-block-size: 0;
    max-block-size: none;
  }

  /* A wheel stops at the list's end, as an open select's does. A finger carries on to the page, so a swipe on a
     phone never sticks in the list. */
  @media (pointer: fine) {
    .searchable .options {
      overscroll-behavior-block: contain;
    }
  }

  /* The search takes the well's first line, set as the field's text over the chips it filters. */
  .search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: text;
    min-block-size: var(--icon-size-lg);
    color: var(--color-control-placeholder);
  }

  .search :global(.search-icon) {
    flex: none;
    inline-size: var(--icon-size-sm);
    block-size: var(--icon-size-sm);
  }

  .query {
    flex: 1;
    appearance: none;
    outline: none;
    border: 0;
    background: transparent;
    padding: 0;
    min-inline-size: 0;
    color: var(--color-control-text);
    font: inherit;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  .query::placeholder {
    color: var(--color-control-placeholder);
  }

  /* A focused search, or the field that opens it, lights the well as a focused field. */
  .chip-group:has(.query:focus-visible) .chips,
  .trigger:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    --chip-well: var(--color-control-surface-focus);
  }

  /* An empty status takes no room, yet stays in the page to announce the next empty search. */
  .empty {
    color: var(--color-text-hint);
    font-size: var(--font-size-xs);
  }

  .empty:empty {
    position: absolute;
  }

  .invalid .chips {
    border-color: var(--color-feedback-error-border);
    --chip-well: var(--color-control-surface-invalid);
  }

  /* A chip takes a badge's size and type, so a chosen one reads as the tag it becomes. A real checkbox
     covers it, unseen. */
  .chip {
    display: inline-flex;
    position: relative;
    justify-content: center;
    align-items: center;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard),
      color var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    border-radius: var(--radius-sm);
    background: var(--color-action-neutral);
    padding-inline: var(--space-1-5);
    padding-block: calc(var(--space-1) / var(--multiplier-2));
    min-inline-size: var(--icon-size-lg);
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
    user-select: none;
    overflow-wrap: anywhere;
  }

  /* A chip the search misses leaves the well, its checkbox still in the form, and so does a section it empties. */
  .chip[hidden],
  .section[hidden] {
    display: none;
  }

  /* The unseen checkbox covers the chip, and reaches past its block edges to the 24px minimum target. A chip is at
     least that wide, so two short chips' targets never overlap. */
  .chip input {
    position: absolute;
    opacity: 0;
    cursor: inherit;
    margin: 0;
    inset: min(0px, calc((100% - var(--icon-size-lg)) / 2));
  }

  @media (hover: hover) {
    .chip:hover:not(:has(:checked, :disabled)) {
      background: var(--color-action-neutral-hover);
      color: var(--color-text-primary);
    }
  }

  .brand {
    --chip-fill: var(--color-label-brand);
  }

  .accent {
    --chip-fill: var(--color-label-accent);
  }

  /* Chosen, a chip reads as the badge that shows the same choice. */
  .chip:has(:checked) {
    box-shadow: 0 0 var(--space-3) color-mix(in oklab, var(--chip-fill) var(--color-mix-2), transparent);
    background: var(--chip-fill);
    color: var(--color-label-text);
  }

  /* The ring stays clear of the next chip, the chips' gap apart. */
  .chip:has(:focus-visible) {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--border-width-strong);
  }

  /* A disabled group dims its well, as a disabled TagInput does, and its chips keep their choice visible. */
  .chip:has(:disabled) {
    cursor: not-allowed;
  }

  .chip-group:disabled:not(.invalid) .chips {
    cursor: not-allowed;
    --chip-well: var(--color-control-surface-disabled);
  }

  .chip:has(:disabled:not(:checked)) {
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }

  /* A chosen option that is disabled stays visible, dimmed: the form will not send it. */
  .chip:has(:checked:disabled) {
    opacity: var(--opacity-disabled);
    box-shadow: none;
  }

  .hint,
  .error {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  /* As a field's hint: quieter than the label and slightly inset. */
  .hint {
    padding-inline: var(--space-1);
    color: var(--color-text-hint);
    font-size: var(--font-size-xs);
  }

  .error {
    color: var(--color-feedback-error-text);
  }

  /* Forced colors drop the chip's fill, so a border keeps its shape, as Badge does. */
  @media (forced-colors: active) {
    .chip {
      border: var(--border-width-thin) solid CanvasText;
    }

    /* The choice fills the chip, so the outline stays free for the focus ring. */
    .chip:has(:checked) {
      box-shadow: none;
      background: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }

    /* The fill is not forced, so neither is the ring around it. */
    .chip:has(:focus-visible) {
      outline-color: Highlight;
    }

    .chip:has(:disabled:not(:checked)) {
      border-color: GrayText;
      color: GrayText;
    }

    .chip:has(:checked:disabled) {
      opacity: 1;
      background: GrayText;
      color: Canvas;
    }
  }
</style>
