export const accordionContextKey = Symbol("agora-accordion");

export interface AccordionContext {
  readonly name: string | undefined;
}
