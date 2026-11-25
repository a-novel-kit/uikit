<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Foundations/Motion & depth",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Depth separates temporary or raised content: islands stay flat, with a hairline ring and a soft shadow. Motion confirms a state change and follows reduced-motion preferences.",
        },
      },
    },
  });
</script>

<Story name="Surfaces" asChild>
  <div class="surface-grid">
    <div class="surface sunken"><strong>Sunken</strong><code>surface-sunken</code></div>
    <div class="surface island"><strong>Island</strong><code>surface-island-glass + shadow-ring</code></div>
    <div class="surface overlay"><strong>Overlay</strong><code>surface-island-strong + shadow-lg</code></div>
  </div>
</Story>

<Story
  name="Lamp"
  asChild
  parameters={{
    docs: {
      description: {
        story:
          "The application imports `@a-novel-kit/uikit-tokens/canvas.css`, which hangs the lamp (`--gradient-lamp`) behind the page, and colors it with `--color-lamp` on its root element, such as `--color-lamp-magenta`, so each app is recognizable at a glance. An ember lights any app that sets none. Navigation the lamp crosses uses `--fill-navigation`.",
      },
    },
  }}
>
  <div class="lamp">
    <div class="surface island"><strong>Island</strong><code>surface-island-glass</code></div>
  </div>
</Story>

<Story name="Durations" asChild>
  <div class="duration-grid">
    <button class="motion fast" type="button"><span></span><strong>Fast · 100 ms</strong></button>
    <button class="motion normal" type="button"><span></span><strong>Normal · 200 ms</strong></button>
    <button class="motion slow" type="button"><span></span><strong>Slow · 300 ms</strong></button>
  </div>
</Story>

<style>
  .surface-grid,
  .duration-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: var(--space-4);
    inline-size: 100%;
  }
  .surface {
    display: grid;
    align-content: end;
    gap: var(--space-2);
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    min-block-size: 9rem;
    color: var(--color-text-secondary);
  }
  .sunken {
    background: var(--color-surface-sunken);
  }
  .island {
    box-shadow: var(--shadow-ring);
    background: var(--color-surface-island-glass);
  }
  .overlay {
    box-shadow: var(--shadow-lg);
    background: var(--color-surface-island-strong);
  }
  .lamp {
    display: grid;
    align-content: end;
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    background:
      var(--gradient-lamp) fixed,
      var(--color-surface-canvas);
    padding: var(--space-8);
    min-block-size: 24rem;
  }
  strong {
    color: var(--color-text-primary);
  }
  code {
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
    inline-size: var(--size-3);
    block-size: var(--size-3);
  }
  .motion:hover span,
  .motion:focus-visible span {
    transform: translateX(var(--space-12));
  }
  .motion:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
  .fast span {
    transition: transform var(--motion-state);
  }
  .normal span {
    transition: transform var(--motion-surface);
  }
  .slow span {
    transition: transform var(--duration-slow) var(--easing-standard);
  }
  @media (prefers-reduced-motion: reduce) {
    .motion span {
      transition: none;
    }
  }
</style>
