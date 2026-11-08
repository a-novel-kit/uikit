<!--
@component
Frames a picture at an exact aspect ratio, driven by `createPictureFrameController` or a compatible
controller. A drag or the arrow keys move the image under the frame, and the slider, the + and -
keys, the mouse wheel or a pinch zoom it. Encode the framed picture with `browserPictureFiles.encode`.

```svelte
<PictureFrame controller={background} label="Background frame" zoomLabel="Background zoom" />
```
-->
<script lang="ts" module>
  import type { PictureFrameController } from "./controllers.svelte";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a frame that pans and zooms a picture at an exact aspect ratio. */
  export interface PictureFrameProps extends HTMLAttributes<HTMLDivElement> {
    /** State owner that decides how the image moves and zooms under the frame. */
    controller: PictureFrameController;
    /** Accessible name of the frame; give each frame of a form its own. Defaults to "Picture frame". */
    label?: string;
    /** Visible label of the zoom slider. Defaults to "Zoom". */
    zoomLabel?: string;
    /** How the app shows the picture: "circle" dims what a round avatar hides. Defaults to "rectangle". */
    shape?: "rectangle" | "circle";
    /** Keeps the image still, such as while the framed picture saves. */
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { SliderController } from "./Slider.svelte";
  import Slider from "./Slider.svelte";
  import { useMessages } from "./internal/i18n";
  import { imagePlacement, maxZoom } from "./picture";

  import type { Attachment } from "svelte/attachments";

  const { t } = useMessages();

  let {
    controller,
    label = t("pictureFrame.label"),
    zoomLabel = t("pictureFrame.zoom"),
    shape = "rectangle",
    disabled = false,
    class: className = "",
    ...rest
  }: PictureFrameProps = $props();

  const id = $props.id();
  const placement = $derived(imagePlacement(controller.state));

  /** The share of the frame's width an arrow key moves the image by, and the factor a + or - key zooms by. */
  const keyStep = 0.05;
  const keyZoom = 1.1;

  const zoomSlider: SliderController = {
    get state() {
      return { value: controller.state.crop.zoom };
    },
    setValue: (zoom) => controller.zoom(zoom),
  };

  // The pointers on the frame are a gesture's bookkeeping, which nothing renders.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const pointers = new Map<number, { x: number; y: number }>();

  /** Reads a point of the viewport as fractions of the frame's width and height. */
  function framePoint(frame: HTMLElement, point: { x: number; y: number }) {
    const box = frame.getBoundingClientRect();
    return { x: (point.x - box.left) / box.width, y: (point.y - box.top) / box.height, width: box.width };
  }

  function grab(event: PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  /** Pans the image under one pointer, and zooms it around the middle of two. */
  function drag(event: PointerEvent) {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const frame = event.currentTarget as HTMLElement;
    const next = { x: event.clientX, y: event.clientY };
    pointers.set(event.pointerId, next);

    const other = [...pointers].find(([pointerId]) => pointerId !== event.pointerId)?.[1];
    if (!other) {
      const { width } = framePoint(frame, next);
      controller.pan((next.x - previous.x) / width, (next.y - previous.y) / width);
      return;
    }

    const spread =
      Math.hypot(next.x - other.x, next.y - other.y) / Math.hypot(previous.x - other.x, previous.y - other.y);
    const focus = framePoint(frame, { x: (next.x + other.x) / 2, y: (next.y + other.y) / 2 });
    controller.zoom(controller.state.crop.zoom * spread, focus.x, focus.y);
  }

  function release(event: PointerEvent) {
    pointers.delete(event.pointerId);
  }

  function press(event: KeyboardEvent) {
    if (disabled) return;
    const zoom = controller.state.crop.zoom;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => controller.pan(-keyStep, 0),
      ArrowRight: () => controller.pan(keyStep, 0),
      ArrowUp: () => controller.pan(0, -keyStep),
      ArrowDown: () => controller.pan(0, keyStep),
      "+": () => controller.zoom(zoom * keyZoom),
      "=": () => controller.zoom(zoom * keyZoom),
      "-": () => controller.zoom(zoom / keyZoom),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    move();
  }

  /** Zooms on the wheel around the pointer. Svelte listens to the wheel passively, which cannot keep the page still. */
  const wheelZoom: Attachment<HTMLElement> = (frame) => {
    function zoom(event: WheelEvent) {
      event.preventDefault();
      const focus = framePoint(frame, { x: event.clientX, y: event.clientY });
      controller.zoom(controller.state.crop.zoom * Math.exp(-event.deltaY / 500), focus.x, focus.y);
    }
    frame.addEventListener("wheel", zoom, { passive: false });
    return () => frame.removeEventListener("wheel", zoom);
  };
</script>

<div class="picture-frame {className}" {...rest}>
  <!-- The application role is the ARIA one for a focusable area with its own keys and gestures,
       which no widget role describes: arrows move the image, + and - zoom it. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <div
    class="frame"
    role="application"
    tabindex="0"
    aria-label={label}
    aria-describedby={`${id}-instructions`}
    aria-disabled={disabled}
    style:--frame-ratio={controller.state.ratio.width / controller.state.ratio.height}
    onpointerdown={grab}
    onpointermove={drag}
    onpointerup={release}
    onpointercancel={release}
    onkeydown={press}
    {@attach wheelZoom}
  >
    <img
      src={controller.state.source.url}
      alt=""
      draggable="false"
      style:--image-width={`${placement.width}%`}
      style:--image-left={`${placement.left}%`}
      style:--image-top={`${placement.top}%`}
    />
    {#if shape === "circle"}<span class="mask" aria-hidden="true"></span>{/if}
  </div>
  <p id={`${id}-instructions`} class="instructions">{t("pictureFrame.instructions")}</p>
  <Slider label={zoomLabel} controller={zoomSlider} min={1} max={maxZoom} step={0.01} showValue={false} {disabled} />
</div>

<style>
  .picture-frame {
    display: grid;
    gap: var(--space-4);
  }

  /* The frame fills its container up to 20rem tall, which a phone shows whole beside the slider. */
  .frame {
    position: relative;
    justify-self: center;
    cursor: grab;
    border-radius: var(--radius-md);
    background: var(--color-surface-sunken);
    aspect-ratio: var(--frame-ratio);
    inline-size: min(100%, calc(var(--font-size-base) * var(--multiplier-20) * var(--frame-ratio)));
    overflow: hidden;
    touch-action: none;
    user-select: none;
  }

  .frame:active {
    cursor: grabbing;
  }

  .frame:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
  }

  .frame[aria-disabled="true"] {
    pointer-events: none;
  }

  /* The image sits on physical edges: it frames the same rectangle in every writing direction. */
  img {
    position: absolute;
    top: var(--image-top);
    left: var(--image-left);
    width: var(--image-width);
    max-inline-size: none;
    block-size: auto;
  }

  .mask {
    position: absolute;
    inset: 0;
    box-shadow: 0 0 0 100vmax var(--color-overlay-backdrop);
    border-radius: var(--radius-round);
  }

  .instructions {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }

  @media (forced-colors: active) {
    .frame:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }
</style>
