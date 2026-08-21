import { Story, type StoryProps } from "@storybook/addon-docs/blocks";
import type { CSSProperties } from "react";

type StoryExport = Exclude<StoryProps["of"], undefined>;

interface ReviewViewport {
  height: number;
  id: string;
  label: string;
  scale: number;
  type: "desktop" | "mobile";
  width: number;
}

const reviewViewports = {
  desktop: {
    height: 800,
    id: "agoraDesktop",
    label: "Desktop",
    scale: 0.5,
    type: "desktop",
    width: 1280,
  },
  mobile: {
    height: 844,
    id: "agoraMobile",
    label: "Mobile",
    scale: 0.62,
    type: "mobile",
    width: 390,
  },
} as const satisfies Record<string, ReviewViewport>;

/** Viewport globals for stories that must retain their review size in the canvas. */
export const reviewStoryGlobals = {
  desktop: {
    viewport: { value: reviewViewports.desktop.id, isRotated: false },
  },
  mobile: {
    viewport: { value: reviewViewports.mobile.id, isRotated: false },
  },
} as const;

/** Viewport options installed by the shared Storybook preview. */
export const reviewViewportOptions = {
  [reviewViewports.desktop.id]: {
    name: reviewViewports.desktop.label,
    styles: {
      height: `${reviewViewports.desktop.height}px`,
      width: `${reviewViewports.desktop.width}px`,
    },
    type: reviewViewports.desktop.type,
  },
  [reviewViewports.mobile.id]: {
    name: reviewViewports.mobile.label,
    styles: {
      height: `${reviewViewports.mobile.height}px`,
      width: `${reviewViewports.mobile.width}px`,
    },
    type: reviewViewports.mobile.type,
  },
} as const;

/** Stories and metadata rendered by a responsive documentation comparison. */
export interface ResponsiveStoryPairProps {
  /** Story export rendered at the desktop review viewport. */
  desktop: StoryExport;
  /** CSF module exports when the documentation page is not attached to the stories. */
  meta?: StoryProps["meta"];
  /** Story export rendered at the mobile review viewport. */
  mobile: StoryExport;
}

interface ReviewFrameProps {
  meta?: StoryProps["meta"];
  story: StoryExport;
  viewport: ReviewViewport;
}

function ReviewFrame({ meta, story, viewport }: ReviewFrameProps) {
  const scaledSize = {
    blockSize: viewport.height * viewport.scale,
    inlineSize: viewport.width * viewport.scale,
  } satisfies CSSProperties;
  const documentSize = {
    blockSize: viewport.height,
    inlineSize: viewport.width,
    transform: `scale(${viewport.scale})`,
  } satisfies CSSProperties;

  return (
    <figure className="agora-story-review__frame">
      <figcaption className="agora-story-review__caption">
        <strong>{viewport.label}</strong>
        <span>
          {viewport.width} × {viewport.height} · {Math.round(viewport.scale * 100)}%
        </span>
      </figcaption>
      <div className="agora-story-review__scroll">
        <div className="agora-story-review__viewport" style={scaledSize}>
          <div className="agora-story-review__document" style={documentSize}>
            <Story of={story} meta={meta} inline={false} height={`${viewport.height}px`} />
          </div>
        </div>
      </div>
    </figure>
  );
}

/** Renders desktop and mobile story exports in isolated, proportionally scaled subdocuments. */
export function ResponsiveStoryPair({ desktop, meta, mobile }: ResponsiveStoryPairProps) {
  return (
    <section className="agora-story-review" aria-label="Desktop and mobile previews">
      <ReviewFrame story={desktop} meta={meta} viewport={reviewViewports.desktop} />
      <ReviewFrame story={mobile} meta={meta} viewport={reviewViewports.mobile} />
    </section>
  );
}
