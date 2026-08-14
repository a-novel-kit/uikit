<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a composed group of native disclosure items. */
  export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** Lets more than one item remain open. */
    multiple?: boolean;
    /** AccordionItem children. */
    children: Snippet;
  }
</script>

<script lang="ts">
  import { type AccordionContext, accordionContextKey } from "./accordion";

  import { setContext } from "svelte";

  let { multiple = false, children, class: className = "", ...rest }: AccordionProps = $props();

  const accordionId = $props.id();
  const context: AccordionContext = {
    get name() {
      return multiple ? undefined : `${accordionId}-group`;
    },
  };

  setContext(accordionContextKey, context);
</script>

<div class="accordion {className}" {...rest}>
  {@render children()}
</div>

<style>
  .accordion {
    display: grid;
    gap: var(--space-2);
  }
</style>
