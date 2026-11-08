<!--
@component
Styles a native file picker in the app's language. Read selected files from the native change event;
file selection remains owned by the browser.
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
    /** State owner of the file names shown beside the button; each input has its own by default. */
    controller?: FileInputController;
  }
</script>

<script lang="ts">
  import { createValueController } from "./controllers.svelte";
  import { useMessages } from "./internal/i18n";
  import { resolveInvalidState } from "./selection";

  import { untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";

  let {
    controlSize = "md",
    invalid = false,
    controller = createValueController<readonly string[]>({ initialValue: [] }),
    multiple,
    onchange,
    "aria-invalid": ariaInvalid,
    class: className = "",
    ...rest
  }: FileInputProps = $props();

  const { t } = useMessages();

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
    type="file"
    class="control"
    {multiple}
    {...rest}
    aria-invalid={isInvalid || undefined}
    onchange={handleChange}
    {@attach followForm}
  />
  <!-- Browsers word their own control in their interface language, and no attribute changes it. The
       input stays on top, transparent, and tells assistive technology what these show. -->
  <span class="button" aria-hidden="true" aria-disabled={rest.disabled || undefined}>
    {multiple ? t("fileInput.chooseMany") : t("fileInput.choose")}
  </span>
  <span class="status" aria-hidden="true" aria-disabled={rest.disabled || undefined}>{status}</span>
</span>

<style>
  .file-input {
    display: flex;
    position: relative;
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
    overflow: clip;
    color: var(--color-text-muted);
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

    .file-input:hover:not(:has(.control:disabled, .control:focus-visible, .control[aria-invalid="true"])) .button {
      background: var(--color-action-neutral-hover);
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

  .button {
    display: flex;
    align-items: center;
    border-inline-end: var(--border-width-thin) solid var(--color-border-default);
    background: var(--color-action-neutral);
    color: var(--color-action-neutral-text);
    font-weight: var(--font-weight-bold);
  }

  .file-input:has(.control:disabled) .button {
    border-color: var(--color-action-disabled-border);
    background: var(--color-action-disabled-surface);
    color: var(--color-action-disabled-text);
  }

  .status {
    flex: 1 1 0;
    align-self: center;
    padding-inline-end: var(--space-3);
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sm {
    min-block-size: var(--control-height-sm);
    font-size: var(--font-size-sm);
  }
  .sm .button {
    margin-inline-end: var(--space-3);
    padding: var(--space-1) var(--space-3);
  }

  .md {
    min-block-size: var(--control-height-md);
    font-size: var(--font-size-md);
  }
  .md .button {
    margin-inline-end: var(--space-3);
    padding: var(--space-1) var(--space-4);
  }

  .lg {
    min-block-size: var(--control-height-lg);
    font-size: var(--font-size-lg);
  }
  .lg .button {
    margin-inline-end: var(--space-4);
    padding: var(--space-2) var(--space-6);
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

    .button,
    .status {
      display: none;
    }
  }
</style>
