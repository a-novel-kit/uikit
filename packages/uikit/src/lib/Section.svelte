<!--
@component
Titles a group of content. The title, its explanation and its controls sit on the surface that holds the section,
above the content, never inside the card that follows: a page's sections title on the canvas, and a section inside a
card titles on that card. Renders a `section` its heading names.

```svelte
<script lang="ts">
  import { Card, Section } from "@a-novel-kit/uikit";
</script>

<Section title="Devices" description="The devices signed in to your account.">
  <Card>...</Card>
</Section>
```
-->
<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a titled group of content. */
  export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    /** Visible heading that names the section, as text or composed inline content. */
    title: Content;
    /** Short supporting explanation under the heading. */
    description?: Content;
    /** Controls beside the heading, such as an action on the whole group. */
    actions?: Snippet;
    /**
     * Semantic level of the heading, which also sets its style. Defaults to one level under the section that
     * holds this one, and to 2 at the top, so a caller counts no level.
     */
    headingLevel?: 2 | 3 | 4;
  }

  const enclosingLevel = Symbol("enclosing section level");
</script>

<script lang="ts">
  import PanelHeader from "./PanelHeader.svelte";

  import { getContext, setContext } from "svelte";

  let { title, description, actions, headingLevel, class: className = "", children, ...rest }: SectionProps = $props();

  const titleId = $props.id();
  const enclosing = getContext<(() => number) | undefined>(enclosingLevel);
  const level = $derived(headingLevel ?? (Math.min((enclosing?.() ?? 1) + 1, 4) as 2 | 3 | 4));

  setContext(enclosingLevel, () => level);
</script>

<section class="section {className}" aria-labelledby={titleId} {...rest}>
  <PanelHeader {title} {description} {actions} headingLevel={level} {titleId} />
  {@render children?.()}
</section>

<style>
  .section {
    display: grid;
    gap: var(--space-4);
    min-inline-size: 0;
  }
</style>
