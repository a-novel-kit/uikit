/** Sizes shared by controls and compact visual components. */
export type ComponentSize = "sm" | "md" | "lg";

/** Semantic roles shared by status and feedback components. */
export type FeedbackTone = "info" | "success" | "warning" | "error";

/** Spacing steps supported by the layout primitives. */
export type LayoutGap = "0" | "1" | "2" | "3" | "4" | "6" | "8" | "12" | "16";

/** A labeled value accepted by single-choice controls. */
export interface SelectionOption<Value extends string> {
  /** Stable value used by forms and application state. */
  value: Value;
  /** Plain-text label used for display, filtering, and accessibility. */
  label: string;
  /** Prevents the option from being selected. */
  disabled?: boolean;
}
