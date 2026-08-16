<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Foundations/Motion & depth",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Depth separates temporary or raised content. Motion confirms a state change and follows reduced-motion preferences.",
        },
      },
    },
  });
</script>

<Story name="Surfaces" asChild>
  <div class="surface-grid">
    <div class="surface sunken"><strong>Sunken</strong><code>surface-sunken</code></div>
    <div class="surface island"><strong>Island</strong><code>surface-island</code></div>
    <div class="surface overlay"><strong>Overlay</strong><code>surface-island-strong + shadow-lg</code></div>
  </div>
</Story>

<Story name="Durations" asChild>
  <div class="duration-grid">
    <button class="motion fast" type="button"><span></span><strong>Fast · 100 ms</strong></button>
    <button class="motion normal" type="button"><span></span><strong>Normal · 200 ms</strong></button>
    <button class="motion slow" type="button"><span></span><strong>Slow · 300 ms</strong></button>
  </div>
</Story>

<Story name="Glow" asChild>
  <div class="glow-grid">
    <div class="glow brand"><strong>Brand</strong><span>Selected or focused</span></div>
    <div class="glow pressure"><strong>Pressure</strong><span>Destructive confirmation</span></div>
    <div class="glow signal"><strong>Signal</strong><span>Positive confirmation</span></div>
  </div>
</Story>

<style>
  .surface-grid,
  .duration-grid,
  .glow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: var(--space-5);
    inline-size: 100%;
  }
  .surface,
  .glow {
    display: grid;
    align-content: end;
    gap: var(--space-2);
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    min-block-size: 9rem;
    color: var(--color-text-secondary);
  }
  .sunken {
    background: var(--color-surface-sunken);
  }
  .island {
    box-shadow: var(--shadow-sm);
    background: var(--color-surface-island);
  }
  .overlay {
    box-shadow: var(--shadow-lg);
    background: var(--color-surface-island-strong);
  }
  strong {
    color: var(--color-text-primary);
  }
  code,
  .glow span {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }
  code {
    font-family: var(--font-family-mono);
  }
  .motion {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-subtle);
    padding: var(--space-4);
    color: var(--color-text-primary);
    text-align: start;
  }
  .motion span {
    border-radius: var(--radius-round);
    background: var(--base-brand);
    inline-size: var(--space-4);
    block-size: var(--space-4);
  }
  .motion:hover span,
  .motion:focus-visible span {
    transform: translateX(var(--space-10));
    box-shadow: var(--shadow-glow-brand);
  }
  .motion:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
  .fast span {
    transition:
      transform var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
  }
  .normal span {
    transition:
      transform var(--duration-normal) var(--easing-standard),
      box-shadow var(--duration-normal) var(--easing-standard);
  }
  .slow span {
    transition:
      transform var(--duration-slow) var(--easing-standard),
      box-shadow var(--duration-slow) var(--easing-standard);
  }
  .brand {
    box-shadow: var(--shadow-glow-brand);
    background: color-mix(in oklab, var(--base-brand) var(--color-mix-2), var(--color-surface-island));
  }
  .pressure {
    box-shadow: var(--shadow-glow-pressure);
    background: color-mix(in oklab, var(--base-pressure) var(--color-mix-2), var(--color-surface-island));
  }
  .signal {
    box-shadow: var(--shadow-glow-signal);
    background: color-mix(in oklab, var(--base-signal) var(--color-mix-2), var(--color-surface-island));
  }
  @media (prefers-reduced-motion: reduce) {
    .motion span {
      transition: none;
    }
  }
</style>
