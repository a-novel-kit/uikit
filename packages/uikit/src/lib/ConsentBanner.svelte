<!--
@component
Asks the visitor to accept or decline an optional processing, such as telemetry, without blocking
the page. Both answers carry the same weight, and either one hides the banner. The application
supplies the wording and its policy link; the banner supplies the translated answers. A modal dialog
leaves the page inert, so the topmost one open shows the banner too, where it stays answerable.

```svelte
<script lang="ts">
  import { ConsentBanner, Link, createConsentController } from "@a-novel-kit/uikit";
  const consent = createConsentController({ initialOpen: true, onChoice: save });
</script>

<ConsentBanner controller={consent} title="Error reports">
  Your browser sends us a report when a page fails. <Link href="/privacy">Privacy policy</Link>
</ConsentBanner>
```
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { ConsentController } from "./controllers.svelte";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a non-blocking consent request. */
  export interface ConsentBannerProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
    /** State owner that records the answer and decides whether the banner shows. */
    controller: ConsentController;
    /** Names what the visitor consents to; it also names the banner's region. */
    title: Content;
    /** Explains the processing, with a link to the policy that details it. */
    children: Snippet;
  }
</script>

<script lang="ts">
  import Button from "./Button.svelte";
  import RenderContent from "./internal/RenderContent.svelte";
  import { useMessages } from "./internal/i18n";
  import { hold, overModal } from "./internal/overModal.svelte";

  import { untrack } from "svelte";

  const { t } = useMessages();

  let { controller, title, children, class: className = "", ...rest }: ConsentBannerProps = $props();

  const titleId = $props.id();

  $effect(() => {
    if (controller.state.open) return untrack(() => hold(overModal.requests, overModalBanner));
  });
</script>

{#snippet banner(id: string)}
  <section class="banner {className}" aria-labelledby={id} data-frost data-island {...rest}>
    <div class="text">
      <strong {id}><RenderContent content={title} /></strong>
      <p>{@render children()}</p>
    </div>
    <div class="answers">
      <Button variant="outline" tone="neutral" size="sm" onclick={controller.decline}>
        {t("consentBanner.decline")}
      </Button>
      <Button variant="outline" tone="neutral" size="sm" onclick={controller.accept}>
        {t("consentBanner.accept")}
      </Button>
    </div>
  </section>
{/snippet}

<!-- The copy a modal dialog shows takes its own id, so no two titles share one. -->
{#snippet overModalBanner()}{@render banner(`${titleId}-over-modal`)}{/snippet}

{#if controller.state.open}{@render banner(titleId)}{/if}

<style>
  .banner {
    display: grid;
    position: fixed;
    gap: var(--space-3);
    z-index: var(--layer-toast);
    -webkit-backdrop-filter: blur(var(--blur-md));
    backdrop-filter: blur(var(--blur-md));
    box-sizing: border-box;
    inset-block-end: var(--space-4);
    inset-inline-end: var(--space-4);
    box-shadow: var(--shadow-floating);
    border-radius: var(--radius-md);
    background: var(--color-surface-glass);
    padding: var(--space-4);
    inline-size: min(calc(100vi - var(--space-8)), calc(var(--size-base) * 64 * 2));
    color: var(--color-text-primary);
  }

  .text {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  strong {
    display: block;
    margin-block-end: var(--space-1);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-normal);
  }

  .answers {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  @media (forced-colors: active) {
    .banner {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
