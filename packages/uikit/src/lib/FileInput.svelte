<!--
@component
Styles a native file picker as a field: the chosen file's name, then a folder icon at its end. The whole field opens
the picker, and `onclear` adds a cross before the icon that removes the choice. Read selected files from the native
change event; file selection remains owned by the browser. Show a chosen image above the field, never inside it.
Native attributes and events target the input; `class` styles the surrounding surface.
-->
<script lang="ts" module>
  import type { ValueController } from "./controllers.svelte";
  import type { ComponentSize } from "./types";

  import type { HTMLInputAttributes } from "svelte/elements";

  /** External display contract for a file input; the value holds the chosen file names. */
  export type FileInputController = ValueController<readonly string[]>;

  /** Props for a styled native file input. */
  export interface FileInputProps extends Omit<HTMLInputAttributes, "type" | "value"> {
    /** Sets the control height and type scale. */
    controlSize?: ComponentSize;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** State owner of the file names the field shows; each input has its own by default. */
    controller?: FileInputController;
    /** Removes the choice; shows a cross at the end of the field while it is set. The caller empties its own state. */
    onclear?: () => void;
  }
</script>

<script lang="ts">
  import { createValueController } from "./controllers.svelte";
  import FieldButton from "./internal/FieldButton.svelte";
  import { useMessages } from "./internal/i18n";
  import { resolveInvalidState } from "./selection";

  import { untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";

  import { FolderOpen as FolderIcon, X as XIcon } from "@lucide/svelte";

  let {
    controlSize = "md",
    invalid = false,
    controller = createValueController<readonly string[]>({ initialValue: [] }),
    onclear,
    onchange,
    "aria-invalid": ariaInvalid,
    class: className = "",
    ...rest
  }: FileInputProps = $props();

  const { t } = useMessages();

  let field = $state<HTMLInputElement>();

  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
  const chosen = $derived(controller.state.value);
  const status = $derived(
    chosen.length > 1
      ? t("fileInput.count", { count: String(chosen.length) })
      : (chosen[0] ?? t("fileInput.placeholder"))
  );

  function showSelection(input: HTMLInputElement) {
    controller.setValue(Array.from(input.files ?? [], (file) => file.name));
  }

  // The cross empties the input itself, so the form sends nothing and the same file chosen again still reports a
  // change.
  function clear() {
    if (field) {
      field.value = "";
      showSelection(field);
      // The caller may drop the cross with the choice, so the field takes the focus it held.
      field.focus();
    }
    onclear?.();
  }

  // The app's handler may empty the field, so the selection is read after it.
  function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    onchange?.(event);
    showSelection(event.currentTarget);
  }

  // A restored page fills the field before it hydrates. A form reset empties the field once its
  // listeners have run, unless one cancels it, so the timer reads the outcome.
  const followForm: Attachment<HTMLInputElement> = (input) => {
    untrack(() => showSelection(input));

    const form = input.form;
    const reread = () => setTimeout(() => showSelection(input));
    form?.addEventListener("reset", reread);
    return () => form?.removeEventListener("reset", reread);
  };
</script>

<span class="file-input {controlSize} {className}">
  <input
    bind:this={field}
    type="file"
    class="control"
    {...rest}
    aria-invalid={isInvalid || undefined}
    onchange={handleChange}
    {@attach followForm}
  />
  <!-- Browsers word their own control in their interface language, and no attribute changes it. The
       input stays on top, transparent, and tells assistive technology what these show. -->
  <span class="status" class:empty={chosen.length === 0} aria-hidden="true" aria-disabled={rest.disabled || undefined}>
    {status}
  </span>
  <span class="end">
    {#if onclear}
      <!-- Above the transparent input, so a click removes the choice instead of opening the picker. -->
      <span class="clear">
        <FieldButton aria-label={t("fileInput.clear")} disabled={rest.disabled} onclick={clear}>
          <XIcon size="var(--icon-size-sm)" aria-hidden="true" />
        </FieldButton>
      </span>
    {/if}
    <!-- Under the transparent input, so a click on it opens the picker as the rest of the field does. -->
    <span class="browse" aria-hidden="true"><FolderIcon size="var(--icon-size-sm)" /></span>
  </span>
</span>

<style>
  .file-input {
    display: flex;
    position: relative;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-field-border);
    border-radius: var(--radius-md);
    background: var(--color-control-surface);
    inline-size: 100%;
    min-inline-size: 0;
    color: var(--color-control-text);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  .control {
    position: absolute;
    opacity: 0;
    cursor: inherit;
    margin: 0;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
  }

  .control::file-selector-button {
    cursor: inherit;
  }

  @media (hover: hover) {
    .file-input:hover:not(:has(.control:disabled, .control:focus-visible, .control[aria-invalid="true"])) {
      border-color: var(--color-field-border);
      background: var(--color-control-surface-hover);
    }

    .file-input:hover:not(:has(.control:disabled)) .browse {
      color: var(--color-text-primary);
    }
  }

  .file-input:has(.control:focus-visible) {
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  .file-input:has(.control[aria-invalid="true"]) {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .file-input:has(.control[aria-invalid="true"]:focus-visible) {
    box-shadow: var(--shadow-invalid-focus-ring);
  }

  .file-input:has(.control:disabled) {
    cursor: not-allowed;
    border-color: var(--color-field-border);
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }

  .status {
    flex: 1 1 0;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status.empty {
    color: var(--color-control-placeholder);
  }

  .file-input:has(.control:disabled) :is(.status, .browse) {
    color: var(--color-control-disabled-text);
  }

  /* A zero-height margin box keeps the field at its own height: the icons overlap its padding, as far
     from the inline end as from the block edges of a medium field, as a password's toggle does. */
  .end {
    display: inline-flex;
    flex: none;
    margin-inline-end: calc(-1 * (var(--space-2) + var(--border-width-thin)));
    margin-block: calc(var(--control-height-nested) / -2);
  }

  .clear {
    display: inline-flex;
    position: relative;
  }

  /* The folder sits where a field's button would, the size of one, and lights with the field. */
  .browse {
    display: grid;
    place-items: center;
    transition: color var(--duration-fast) var(--easing-standard);
    inline-size: var(--control-height-nested);
    block-size: var(--control-height-nested);
    color: var(--color-text-muted);
  }

  .sm {
    padding: var(--space-1) var(--space-3);
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

  @media (forced-colors: active) {
    .file-input:has(.control:focus-visible) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  /* Without scripting nothing follows the selection, so the browser's own control shows it. */
  @media (scripting: none) {
    .control {
      position: static;
      opacity: 1;
      color: inherit;
      font: inherit;
    }

    .status,
    .end {
      display: none;
    }
  }
</style>
