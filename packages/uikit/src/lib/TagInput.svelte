<!--
@component
A text field that turns what the reader types into tags, as GitHub's topics do. A space, a comma or Enter ends a tag,
Backspace in the empty field takes the last tag back as text, and each tag's cross removes it. The default controller
writes tags in lower-kebab-case. The form receives each tag under `name`, then the field's text: what is still being
typed, a word the controller refused, or, without scripting, everything typed. A server reads them all as the field
keeps them, each once and none empty, with `readTags(form.getAll(name))`, and validates every tag, refused words
included.
Native attributes and events target the text input; `class` styles the surrounding field.

```svelte
<script lang="ts">
  import { Field, TagInput } from "@a-novel-kit/uikit";
</script>

<Field label="Tags" hint="A space ends a tag.">
  {#snippet children(control)}
    <TagInput {...control} name="tags" />
  {/snippet}
</Field>
```
-->
<script lang="ts" module>
  import type { TagInputController } from "./controllers.svelte";
  import type { ComponentSize } from "./types";

  import type { HTMLInputAttributes } from "svelte/elements";

  /**
   * Props for a text field that collects tags. A length or pattern would bound everything typed, refused words
   * included, not one tag, so the field takes none: the controller limits each tag.
   */
  export interface TagInputProps extends Omit<
    HTMLInputAttributes,
    "type" | "value" | "maxlength" | "minlength" | "pattern"
  > {
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
  import VisuallyHidden from "./VisuallyHidden.svelte";
  import { createTagInputController } from "./controllers.svelte";
  import Well from "./internal/Well.svelte";
  import { useMessages } from "./internal/i18n";
  import { resolveInvalidState } from "./internal/selection";
  import { splitTags } from "./tags";

  import type { Attachment } from "svelte/attachments";

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
    oncompositionend,
    "aria-invalid": ariaInvalid,
    "aria-describedby": describedBy,
    class: className = "",
    ...rest
  }: TagInputProps = $props();

  const { t } = useMessages();
  const statusId = $props.id();

  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
  const tags = $derived(controller.state.tags);
  const editable = $derived(!disabled && !readonly);
  // The status region tells assistive technology how many tags the field holds as it changes.
  const status = $derived(t("tagInput.count", { count: tags.length }));

  let field = $state<HTMLInputElement>();

  /**
   * Ends a tag at every separator; what follows the last one stays as typed, unless the writer ends the field with
   * Enter. A word the controller refuses stays in the field, so the writer keeps what they typed; the empty parts a
   * separator at either end leaves never reach it, but leave the field. Reports whether the controller took a word,
   * so an Enter that ends only refused ones submits the form.
   */
  function takeTags(input: HTMLInputElement, ending = false) {
    const parts = splitTags(input.value);
    const typing = ending ? "" : (parts.pop() ?? "");
    const words = parts.filter(Boolean);

    const refused = words.filter((word) => !controller.add(word));
    if (refused.length < parts.length) input.value = (ending ? refused : [...refused, typing]).join(" ");
    return refused.length < words.length;
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

  // The form sent the word being typed, so a reset, as SvelteKit's enhance runs after a successful action, makes it a
  // tag before the field empties: the field then shows what the server took. The reset reaches the document after the
  // form's own listeners and before the controls reset, so the field's form at that moment decides, and a cancelled
  // reset leaves the word typed.
  const commitOnReset: Attachment<HTMLInputElement> = (input) => {
    const commit = (event: Event) => {
      if (event.target === input.form && !event.defaultPrevented) takeTags(input, true);
    };
    document.addEventListener("reset", commit);
    return () => document.removeEventListener("reset", commit);
  };

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onkeydown?.(event);
    // WebKit sends the Enter that confirms a composition after it ends, as key code 229. Only that Enter counts:
    // Android keyboards send 229 for every key, Backspace included.
    const composing = event.isComposing || (event.key === "Enter" && event.keyCode === 229);
    if (event.defaultPrevented || composing || !editable) return;

    const input = event.currentTarget;
    if (event.key === "Enter" && input.value.trim()) {
      // A tag being typed ends here; an empty field, or one holding only refused words, lets Enter submit the form.
      if (takeTags(input, true)) event.preventDefault();
    } else if (event.key === "Backspace" && input.value === "" && tags.length > 0) {
      event.preventDefault();
      const count = tags.length;
      const last = tags[count - 1];
      controller.remove(count - 1);
      if (controller.state.tags.length < count) input.value = last;
    }
  }

  // The removed tag's button leaves the page, so the text input takes the focus it held.
  function removeTag(index: number) {
    const count = tags.length;
    controller.remove(index);
    if (controller.state.tags.length < count) field?.focus();
  }
</script>

<Well as="div" size={controlSize} invalid={isInvalid} class={className}>
  <div class="entries">
    {#if tags.length > 0}
      <ul class="tags">
        {#each tags as tag, index (tag)}
          <li>
            <!-- A disabled field's tags dim, and aria-disabled tells the accessibility check they are exempt from
               contrast, as a disabled control is. -->
            <Badge tone="brand" class="tag" aria-disabled={disabled || undefined}>
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
      data-well-control
      autocomplete="off"
      autocapitalize="none"
      autocorrect="off"
      spellcheck="false"
      {name}
      {disabled}
      {readonly}
      required={required && tags.length === 0}
      aria-required={required || undefined}
      {...rest}
      aria-describedby={[describedBy, statusId].filter(Boolean).join(" ")}
      aria-invalid={isInvalid || undefined}
      oninput={handleInput}
      onkeydown={handleKeydown}
      oncompositionend={handleCompositionEnd}
      {@attach commitOnReset}
    />
  </div>
  <VisuallyHidden id={statusId} role="status">{status}</VisuallyHidden>
</Well>

<style>
  /* Tags and the text input share the well's lines, wrapping as the tags grow. */
  .entries {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1-5);
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
  .entries :global(.tag) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    overflow-wrap: anywhere;
  }

  /* A button inside a field stays ghost: its icon, a color, and a veil of its own color under the pointer. It is
     built here rather than from FieldButton, whose square would not fit a 20px badge. */
  .remove {
    display: grid;
    position: relative;
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

  /* An unseen hit area grows the cross to the 24px minimum target without moving the tag. */
  .remove::after {
    position: absolute;
    inset: calc((1em - var(--icon-size-lg)) / 2);
    content: "";
  }

  /* Without scripting nothing removes a tag, so the crosses stay hidden. */
  @media (scripting: none) {
    .remove {
      display: none;
    }
  }

  @media (hover: hover) {
    .remove:hover {
      background: var(--color-action-subtle-hover);
    }
  }

  /* The ring sits inside the badge in its text color, whatever token sets it: the brand ring would vanish on the brand
     badge, and an outer ring would cover the tag's last letter. */
  .remove:focus-visible {
    outline: var(--border-width-strong) solid currentColor;
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

  /* A disabled field dims its tags, as a disabled chip or button dims its choice. A disabled fieldset disables the
     crosses without this component knowing, so they hide on their own state. */
  .entries:has(.control:disabled) :global(.tag) {
    opacity: var(--opacity-disabled);
    box-shadow: none;
  }

  .remove:disabled {
    display: none;
  }

  .control:disabled {
    color: var(--color-control-disabled-text);
  }

  /* After the dimming, which would halve the user's own disabled color. */
  @media (forced-colors: active) {
    .entries:has(.control:disabled) :global(.tag) {
      opacity: 1;
      border-color: GrayText;
      color: GrayText;
    }
  }
</style>
