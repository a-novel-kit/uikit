/** Context key shared only by Accordion and AccordionItem. */
export const accordionContextKey = Symbol("agora-accordion");

/** State inherited by an AccordionItem from its nearest Accordion. */
export interface AccordionContext {
  /** Native details-group name, or undefined when multiple items may remain open. */
  readonly name: string | undefined;
}
