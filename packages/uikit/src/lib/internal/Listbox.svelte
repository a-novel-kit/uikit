<!--
Renders the list a select or a combobox opens: its options on a floating surface, frosted over the page. The owner
keeps focus on its own control, points at the active option with `aria-activedescendant`, and turns that control's
keys into requests to a `ListboxNavigation`, which this list shares for the pointer.
-->
<script lang="ts" module>
  import type { SelectController } from "../controllers.svelte";
  import type { SelectionOption } from "../types";
  import { findEnabledBoundary, findNextEnabledIndex } from "./selection";

  import { type Snippet, tick } from "svelte";

  /** What a listbox's navigation reads from its owner, as the owner's props change. */
  export interface ListboxOwner<Value extends string> {
    /** The list's id; each option's id starts with it. */
    id: string;
    /** The options the list shows, in order. */
    options: readonly SelectionOption<Value>[];
    /** State owner that decides whether visibility and selection requests take effect. */
    controller: SelectController<Value>;
    /** The control that keeps focus while the list shows, and takes it back when a choice closes the list. */
    control: HTMLElement | null;
    /** Keeps the list closed. */
    disabled: boolean;
    /** Lets choosing the selected option again clear it. */
    allowDeselect: boolean;
  }

  /** Tracks the option a listbox's keyboard and pointer act on, and turns their moves into controller requests. */
  export class ListboxNavigation<Value extends string> {
    /** Index, in the shown options, of the option the keyboard acts on; -1 while the list is closed. */
    activeIndex = $state(-1);

    readonly #owner: () => ListboxOwner<Value>;

    constructor(owner: () => ListboxOwner<Value>) {
      this.#owner = owner;
    }

    /** The owner's current list id, options and controller. */
    get owner() {
      return this.#owner();
    }

    /** The active option, if any. */
    get active(): SelectionOption<Value> | undefined {
      return this.owner.options[this.activeIndex];
    }

    /** The active option's id while the list shows, for the control's `aria-activedescendant`. */
    get activeId() {
      return this.owner.controller.state.open && this.active ? this.optionId(this.activeIndex) : undefined;
    }

    /** Identifies the option at `index`. */
    optionId(index: number) {
      return this.owner.id + "-option-" + index;
    }

    /**
     * Indexes the option the list opens on: the enabled option at `boundary`, or without one, the selected option when
     * shown and enabled, then the first enabled option.
     */
    startIndex(boundary?: "first" | "last") {
      const { options, controller } = this.owner;
      const selected = options.findIndex((option) => option.value === controller.state.value);
      const onSelection = boundary === undefined && selected >= 0 && !options[selected].disabled;
      return onSelection ? selected : findEnabledBoundary(options, boundary ?? "first");
    }

    /** Makes the option at `index` active and scrolls it into view once it renders. */
    activate(index: number) {
      this.activeIndex = index;
      void tick().then(() => document.getElementById(this.optionId(index))?.scrollIntoView?.({ block: "nearest" }));
    }

    /** Opens on the selected option, or on the first or last enabled option when `boundary` is set. */
    open(boundary?: "first" | "last") {
      if (this.owner.disabled) return;

      this.activate(this.startIndex(boundary));
      this.owner.controller.open();
    }

    /** Asks to close the list; once it closes, `focusControl` gives the control its focus back. */
    close(focusControl = false) {
      const { controller, control } = this.owner;
      controller.close();
      if (controller.state.open) return;

      this.activeIndex = -1;
      if (focusControl) control?.focus();
    }

    /** Activates the next enabled option in `direction`, wrapping at either end. */
    move(direction: -1 | 1) {
      const { options } = this.owner;
      if (this.activeIndex >= 0) this.activate(findNextEnabledIndex(options, this.activeIndex, direction));
      else this.activate(findEnabledBoundary(options, direction === 1 ? "first" : "last"));
    }

    /** Selects an enabled option, or clears it when the list allows choosing it again, then closes the list. */
    select(option: SelectionOption<Value>) {
      if (option.disabled) return;

      const { controller, allowDeselect } = this.owner;
      controller.select(allowDeselect && controller.state.value === option.value ? undefined : option.value);
      this.close(true);
    }
  }

  /** Props for the list a select or a combobox opens. */
  export interface ListboxProps<Value extends string> {
    /** The navigation the owner's control drives. */
    navigation: ListboxNavigation<Value>;
    /** The field the list opens from: its anchor, whose width it takes. */
    anchor: HTMLElement | null;
    /** Identifies the element that names the list. */
    labelledby: string;
    /** Renders an option without changing its accessible text label. */
    renderOption?: Snippet<[SelectionOption<Value>]>;
    /** Shown in place of the options when none is shown. */
    empty?: string;
    /** Maximum height of the list before it scrolls; defaults to the menu-height token. */
    maxBlockSize?: string;
  }
</script>

<script lang="ts" generics="Value extends string">
  import FloatingSurface from "./FloatingSurface.svelte";

  import { Check as CheckIcon } from "@lucide/svelte";

  let { navigation, anchor, labelledby, renderOption, empty, maxBlockSize }: ListboxProps<Value> = $props();

  const { id, options, controller, disabled, allowDeselect } = $derived(navigation.owner);

  // An open list always has an active option, including one its controller opened.
  $effect(() => {
    if (!controller.state.open) return;
    const active = options[navigation.activeIndex];
    if (!active || active.disabled) navigation.activeIndex = navigation.startIndex();
  });

  $effect(() => {
    if (disabled && controller.state.open) navigation.close();
  });

  function handleOpenChange(open: boolean) {
    if (open) controller.open();
    else navigation.close();
  }
</script>

<FloatingSurface
  open={controller.state.open}
  source={anchor}
  {id}
  class="a-novel-listbox"
  role="listbox"
  aria-labelledby={labelledby}
  style={maxBlockSize ? "--listbox-max-block-size: " + maxBlockSize : undefined}
  onOpenChange={handleOpenChange}
>
  <div class="options">
    {#each options as option, index (option.value)}
      {@const selected = controller.state.value === option.value}
      <button
        id={navigation.optionId(index)}
        class="option"
        class:deselectable={allowDeselect}
        type="button"
        tabindex={-1}
        role="option"
        aria-label={option.label}
        lang={option.lang}
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        data-highlighted={navigation.activeIndex === index || undefined}
        data-selected={selected || undefined}
        data-disabled={option.disabled || undefined}
        disabled={option.disabled}
        onpointermove={() => {
          if (!option.disabled) navigation.activeIndex = index;
        }}
        onpointerdown={(event) => event.preventDefault()}
        onclick={() => navigation.select(option)}
      >
        <span class="content"
          >{#if renderOption}{@render renderOption(option)}{:else}{option.label}{/if}</span
        >
        {#if selected}<CheckIcon size="var(--icon-size-sm)" aria-hidden="true" />{/if}
      </button>
    {:else}
      {#if empty}<span class="empty">{empty}</span>{/if}
    {/each}
  </div>
</FloatingSurface>

<style>
  /* FloatingSurface renders the list's surface, so its rules reach it by class. */
  :global {
    .a-novel-listbox {
      display: flex;
      position-area: block-end span-inline-end;
      flex-direction: column;
      justify-self: start;
      z-index: var(--layer-dropdown);
      transition:
        translate var(--duration-fast) var(--easing-standard),
        border-color var(--duration-fast) var(--easing-standard),
        box-shadow var(--duration-fast) var(--easing-standard),
        overlay var(--duration-fast) allow-discrete,
        display var(--duration-fast) allow-discrete;
      /* Against the field's focus ring, without covering it. */
      inset-block-start: var(--border-width-strong);
      outline: none;
      box-shadow: var(--shadow-lg);
      /* A subtle border keeps the list visible past the island it opens from. */
      border: var(--border-width-thin) solid var(--color-border-subtle);
      /* The options' radius plus the padding around them, so their corners share centers. */
      border-radius: calc(var(--radius-md) + var(--space-1));
      /* The frost carries the list's color. A popover's own opaque canvas would sit under it, leaving it nothing of
         the page to blur. */
      background: none;
      padding: 0;
      inline-size: var(--floating-anchor-width);
      min-inline-size: var(--floating-anchor-width);
      max-block-size: min(calc(100dvb - var(--space-8)), var(--listbox-max-block-size, var(--control-menu-max-height)));
      overflow: clip;
      color: var(--color-text-primary);
    }

    /* The list takes the field's own well, frosted. A blur reads only what lies under its own box, so a button
       crossing the list's edge would stay sharp there: the frost reaches past the list to blur what lies beyond its
       edges too, and the list's clip trims it back to the list. It dims what it blurs, so a bright action behind the
       list stays apart from its options. */
    .a-novel-listbox::before {
      position: absolute;
      z-index: -1;
      -webkit-backdrop-filter: blur(var(--blur-md)) var(--filter-dim);
      backdrop-filter: blur(var(--blur-md)) var(--filter-dim);
      transition: opacity var(--duration-fast) var(--easing-standard);
      inset: calc(var(--blur-md) * -2);
      background: var(--color-control-surface);
      content: "";
    }

    /* Opening fades the list in as it drops a little from its field, and closing plays it back. The list's own
       opacity would cut its frost off from the page behind it, so each painted part fades on its own. A list open
       from the first render is there at once. */
    .a-novel-listbox[popover]:not(:popover-open) {
      translate: 0 calc(-1 * var(--space-1));
      box-shadow: none;
      border-color: transparent;
    }
    .a-novel-listbox[popover]:not(:popover-open) > *,
    .a-novel-listbox[popover]:not(:popover-open)::before {
      opacity: 0;
    }
  }

  @starting-style {
    :global {
      .a-novel-listbox[data-animate]:popover-open {
        translate: 0 calc(-1 * var(--space-1));
        box-shadow: none;
        border-color: transparent;
      }
      .a-novel-listbox[data-animate]:popover-open > *,
      .a-novel-listbox[data-animate]:popover-open::before {
        opacity: 0;
      }
    }
  }

  /* The options scroll inside the list, so the list's frost stays in place. */
  .options {
    display: grid;
    gap: var(--space-1);
    transition: opacity var(--duration-fast) var(--easing-standard);
    padding: var(--space-1);
    min-block-size: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-block: contain;
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    appearance: none;
    cursor: pointer;
    outline: none;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    padding: var(--space-1) var(--space-3);
    inline-size: 100%;
    min-block-size: calc(var(--control-height-sm) - var(--size-1));
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
    user-select: none;
    text-align: start;
  }

  /* The selected option's check mark sits at the row's end. */
  .option > :global(svg) {
    margin-inline-start: auto;
    color: var(--color-text-accent);
  }

  .option[data-highlighted]:not([data-selected], [data-disabled]) {
    -webkit-backdrop-filter: blur(var(--blur-sm));
    backdrop-filter: blur(var(--blur-sm));
    background: var(--color-surface-glass-hover);
    color: var(--color-navigation-hover-text);
  }

  .option[data-selected] {
    cursor: default;
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }

  .option[data-selected].deselectable:not([data-disabled]) {
    cursor: pointer;
  }

  .option[data-disabled] {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }

  /* A rendered option, such as a flag beside a name, centers in its row as a box. Set on the text's baseline instead,
     an icon leading it lifts it above the row's middle. */
  .content {
    display: flex;
    align-items: center;
  }

  .empty {
    display: block;
    padding: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  @media (forced-colors: active) {
    :global(.a-novel-listbox) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
