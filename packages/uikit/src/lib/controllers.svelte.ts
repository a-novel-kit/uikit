/** State managed for content that can be open or closed. */
export interface OpenState {
  /** Whether the content is visible. */
  open: boolean;
}

/** Pure state transitions for content that can be open or closed. Custom controllers may reject a request. */
export interface OpenController {
  /** State rendered by the component. */
  readonly state: OpenState;
  /** Shows the content. */
  open(): void;
  /** Hides the content. */
  close(): void;
  /** Reverses the current visibility. */
  toggle(): void;
}

/** Configuration for the default open-state controller. */
export interface OpenControllerOptions {
  /** Visibility when created; defaults to false. */
  initialOpen?: boolean;
  /** Runs after the default controller changes visibility. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Creates local reactive visibility state. Repeated open or close requests do not notify again.
 * Create the controller per component instance and update it through its methods.
 *
 * @example
 * ```ts
 * import { createOpenController } from "@a-novel-kit/uikit";
 * const dialog = createOpenController({ initialOpen: true });
 * dialog.close();
 * ```
 */
export function createOpenController({
  initialOpen = false,
  onOpenChange,
}: OpenControllerOptions = {}): OpenController {
  let state = $state<OpenState>({ open: initialOpen });

  function setOpen(open: boolean) {
    if (state.open === open) return;
    state = { open };
    onOpenChange?.(open);
  }

  return {
    get state() {
      return state;
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!state.open),
  };
}

/** State managed for a binary selection control. */
export interface CheckedState {
  /** Whether the control is selected. */
  checked: boolean;
}

/** Pure state transitions for a binary selection control. */
export interface CheckedController {
  /** State rendered by the component. */
  readonly state: CheckedState;
  /** Applies a requested checked state. */
  setChecked(checked: boolean): void;
  /** Reverses the current checked state. */
  toggle(): void;
}

/** Configuration for the default checked-state controller. */
export interface CheckedControllerOptions {
  /** Checked state when created; defaults to false. */
  initialChecked?: boolean;
  /** Runs after the default controller changes the checked state. */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Creates local reactive state for a Checkbox or Switch. Unchanged requests do not notify.
 *
 * @example
 * ```ts
 * import { createCheckedController } from "@a-novel-kit/uikit";
 * const notifications = createCheckedController({ initialChecked: true });
 * notifications.setChecked(false);
 * ```
 */
export function createCheckedController({
  initialChecked = false,
  onCheckedChange,
}: CheckedControllerOptions = {}): CheckedController {
  let state = $state<CheckedState>({ checked: initialChecked });

  function setChecked(checked: boolean) {
    if (state.checked === checked) return;
    state = { checked };
    onCheckedChange?.(checked);
  }

  return {
    get state() {
      return state;
    },
    setChecked,
    toggle: () => setChecked(!state.checked),
  };
}

/** State managed for a pressed toggle button. */
export interface PressedState {
  /** Whether the button is pressed. */
  pressed: boolean;
}

/** Pure state transitions for a pressed toggle button. */
export interface PressedController {
  /** State rendered by the component. */
  readonly state: PressedState;
  /** Applies a requested pressed state. */
  setPressed(pressed: boolean): void;
  /** Reverses the current pressed state. */
  toggle(): void;
}

/** Configuration for the default pressed-state controller. */
export interface PressedControllerOptions {
  /** Pressed state when created; defaults to false. */
  initialPressed?: boolean;
  /** Runs after the default controller changes the pressed state. */
  onPressedChange?: (pressed: boolean) => void;
}

/**
 * Creates local reactive state for a ToggleButton. Unchanged requests do not notify.
 *
 * @example
 * ```ts
 * import { createPressedController } from "@a-novel-kit/uikit";
 * const bold = createPressedController();
 * bold.toggle();
 * ```
 */
export function createPressedController({
  initialPressed = false,
  onPressedChange,
}: PressedControllerOptions = {}): PressedController {
  let state = $state<PressedState>({ pressed: initialPressed });

  function setPressed(pressed: boolean) {
    if (state.pressed === pressed) return;
    state = { pressed };
    onPressedChange?.(pressed);
  }

  return {
    get state() {
      return state;
    },
    setPressed,
    toggle: () => setPressed(!state.pressed),
  };
}

/** State managed for a single-value control. */
export interface ValueState<Value> {
  /** Current control value. */
  value: Value;
}

/** Pure state transitions for a single-value control. */
export interface ValueController<Value> {
  /** State rendered by the component. */
  readonly state: ValueState<Value>;
  /** Applies a requested value. */
  setValue(value: Value): void;
}

/** Configuration for the default value controller. */
export interface ValueControllerOptions<Value> {
  /** Initial control value. */
  initialValue: Value;
  /** Runs after the default controller changes the value. */
  onValueChange?: (value: Value) => void;
}

/**
 * Creates local reactive value state; requests equal under Object.is do not notify.
 * Values are accepted as supplied. The caller owns validation and persistence.
 *
 * @example
 * ```ts
 * import { createValueController } from "@a-novel-kit/uikit";
 * const tab = createValueController({ initialValue: "overview" });
 * tab.setValue("details");
 * ```
 */
export function createValueController<Value>({
  initialValue,
  onValueChange,
}: ValueControllerOptions<Value>): ValueController<Value> {
  let state = $state<ValueState<Value>>({ value: initialValue });

  return {
    get state() {
      return state;
    },
    setValue: (value) => {
      if (Object.is(state.value, value)) return;
      state = { value };
      onValueChange?.(value);
    },
  };
}

/** State managed for a single-value popup control. */
export interface SelectState<Value> {
  /** Whether the popup is visible. */
  open: boolean;
  /** Current selected value. */
  value: Value | undefined;
}

/** Pure state transitions for a single-value popup control. */
export interface SelectController<Value> {
  /** State rendered by the component. */
  readonly state: SelectState<Value>;
  /** Shows the popup. */
  open(): void;
  /** Hides the popup. */
  close(): void;
  /** Reverses the current popup visibility. */
  toggle(): void;
  /** Applies a requested selected value. */
  select(value: Value | undefined): void;
}

/** Configuration for the default single-value popup controller. */
export interface SelectControllerOptions<Value> {
  /** Selected value when created; undefined means no selection. */
  initialValue?: Value;
  /** Popup visibility when created; defaults to false. */
  initialOpen?: boolean;
  /** Runs after the default controller changes popup visibility. */
  onOpenChange?: (open: boolean) => void;
  /** Runs after the default controller changes the selected value. */
  onValueChange?: (value: Value | undefined) => void;
}

/**
 * Creates independent reactive selection and visibility state.
 * Selecting a value does not close the popup; components request closure separately.
 * Unchanged requests do not notify. Values are accepted without checking available options.
 *
 * @example
 * ```ts
 * import { createSelectController } from "@a-novel-kit/uikit";
 * const language = createSelectController<"en" | "fr">({ initialValue: "en" });
 * language.select("fr");
 * ```
 */
export function createSelectController<Value>({
  initialValue,
  initialOpen = false,
  onOpenChange,
  onValueChange,
}: SelectControllerOptions<Value> = {}): SelectController<Value> {
  let state = $state<SelectState<Value>>({ open: initialOpen, value: initialValue });

  function setOpen(open: boolean) {
    if (state.open === open) return;
    state = { ...state, open };
    onOpenChange?.(open);
  }

  return {
    get state() {
      return state;
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!state.open),
    select: (value) => {
      if (Object.is(state.value, value)) return;
      state = { ...state, value };
      onValueChange?.(value);
    },
  };
}

/** State managed for a filterable single-value popup control. */
export interface ComboboxState<Value> extends SelectState<Value> {
  /** Current filter query. */
  query: string;
}

/** Pure state transitions for a filterable single-value popup control. */
export interface ComboboxController<Value> {
  /** State rendered by the component. */
  readonly state: ComboboxState<Value>;
  /** Shows the popup. */
  open(): void;
  /** Hides the popup and clears its transient query. */
  close(): void;
  /** Reverses the current popup visibility. */
  toggle(): void;
  /** Applies a requested filter query. */
  setQuery(query: string): void;
  /** Applies a requested selected value. */
  select(value: Value | undefined): void;
}

/** Configuration for the default filterable popup controller. */
export interface ComboboxControllerOptions<Value> extends SelectControllerOptions<Value> {
  /** Filter query when created; defaults to an empty string. */
  initialQuery?: string;
  /** Runs after the default controller changes the filter query. */
  onQueryChange?: (query: string) => void;
}

/**
 * Creates reactive selection, query, and visibility state for a Combobox.
 * Closing clears the query; selecting a value neither closes nor clears it.
 * Unchanged requests do not notify. The component owns filtering the available options.
 *
 * @example
 * ```ts
 * import { createComboboxController } from "@a-novel-kit/uikit";
 * const country = createComboboxController<string>();
 * country.setQuery("fr");
 * country.open();
 * ```
 */
export function createComboboxController<Value>({
  initialValue,
  initialOpen = false,
  initialQuery = "",
  onOpenChange,
  onQueryChange,
  onValueChange,
}: ComboboxControllerOptions<Value> = {}): ComboboxController<Value> {
  let state = $state<ComboboxState<Value>>({ open: initialOpen, query: initialQuery, value: initialValue });

  function setOpen(open: boolean) {
    const query = open ? state.query : "";
    const openChanged = state.open !== open;
    const queryChanged = state.query !== query;
    if (!openChanged && !queryChanged) return;

    state = { ...state, open, query };
    if (openChanged) onOpenChange?.(open);
    if (queryChanged) onQueryChange?.(query);
  }

  return {
    get state() {
      return state;
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!state.open),
    setQuery: (query) => {
      if (state.query === query) return;
      state = { ...state, query };
      onQueryChange?.(query);
    },
    select: (value) => {
      if (Object.is(state.value, value)) return;
      state = { ...state, value };
      onValueChange?.(value);
    },
  };
}
