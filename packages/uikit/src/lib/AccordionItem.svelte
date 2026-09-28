<!--
@component
Groups a Disclosure under its nearest Accordion. Its controller owns the accepted open state.
-->
<script lang="ts" module>
  import type { DisclosureController, DisclosureProps } from "./Disclosure.svelte";

  /** External state contract for one accordion item. */
  export type AccordionItemController = DisclosureController;

  /** Disclosure props with the native group name supplied by Accordion. */
  export type AccordionItemProps = Omit<DisclosureProps, "name">;
</script>

<script lang="ts">
  import Disclosure from "./Disclosure.svelte";
  import { type AccordionContext, accordionContextKey } from "./accordion";

  import { getContext } from "svelte";

  let props: AccordionItemProps = $props();
  const context = getContext<AccordionContext | undefined>(accordionContextKey);
</script>

<Disclosure {...props} name={context?.name} />
