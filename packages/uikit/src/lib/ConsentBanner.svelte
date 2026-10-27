<!--
@component
Asks the visitor to accept or decline an optional processing, such as telemetry, without blocking
the page. Both answers carry the same weight, and either one hides the banner. The application
supplies the wording and its policy link; the banner supplies the translated answers.

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
  import ContentView from "./Content.svelte";
  import { useMessages } from "./internal/i18n";

  const { t } = useMessages();

  let { controller, title, children, class: className = "", ...rest }: ConsentBannerProps = $props();

  const titleId = $props.id();
</script>

{#if controller.state.open}
  <section class="banner {className}" aria-labelledby={titleId} {...rest}>
    <div class="text">
      <strong id={titleId}><ContentView content={title} /></strong>
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
{/if}

<style>
  .banner {
    display: grid;
    position: fixed;
    gap: var(--space-3);
    z-index: var(--layer-toast);
    inset-block-end: var(--space-4);
    inset-inline-end: var(--space-4);
    box-shadow: var(--shadow-lg);
    border-radius: var(--radius-md);
    background: var(--color-surface-island-strong);
    padding: var(--space-4);
    inline-size: min(
      calc(100vi - var(--space-8)),
      calc(var(--space-base) * var(--multiplier-64) * var(--multiplier-2))
    );
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

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .banner {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    .banner {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
