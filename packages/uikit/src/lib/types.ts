/** Sizes shared by controls and compact visual components. */
export type ComponentSize = "sm" | "md" | "lg";

/** Semantic roles shared by status and feedback components. */
export type FeedbackTone = "info" | "highlight" | "success" | "warning" | "error";

/** Feedback for pending work or a completed outcome. */
export type FeedbackState = FeedbackTone | "loading";

/** Spacing steps supported by the layout primitives. */
export type LayoutGap = "0" | "1" | "2" | "3" | "4" | "6" | "8" | "12" | "16";

/** A labeled value accepted by single-choice controls. */
export interface SelectionOption<Value extends string> {
  /** Stable value used by forms and application state. */
  value: Value;
  /** Plain-text label used for display, filtering, and accessibility. */
  label: string;
  /**
   * Language of the label when it differs from the page's, as a language's own name does. Every component that
   * takes options sets it on the option, and Select on the value it shows too.
   */
  lang?: string;
  /** Prevents the option from being selected. */
  disabled?: boolean;
}
