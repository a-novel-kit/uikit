/** A state owner consumed by a pure UI component. */
interface StateController<State> {
  /** State rendered by the component. */
  readonly state: State;
  /** Applies a state change requested by the component. */
  setState(nextState: State): void;
}

/** Configuration for a reactive default controller. */
interface StateControllerOptions<State> {
  /** State exposed before the first requested change. */
  initialState: State;
  /** Runs after the controller accepts a changed state. */
  onStateChange?: (state: State) => void;
}

/** Creates a reactive controller for components that need local default behavior. */
function createStateController<State>({
  initialState,
  onStateChange,
}: StateControllerOptions<State>): StateController<State> {
  let state = $state(initialState);

  return {
    get state() {
      return state;
    },
    setState(nextState) {
      if (Object.is(state, nextState)) return;

      state = nextState;
      onStateChange?.(nextState);
    },
  };
}

/** State managed for content that can be open or closed. */
export interface OpenState {
  /** Whether the content is visible. */
  open: boolean;
}

/** Pure state transitions for content that can be open or closed. */
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
  /** Initial visibility. */
  initialOpen?: boolean;
  /** Runs after the default controller changes visibility. */
  onOpenChange?: (open: boolean) => void;
}

/** Creates a controller with standard open, close, and toggle transitions. */
export function createOpenController({
  initialOpen = false,
  onOpenChange,
}: OpenControllerOptions = {}): OpenController {
  const state = createStateController({
    initialState: { open: initialOpen },
    onStateChange: ({ open }) => onOpenChange?.(open),
  });

  return {
    get state() {
      return state.state;
    },
    open: () => {
      if (!state.state.open) state.setState({ open: true });
    },
    close: () => {
      if (state.state.open) state.setState({ open: false });
    },
    toggle: () => state.setState({ open: !state.state.open }),
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
  /** Initial checked state. */
  initialChecked?: boolean;
  /** Runs after the default controller changes the checked state. */
  onCheckedChange?: (checked: boolean) => void;
}

/** Creates a controller with standard checked-state transitions. */
export function createCheckedController({
  initialChecked = false,
  onCheckedChange,
}: CheckedControllerOptions = {}): CheckedController {
  const state = createStateController({
    initialState: { checked: initialChecked },
    onStateChange: ({ checked }) => onCheckedChange?.(checked),
  });

  return {
    get state() {
      return state.state;
    },
    setChecked: (checked) => {
      if (state.state.checked !== checked) state.setState({ checked });
    },
    toggle: () => state.setState({ checked: !state.state.checked }),
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
  /** Initial pressed state. */
  initialPressed?: boolean;
  /** Runs after the default controller changes the pressed state. */
  onPressedChange?: (pressed: boolean) => void;
}

/** Creates a controller with standard pressed-state transitions. */
export function createPressedController({
  initialPressed = false,
  onPressedChange,
}: PressedControllerOptions = {}): PressedController {
  const state = createStateController({
    initialState: { pressed: initialPressed },
    onStateChange: ({ pressed }) => onPressedChange?.(pressed),
  });

  return {
    get state() {
      return state.state;
    },
    setPressed: (pressed) => {
      if (state.state.pressed !== pressed) state.setState({ pressed });
    },
    toggle: () => state.setState({ pressed: !state.state.pressed }),
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

/** Creates a controller for a single-value control. */
export function createValueController<Value>({
  initialValue,
  onValueChange,
}: ValueControllerOptions<Value>): ValueController<Value> {
  const state = createStateController({
    initialState: { value: initialValue },
    onStateChange: ({ value }) => onValueChange?.(value),
  });

  return {
    get state() {
      return state.state;
    },
    setValue: (value) => {
      if (!Object.is(state.state.value, value)) state.setState({ value });
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
  /** Initial selected value. */
  initialValue?: Value;
  /** Initial popup visibility. */
  initialOpen?: boolean;
  /** Runs after the default controller changes popup visibility. */
  onOpenChange?: (open: boolean) => void;
  /** Runs after the default controller changes the selected value. */
  onValueChange?: (value: Value | undefined) => void;
}

/** Creates a controller for a single-value popup control. */
export function createSelectController<Value>({
  initialValue,
  initialOpen = false,
  onOpenChange,
  onValueChange,
}: SelectControllerOptions<Value> = {}): SelectController<Value> {
  const state = createStateController<SelectState<Value>>({
    initialState: { open: initialOpen, value: initialValue },
  });

  function setOpen(open: boolean) {
    if (state.state.open === open) return;
    state.setState({ ...state.state, open });
    onOpenChange?.(open);
  }

  return {
    get state() {
      return state.state;
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!state.state.open),
    select: (value) => {
      if (Object.is(state.state.value, value)) return;
      state.setState({ ...state.state, value });
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
  /** Initial filter query. */
  initialQuery?: string;
  /** Runs after the default controller changes the filter query. */
  onQueryChange?: (query: string) => void;
}

/** Creates a controller for a filterable single-value popup control. */
export function createComboboxController<Value>({
  initialValue,
  initialOpen = false,
  initialQuery = "",
  onOpenChange,
  onQueryChange,
  onValueChange,
}: ComboboxControllerOptions<Value> = {}): ComboboxController<Value> {
  const state = createStateController<ComboboxState<Value>>({
    initialState: { open: initialOpen, query: initialQuery, value: initialValue },
  });

  function setOpen(open: boolean) {
    const query = open ? state.state.query : "";
    const openChanged = state.state.open !== open;
    const queryChanged = state.state.query !== query;
    if (!openChanged && !queryChanged) return;

    state.setState({ ...state.state, open, query });
    if (openChanged) onOpenChange?.(open);
    if (queryChanged) onQueryChange?.(query);
  }

  return {
    get state() {
      return state.state;
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!state.state.open),
    setQuery: (query) => {
      if (state.state.query === query) return;
      state.setState({ ...state.state, query });
      onQueryChange?.(query);
    },
    select: (value) => {
      if (Object.is(state.state.value, value)) return;
      state.setState({ ...state.state, value });
      onValueChange?.(value);
    },
  };
}
