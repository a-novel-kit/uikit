<script module lang="ts">
  import {
    Button,
    Card,
    Container,
    Dialog,
    FormActions,
    IconButton,
    PictureFrame,
    createPictureFrameController,
  } from "@a-novel-kit/uikit";
  import type { AspectRatio, OpenController, PictureCrop, PictureFrameController } from "@a-novel-kit/uikit";
  import { reviewStoryGlobals } from "@a-novel-kit/uikit-storybook";

  import { X as CloseIcon } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Forms/Picture frame",
    component: PictureFrame,
    parameters: {
      docs: {
        description: {
          component: "Frames a chosen image at an exact aspect ratio before the browser encodes it.",
        },
      },
    },
  });

  const scene = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="oklch(0.82 0.11 65)"/><stop offset="1" stop-color="oklch(0.47 0.11 315)"/></linearGradient></defs>
    <rect width="1600" height="1200" fill="url(#sky)"/>
    <circle cx="1040" cy="430" r="170" fill="oklch(0.93 0.08 90)"/>
    <path d="M0 820l260-220 220 160 300-300 340 320 240-170 240 200v390H0z" fill="oklch(0.37 0.08 285)"/>
    <path d="M0 960l320-130 360 100 420-160 500 190v240H0z" fill="oklch(0.29 0.06 280)"/>
  </svg>`;

  /** A 4:3 landscape with its sun off center, so a square and a 16:9 frame each crop it. */
  const landscape = { url: `data:image/svg+xml,${encodeURIComponent(scene)}`, width: 1600, height: 1200 };
  const square: AspectRatio = { width: 1, height: 1 };
  const wide: AspectRatio = { width: 16, height: 9 };

  /** Pins a frame on a crop of the landscape; drags, keys and the slider leave it as it is. */
  function fixedFrame(ratio: AspectRatio, crop: PictureCrop): PictureFrameController {
    return { state: { source: landscape, ratio, crop }, pan: () => {}, zoom: () => {} };
  }

  /** The square framed around the sun, a little closer than the whole height. */
  const avatar = fixedFrame(square, { zoom: 1.4, x: 612, y: 0 });
  /** The 16:9 frame a little closer than the whole width, the sun near its top third. */
  const background = fixedFrame(wide, { zoom: 1.2, x: 233, y: 105 });
</script>

<script lang="ts">
  import { fixedOpen } from "../controllers";

  const opened = fixedOpen(true);
  const live = createPictureFrameController({ source: landscape, ratio: wide });
</script>

{#snippet closeAction(controller: OpenController)}
  <IconButton label="Close dialog" variant="ghost" tone="neutral" size="sm" onclick={controller.close}>
    <CloseIcon size="var(--icon-size-sm)" />
  </IconButton>
{/snippet}

{#snippet avatarDialog()}
  <Dialog
    controller={opened}
    title="Change your picture"
    description="Choose an image, then move and zoom it to frame your picture."
    size="sm"
  >
    {#snippet headerActions()}{@render closeAction(opened)}{/snippet}
    <PictureFrame controller={avatar} shape="circle" />
    <FormActions align="stretch"><Button>Save picture</Button></FormActions>
  </Dialog>
{/snippet}

{#snippet backgroundDialog(saving = false)}
  <Dialog controller={opened} title="Project background" description="Move and zoom the image to frame the background.">
    {#snippet headerActions()}{@render closeAction(opened)}{/snippet}
    <PictureFrame controller={background} label="Background frame" zoomLabel="Background zoom" disabled={saving} />
    <FormActions align="stretch">
      <Button disabled={saving}>{saving ? "Saving background…" : "Save background"}</Button>
    </FormActions>
  </Dialog>
{/snippet}

<Story name="Avatar, desktop" exportName="AvatarDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render avatarDialog()}
</Story>

<Story name="Avatar, mobile" exportName="AvatarMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render avatarDialog()}
</Story>

<Story name="Background, desktop" exportName="BackgroundDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render backgroundDialog()}
</Story>

<Story name="Background, mobile" exportName="BackgroundMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render backgroundDialog()}
</Story>

<Story name="Saving, desktop" exportName="SavingDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render backgroundDialog(true)}
</Story>

<Story name="Saving, mobile" exportName="SavingMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render backgroundDialog(true)}
</Story>

<Story name="Live" asChild>
  <Container size="sm">
    <Card><PictureFrame controller={live} label="Background frame" zoomLabel="Background zoom" /></Card>
  </Container>
</Story>
