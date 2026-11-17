<!--
@component
Styles a native file picker as a field: the chosen file's name, then a folder icon at its end. The whole field opens
the picker, and `onClear` adds a cross before the icon that removes the choice. Read selected files from the native
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
    /**
     * Removes the choice; shows a cross at the end of the field once a file is chosen, named after it. The caller
     * empties its own state.
     */
    onClear?: () => void;
  }
</script>

<script lang="ts">
  import { createValueController } from "./controllers.svelte";
  import FieldButton from "./internal/FieldButton.svelte";
  import Well from "./internal/Well.svelte";
  import { useMessages } from "./internal/i18n";
  import { resolveInvalidState } from "./internal/selection";

  import { untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";

  import { FolderOpen as FolderIcon, X as XIcon } from "@lucide/svelte";

  let {
    controlSize = "md",
    invalid = false,
    controller = createValueController<readonly string[]>({ initialValue: [] }),
    onClear,
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
    onClear?.();
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

<Well size={controlSize} invalid={isInvalid} class={className}>
  <input
    bind:this={field}
    type="file"
    class="control"
    data-well-control
    {...rest}
    aria-invalid={isInvalid || undefined}
    onchange={handleChange}
    {@attach followForm}
  />
  <!-- Browsers word their own control in their interface language, and no attribute changes it. The
       input stays on top, transparent, and tells assistive technology what these show. `aria-disabled` reaches no
       reader here: it tells the accessibility check that a disabled field's placeholder is exempt from contrast. -->
  <span class="status" class:empty={chosen.length === 0} aria-hidden="true" aria-disabled={rest.disabled || undefined}>
    {status}
  </span>
  <span class="end" data-well-end>
    {#if onClear && chosen.length > 0}
      <!-- Above the transparent input, so a click removes the choice instead of opening the picker. -->
      <span class="clear">
        <FieldButton aria-label={t("fileInput.clear", { name: status })} disabled={rest.disabled} onclick={clear}>
          <XIcon size="var(--icon-size-sm)" aria-hidden="true" />
        </FieldButton>
      </span>
    {/if}
    <!-- Under the transparent input, so a click on it opens the picker as the rest of the field does. -->
    <span class="browse" aria-hidden="true"><FolderIcon size="var(--icon-size-sm)" /></span>
  </span>
</Well>

<style>
  /* The input covers the whole well, so a click anywhere in it opens the picker. */
  .control {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    margin: 0;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
  }

  .control:disabled {
    cursor: not-allowed;
  }

  .control::file-selector-button {
    cursor: inherit;
  }

  /* The folder lights with the field under the pointer and in focus. The well is the field's root, which Well styles,
     so its hover reaches the folder as a global class. */
  @media (hover: hover) {
    :global(.well:hover:not(:has(:disabled))) > .end .browse {
      color: var(--color-text-primary);
    }
  }

  .control:focus-visible ~ .end .browse {
    color: var(--color-text-primary);
  }

  .status {
    flex: 1 1 0;
    min-inline-size: 0;
    overflow: hidden;
    line-height: var(--line-height-compact);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .control:enabled ~ .status.empty {
    color: var(--color-control-placeholder);
  }

  .clear {
    display: inline-flex;
    position: relative;
  }

  /* A disabled field removes nothing, so its cross hides, as TagInput's do. A disabled fieldset disables the cross
     without this component knowing, so it hides on its own state. */
  .clear:has(:global(:disabled)) {
    display: none;
  }

  /* The folder sits where a field's button would, the size of one. */
  .browse {
    display: grid;
    place-items: center;
    transition: color var(--duration-fast) var(--easing-standard);
    inline-size: var(--control-height-nested);
    block-size: var(--control-height-nested);
    color: var(--well-muted-text);
  }

  @media (forced-colors: active) {
    .control:enabled ~ .status.empty {
      color: GrayText;
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

    /* The native control brings its own height, so the field drops the padding it keeps for the icons. */
    :global(.well):has(> .control) {
      padding-block: 0;
    }
  }
</style>
