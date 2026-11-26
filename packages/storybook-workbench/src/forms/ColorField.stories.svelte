<script module lang="ts">
  import CustomColorPair from "../foundations/CustomColorPair.svelte";
  import { freeColors } from "../foundations/customColors.fixture";

  import { Card, ColorField, createValueController } from "@a-novel-kit/uikit";
  import { fixedValue } from "@a-novel-kit/uikit-storybook";
  import { swatches } from "@a-novel-kit/uikit-tokens/palette";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Forms/Color field",
    component: ColorField,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Picks an item's custom color from a grid of squares: a blank square for no color, the swatches, and a last square that opens the browser's own color input for any other opaque color. No color is the default. The choices are native controls: arrow keys move through no color and the swatches, Tab reaches the color input, and each choice carries its name for assistive technology. The form receives a six-digit hex value, or an empty value for no color.",
        },
      },
    },
  });

  const amber = swatches.find((swatch) => swatch.name === "amber")!.hex;
  const violet = swatches.find((swatch) => swatch.name === "violet")!.hex;
  const lavender = freeColors.find((free) => free.name === "Lavender")!.hex;
  const black = freeColors.find((free) => free.name === "Black")!.hex;
</script>

<script lang="ts">
  const noColor = fixedValue<string | undefined>(undefined);
  const swatchChosen = fixedValue<string | undefined>(amber);
  const darkSwatchChosen = fixedValue<string | undefined>(violet);
  const freeChosen = fixedValue<string | undefined>(lavender);
  const blackChosen = fixedValue<string | undefined>(black);

  const live = createValueController<string | undefined>({ initialValue: undefined });
</script>

<Story
  name="States"
  parameters={{
    docs: {
      description: {
        story:
          "A swatch rests dimmed toward its hue's tint, and the chosen one shows its color at full strength: its light marks it, with no line. The blank square is no color. A color outside the swatches shows in the last square, where the color input sits.",
      },
    },
  }}
  asChild
>
  <div class="states">
    <ColorField legend="No color" name="none" controller={noColor} />
    <ColorField legend="A swatch" name="swatch" controller={swatchChosen} />
    <ColorField legend="A dark swatch" name="dark" controller={darkSwatchChosen} />
    <ColorField legend="Another color" name="free" controller={freeChosen} />
    <ColorField legend="Black" name="black" controller={blackChosen} />
    <ColorField
      legend="With a hint"
      hint="Shows on the tag and beside its name in lists."
      name="hint"
      controller={swatchChosen}
    />
    <ColorField legend="Invalid" error="Pick a color for this calendar." name="invalid" controller={noColor} />
    <ColorField legend="Disabled" name="disabled" controller={swatchChosen} disabled />
  </div>
</Story>

<Story
  name="On an island"
  parameters={{
    docs: {
      description: {
        story: "The squares draw the same on the canvas and inside an island.",
      },
    },
  }}
  asChild
>
  <div class="form">
    <Card>
      <ColorField legend="Color" name="island" controller={swatchChosen} />
    </Card>
  </div>
</Story>

<Story
  name="Try it"
  parameters={{
    docs: {
      description: {
        story:
          "A live field, to try the keyboard and the browser's color input: the pair beside it draws the chosen color.",
      },
    },
  }}
  asChild
>
  <div class="form">
    <ColorField legend="Color" name="live" controller={live} />
    <div class="preview">
      <CustomColorPair color={live.state.value}>Ink on tint</CustomColorPair>
      <CustomColorPair color={live.state.value} lit>Lit, as a label shows</CustomColorPair>
    </div>
  </div>
</Story>

<style>
  .form {
    display: grid;
    gap: var(--space-4);
    inline-size: min(100%, var(--layout-container-sm));
  }

  /* The states sit side by side while they fit, each in a column as wide as a small floating surface. */
  .states {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--layout-floating-sm), 1fr));
    gap: var(--space-8) var(--space-6);
    inline-size: min(100%, var(--layout-container-md));
  }

  .preview {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
</style>
