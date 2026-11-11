<!--
@component
A text field that turns what the reader types into tags, as GitHub's topics do. A space, a comma or Enter ends a tag,
Backspace in the empty field takes the last tag back as text, and each tag's cross removes it. The default controller
writes tags in lower-kebab-case. The form receives each tag under `name`, then the text still being typed, empty
once scripting has turned it into tags, so a form without scripting still sends what was typed.
Native attributes and events target the text input; `class` styles the surrounding field.

```svelte
<script lang="ts">
  import { Field, TagInput } from "@a-novel-kit/uikit";
</script>

<Field label="Tags" hint="A space ends a tag.">
  {#snippet children(control)}
    <TagInput {...control} name="tags" maxlength={24} />
  {/snippet}
</Field>
```
-->
<script lang="ts" module>
  import type { TagInputController } from "./controllers.svelte";
  import type { ComponentSize } from "./types";

  import type { HTMLInputAttributes } from "svelte/elements";

  /** Props for a text field that collects tags. */
  export interface TagInputProps extends Omit<HTMLInputAttributes, "type" | "value"> {
    /** Sets the control height and type scale. */
    controlSize?: ComponentSize;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** State owner of the tags; each input has its own by default. */
    controller?: TagInputController;
  }
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import { createTagInputController } from "./controllers.svelte";
  import { useMessages } from "./internal/i18n";
  import { resolveInvalidState } from "./selection";

  import { X as XIcon } from "@lucide/svelte";

  let {
    controlSize = "md",
    invalid = false,
    controller = createTagInputController(),
    name,
    disabled,
    readonly,
    required,
    oninput,
    onkeydown,
    onblur,
    oncompositionend,
    "aria-invalid": ariaInvalid,
    class: className = "",
    ...rest
  }: TagInputProps = $props();

  const { t } = useMessages();

  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
  const tags = $derived(controller.state.tags);
  const editable = $derived(!disabled && !readonly);

  let field = $state<HTMLInputElement>();

  /**
   * Ends a tag at every separator; what follows the last one stays as typed. A part the controller refuses stays in
   * the field, so the writer keeps what they typed.
   */
  function takeTags(input: HTMLInputElement) {
    // Commas from other scripts end a tag too: Arabic, ideographic and full-width.
    const parts = input.value.split(/[\s,،、，]+/u);
    const typing = parts.pop() ?? "";
    if (parts.length === 0) return;

    const refused = parts.filter((part) => !controller.add(part));
    if (refused.length < parts.length) input.value = [...refused, typing].join(" ");
  }

  function finishTag(input: HTMLInputElement) {
    if (controller.add(input.value)) input.value = "";
  }

  // Text still being composed with an input method is not the writer's yet: it ends its tags once composed.
  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    oninput?.(event);
    if (!(event instanceof InputEvent && event.isComposing)) takeTags(event.currentTarget);
  }

  function handleCompositionEnd(event: CompositionEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    oncompositionend?.(event);
    takeTags(event.currentTarget);
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onkeydown?.(event);
    // WebKit sends the Enter that confirms a composition after it ends, as key code 229. Only that Enter counts:
    // Android keyboards send 229 for every key, Backspace included.
    const composing = event.isComposing || (event.key === "Enter" && event.keyCode === 229);
    if (event.defaultPrevented || composing || !editable) return;

    const input = event.currentTarget;
    if (event.key === "Enter" && input.value.trim()) {
      // A tag being typed ends here; an empty field lets Enter submit the form.
      event.preventDefault();
      finishTag(input);
    } else if (event.key === "Backspace" && input.value === "" && tags.length > 0) {
      event.preventDefault();
      const count = tags.length;
      const last = tags[count - 1];
      controller.remove(count - 1);
      if (controller.state.tags.length < count) input.value = last;
    }
  }

  // Leaving the field keeps what was typed as a tag, so pressing the form's button sends it. A blur that leaves the
  // input focused is the window losing focus, and the word being typed stays as typed.
  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onblur?.(event);
    if (document.activeElement === event.currentTarget) return;
    if (event.currentTarget.value.trim()) finishTag(event.currentTarget);
  }

  // The removed tag's button leaves the page, so the text input takes the focus it held.
  function removeTag(index: number) {
    controller.remove(index);
    field?.focus();
  }
</script>

<div class="tag-input {controlSize} {className}" class:invalid={isInvalid}>
  {#if tags.length > 0}
    <ul class="tags">
      {#each tags as tag, index (tag)}
        <li>
          <Badge tone="brand" class="tag">
            {tag}
            {#if editable}
              <button
                type="button"
                class="remove"
                aria-label={t("tagInput.remove", { tag })}
                onclick={() => removeTag(index)}
              >
                <!-- The cross follows the tag's text size, under the smallest icon. -->
                <XIcon size="1em" aria-hidden="true" />
              </button>
            {/if}
          </Badge>
          <input type="hidden" {name} value={tag} {disabled} form={rest.form} />
        </li>
      {/each}
    </ul>
  {/if}
  <input
    bind:this={field}
    type="text"
    class="control"
    autocomplete="off"
    autocapitalize="none"
    spellcheck="false"
    {name}
    {disabled}
    {readonly}
    required={required && tags.length === 0}
    aria-required={required || undefined}
    {...rest}
    aria-invalid={isInvalid || undefined}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onblur={handleBlur}
    oncompositionend={handleCompositionEnd}
  />
</div>

<style>
  .tag-input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1-5);
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-field-border);
    border-radius: var(--radius-md);
    background: var(--color-control-surface);
    inline-size: 100%;
    min-inline-size: 0;
  }

  .tags {
    display: contents;
  }

  li {
    display: flex;
    min-inline-size: 0;
  }

  /* A tag keeps its badge's look, its cross set in its text. */
  .tag-input :global(.tag) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    overflow-wrap: anywhere;
  }

  /* A button inside a field stays ghost: its icon, a color, and a light veil under the pointer. */
  .remove {
    display: grid;
    place-items: center;
    cursor: pointer;
    margin-inline-end: calc(var(--space-1) * -1);
    border-width: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    padding: 0;
    color: inherit;
    font: inherit;
  }

  /* Without scripting nothing removes a tag, so the crosses stay hidden. */
  @media (scripting: none) {
    .remove {
      display: none;
    }
  }

  @media (hover: hover) {
    .remove:hover {
      background: color-mix(in oklab, var(--color-text-inverse) var(--color-mix-2), transparent);
    }
  }

  /* The ring sits inside the badge in its text color: the brand ring would vanish on the brand badge, and an outer
     ring would cover the tag's last letter. */
  .remove:focus-visible {
    outline: var(--border-width-strong) solid var(--color-text-inverse);
    outline-offset: 0;
  }

  .control {
    flex: 1 1 var(--space-24);
    appearance: none;
    box-sizing: border-box;
    outline: none;
    border: 0;
    background: transparent;
    padding: 0;
    min-inline-size: 0;
    color: var(--color-control-text);
    font: inherit;
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  .control::placeholder {
    color: var(--color-control-placeholder);
  }

  @media (hover: hover) {
    .tag-input:hover:not(
        .invalid,
        :has(.control:disabled, .control:read-only, .control:focus-visible, .control:user-invalid)
      ) {
      background: var(--color-control-surface-hover);
    }
  }

  .tag-input:has(.control:focus-visible) {
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  @media (forced-colors: active) {
    .tag-input:has(.control:focus-visible) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  .tag-input:has(.control:disabled) {
    cursor: not-allowed;
    background: var(--color-control-surface-disabled);
  }

  .control:disabled {
    color: var(--color-control-disabled-text);
  }

  /* As Input's: an error, or a required field the form found empty, keeps its look while focused. */
  .tag-input:is(.invalid, :has(.control:user-invalid)) {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .tag-input:is(.invalid, :has(.control:user-invalid)):has(.control:focus-visible) {
    box-shadow: var(--shadow-invalid-focus-ring);
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  /* A small field keeps a small button's height once it holds a tag. */
  .sm {
    padding: calc(var(--space-1) / var(--multiplier-2)) var(--space-3);
    min-block-size: var(--control-height-sm);
    font-size: var(--font-size-sm);
  }
  .md {
    padding: var(--space-1) var(--space-3);
    min-block-size: var(--control-height-md);
    font-size: var(--font-size-md);
  }
  .lg {
    padding: var(--space-2) var(--space-4);
    min-block-size: var(--control-height-lg);
    font-size: var(--font-size-lg);
  }
</style>
