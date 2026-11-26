<script module lang="ts">
  import CustomColorPair from "./CustomColorPair.svelte";
  import { calendars, freeColors, tags } from "./customColors.fixture";
  import { paintedContrast, paintedHex } from "./paintedContrast";

  import { customColorStyle } from "@a-novel-kit/uikit";
  import { swatches } from "@a-novel-kit/uikit-tokens/palette";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Foundations/Custom colors",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "People color their own items, such as a tag or a calendar, with any opaque color, stored as a six-digit hex value, or with none. A custom color is a family apart from the three hues: it shows only on what a person colored, never on the interface. `customColorStyle` draws it: set its result as the item's style, then read `--color-mark-custom` for a small solid mark and the pair `--color-ink-custom` on `--color-tint-custom`, or their `-lit` forms for a label. An item without a color draws the neutral pair and no mark.",
        },
      },
    },
  });

  const name = (swatch: string) => swatch.charAt(0).toUpperCase() + swatch.slice(1);

  /** Reads one declaration out of a custom color's style. */
  const declared = (style: string, token: string) =>
    style
      .split(";")
      .find((declaration) => declaration.startsWith(`${token}:`))!
      .slice(token.length + 1);

  /** Measures each pair of a color at a hue, as the browser paints it. */
  function measureHue(hue: number) {
    const hex = paintedHex(`oklch(0.7 0.1 ${hue})`);
    const style = customColorStyle(hex);
    const canvas = getComputedStyle(document.documentElement).getPropertyValue("--color-surface-canvas");
    const pair = (suffix: string) =>
      paintedContrast(
        declared(style, `--color-ink-custom${suffix}`),
        declared(style, `--color-tint-custom${suffix}`),
        canvas
      );

    return { hue, hex, resting: pair(""), lit: pair("-lit") };
  }
</script>

<script lang="ts">
  // Every whole hue of the circle, measured as the story mounts: Storybook renders in the browser only.
  const circle = Array.from({ length: 360 }, (_, hue) => measureHue(hue));
  // The hues whose ink sits closest to its tint come first.
  const lowest = circle.toSorted((first, second) => first.resting - second.resting).slice(0, 8);
  const floor = {
    resting: Math.min(...circle.map(({ resting }) => resting)),
    lit: Math.min(...circle.map(({ lit }) => lit)),
  };
</script>

<Story
  name="Swatches"
  parameters={{
    docs: {
      description: {
        story:
          "The swatches are the three hues and the steps between them, about 30 degrees apart: brand at 232, pressure at 16, signal at 68. A swatch stores its hue's most saturated sRGB color, since a hex value holds no Display P3; drawing takes the hue back from it, so each pair is its hue's neon on the third step of its ramp, as the three hues' pairs are. The ratio beside each pair is measured as the browser paints it on the canvas.",
      },
    },
  }}
  asChild
>
  <div class="scroller"
    ><table>
      <thead>
        <tr><th>Swatch</th><th>Stored</th><th>Hue</th><th>Ink on tint</th><th>Lit, as a label shows</th></tr>
      </thead>
      <tbody>
        {#each swatches as swatch (swatch.hex)}
          <tr>
            <th scope="row">
              <span class="mark" style={customColorStyle(swatch.hex)}></span>
              {name(swatch.name)}
            </th>
            <td><code>{swatch.hex}</code></td>
            <td>{swatch.hue}</td>
            <td><CustomColorPair color={swatch.hex}>{name(swatch.name)}</CustomColorPair></td>
            <td><CustomColorPair color={swatch.hex} lit>{name(swatch.name)}</CustomColorPair></td>
          </tr>
        {/each}
        <tr>
          <th scope="row"><span class="mark" style={customColorStyle()}></span>No color</th>
          <td></td>
          <td></td>
          <td><CustomColorPair>No color</CustomColorPair></td>
          <td><CustomColorPair lit>No color</CustomColorPair></td>
        </tr>
      </tbody>
    </table></div
  >
</Story>

<Story
  name="Any color"
  parameters={{
    docs: {
      description: {
        story:
          "The mark shows the exact color. What is filled under text takes the color's hue alone, at the strength every hue's pair has: a pastel, a neon and a dark shade of one hue fill alike, so text reads whatever was picked. A color with no hue (black, white, a gray) keeps its mark and draws the neutral pair.",
      },
    },
  }}
  asChild
>
  <div class="scroller"
    ><table>
      <thead>
        <tr><th>The color picked</th><th>Stored</th><th>Ink on tint</th><th>Lit, as a label shows</th></tr>
      </thead>
      <tbody>
        {#each freeColors as free (free.hex)}
          <tr>
            <th scope="row">
              <span class="mark" style={customColorStyle(free.hex)}></span>
              {free.name}
            </th>
            <td><code>{free.hex}</code></td>
            <td><CustomColorPair color={free.hex}>{free.name}</CustomColorPair></td>
            <td><CustomColorPair color={free.hex} lit>{free.name}</CustomColorPair></td>
          </tr>
        {/each}
      </tbody>
    </table></div
  >
</Story>

<Story
  name="In use"
  parameters={{
    docs: {
      description: {
        story:
          "A tag is a label, so it shows the lit pair. A calendar carries its mark beside its name, and its events fill with its tint under primary text. An item without a color stays neutral.",
      },
    },
  }}
  asChild
>
  <div class="examples">
    <div class="tags">
      {#each tags as tag (tag.name)}
        <span class="tag" style={customColorStyle(tag.color)}>{tag.name}</span>
      {/each}
    </div>
    <div class="calendars">
      {#each calendars as calendar (calendar.name)}
        <div class="calendar" style={customColorStyle(calendar.color)}>
          <span class="calendar-name"><span class="mark"></span>{calendar.name}</span>
          {#each calendar.events as event (event.time)}
            <span class="event"><span class="time">{event.time}</span>{event.title}</span>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</Story>

<Story
  name="Measured contrast"
  parameters={{
    docs: {
      description: {
        story:
          "The pair of a color depends on its hue alone, so measuring every whole hue of the circle measures every color a person can pick. Each ratio is read from what the browser paints. The eight hues whose ink sits closest to its tint are listed: the blues and violets, whose neon is dark, so their ink climbs the furthest.",
      },
    },
  }}
  asChild
>
  <div class="measured">
    <p>
      Across the 360 hues, an ink keeps at least <strong>{floor.resting.toFixed(2)}:1</strong> on its tint, and a lit
      ink at least <strong>{floor.lit.toFixed(2)}:1</strong> on its lit tint.
    </p>
    <table>
      <thead>
        <tr><th>Hue</th><th>A color of that hue</th><th>Ink on tint</th><th>Lit</th></tr>
      </thead>
      <tbody>
        {#each lowest as measure (measure.hue)}
          <tr>
            <th scope="row">{measure.hue}</th>
            <td><span class="mark" style={customColorStyle(measure.hex)}></span><code>{measure.hex}</code></td>
            <td><CustomColorPair color={measure.hex}>Ink on tint</CustomColorPair></td>
            <td><CustomColorPair color={measure.hex} lit>Lit</CustomColorPair></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Story>

<style>
  /* A table wider than a narrow screen scrolls inside its own box. */
  .scroller,
  .measured {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    inline-size: 100%;
    color: var(--color-text-secondary);
    font: var(--text-ui);
  }

  th,
  td {
    border-block-end: var(--border-width-thin) solid var(--color-border-divider);
    padding: var(--space-2) var(--space-3);
    text-align: start;
    white-space: nowrap;
  }

  thead th {
    color: var(--color-text-muted);
    font: var(--text-ui-strong);
  }

  tbody th {
    color: var(--color-text-primary);
    font: var(--text-ui);
  }

  code {
    color: var(--color-text-muted);
    font: var(--text-code);
  }

  /* A small solid mark shows the exact color. Its rim stays opaque, so a dark color keeps its shape; without a
     color, the rim alone shows. */
  .mark {
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
    margin-inline-end: var(--space-2);
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-round);
    background: var(--color-mark-custom);
    inline-size: var(--size-3);
    block-size: var(--size-3);
  }

  .examples {
    display: grid;
    gap: var(--space-4);
  }

  .measured p {
    margin-block: 0 var(--space-4);
    color: var(--color-text-secondary);
    font: var(--text-body-sm);
  }

  .measured strong {
    color: var(--color-text-primary);
  }

  .tags,
  .calendars {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: var(--space-1-5);
  }

  /* A tag is a label: it always shows the lit pair. */
  .tag {
    border-radius: var(--radius-sm);
    background: var(--color-tint-custom-lit);
    padding: var(--space-1) var(--space-2);
    color: var(--color-ink-custom-lit);
    font: var(--text-tag);
  }

  .calendars {
    gap: var(--space-4);
  }

  .calendar {
    display: grid;
    gap: var(--space-1);
    inline-size: var(--layout-floating-sm);
  }

  .calendar-name {
    color: var(--color-text-secondary);
    font: var(--text-ui);
  }

  /* An event is filled under text, so it takes the tint, under primary text. */
  .event {
    display: grid;
    border-radius: var(--radius-md);
    background: var(--color-tint-custom);
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-primary);
    font: var(--text-ui);
  }

  .time {
    color: var(--color-text-secondary);
    font: var(--text-meta);
  }
</style>
