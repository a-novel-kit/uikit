import { DocsContext, type StoryProps, useOf } from "@storybook/addon-docs/blocks";
import { type CSSProperties, useContext, useEffect, useMemo, useState } from "react";

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
    scale: 0.85,
    type: "desktop",
    width: 1280,
  },
  mobile: {
    height: 844,
    id: "agoraMobile",
    label: "Mobile",
    scale: 0.85,
    type: "mobile",
    width: 390,
  },
} as const satisfies Record<string, ReviewViewport>;

/**
 * Pins a story's canvas viewport to the dimensions installed by the shared preview.
 *
 * @example
 * ```ts
 * import { reviewStoryGlobals } from "@a-novel-kit/uikit-storybook";
 * const mobileGlobals = reviewStoryGlobals.mobile;
 * ```
 */
export const reviewStoryGlobals = {
  /** Desktop viewport (1280×800), without rotation. */
  desktop: {
    /** Storybook viewport-addon state for the desktop preset. */
    viewport: { value: reviewViewports.desktop.id, isRotated: false },
  },
  /** Mobile viewport (390×844), without rotation. */
  mobile: {
    /** Storybook viewport-addon state for the mobile preset. */
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
  /** Named CSF story export rendered at 1280×800; a component or module object is invalid. */
  desktop: StoryExport;
  /** CSF module exports when the documentation page is not attached to the stories. */
  meta?: StoryProps["meta"];
  /** Named CSF story export rendered at 390×844; may be the same story as desktop. */
  mobile: StoryExport;
  /** Element ID (without #) to scroll into view after each iframe loads, honoring scroll-margin-top. */
  startAt?: string;
}

interface ReviewFrameProps {
  meta?: StoryProps["meta"];
  startAt?: string;
  story: StoryExport;
  viewport: ReviewViewport;
}

function serializedGlobals(globals: Record<string, unknown>) {
  return Object.entries(globals)
    .flatMap(([name, value]) => {
      if (typeof value !== "boolean" && typeof value !== "number" && typeof value !== "string") return [];
      const serializedValue = typeof value === "boolean" ? `!${value}` : String(value);
      return `${encodeURIComponent(name)}:${encodeURIComponent(serializedValue)}`;
    })
    .join(";");
}

function storyUrl(storyId: string, globals: Record<string, unknown>) {
  const parameters = new URLSearchParams({ embed: "true", id: storyId, viewMode: "story" });
  const serialized = serializedGlobals({ ...globals, measureEnabled: false, outline: false });
  if (serialized) parameters.set("globals", serialized);
  return `iframe.html?${parameters.toString()}`;
}

/** Clears initial autofocus and aligns the requested section in a review iframe. */
export function prepareReviewDocument(frame: HTMLIFrameElement, startAt: string | undefined) {
  const reviewDocument = frame.contentDocument;
  const reviewWindow = frame.contentWindow;
  if (!reviewDocument || !reviewWindow) return;

  const settle = () => {
    const activeElement = reviewDocument.activeElement;
    if (activeElement && "blur" in activeElement && typeof activeElement.blur === "function") activeElement.blur();

    if (!startAt) return true;
    const target = reviewDocument.getElementById(startAt);
    if (!target) return false;
    const margin = Number.parseFloat(reviewWindow.getComputedStyle(target).scrollMarginTop) || 0;
    reviewWindow.scrollTo({
      top: reviewWindow.scrollY + target.getBoundingClientRect().top - margin,
      behavior: "instant",
    });
    return true;
  };

  const aligned = settle();
  reviewWindow.requestAnimationFrame(() => reviewWindow.requestAnimationFrame(settle));

  if (aligned || !startAt) return;

  const observer = new MutationObserver(() => {
    if (!settle()) return;
    observer.disconnect();
    reviewWindow.requestAnimationFrame(() => reviewWindow.requestAnimationFrame(settle));
  });
  observer.observe(reviewDocument, { childList: true, subtree: true });
  reviewWindow.setTimeout(() => observer.disconnect(), 10_000);
}

function ReviewFrame({ meta, startAt, story, viewport }: ReviewFrameProps) {
  const docsContext = useContext(DocsContext);
  if (meta) docsContext.referenceMeta(meta, false);
  const preparedStory = useOf(story, ["story"]).story;
  const [globals, setGlobals] = useState<Record<string, unknown>>(
    () => docsContext.getStoryContext(preparedStory).globals
  );
  const source = useMemo(() => storyUrl(preparedStory.id, globals), [globals, preparedStory.id]);

  useEffect(() => {
    const updateGlobals = ({ globals: nextGlobals }: { globals: Record<string, unknown> }) => setGlobals(nextGlobals);
    docsContext.channel.on("globalsUpdated", updateGlobals);
    return () => docsContext.channel.off("globalsUpdated", updateGlobals);
  }, [docsContext.channel]);

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
            <iframe
              className="agora-story-review__iframe"
              id={`iframe--${preparedStory.id}--${viewport.id}`}
              loading="lazy"
              src={source}
              onLoad={(event) => prepareReviewDocument(event.currentTarget, startAt)}
              title={`${viewport.label}: ${preparedStory.name}`}
            />
          </div>
        </div>
      </div>
    </figure>
  );
}

/**
 * Renders desktop and mobile stories in separate iframes at 85% scale, wrapping on narrower docs pages.
 * Requires the shared preview styles. Primitive toolbar globals such as locale follow the docs page;
 * initial autofocus is cleared while scrolling, text selection, and story interactions remain available.
 *
 * @example
 * ```mdx
 * import { Meta, ResponsiveStoryPair } from "@a-novel-kit/uikit-storybook";
 * import * as Stories from "./Screen.stories.svelte";
 *
 * <Meta of={Stories} />
 * <ResponsiveStoryPair desktop={Stories.Default} mobile={Stories.Default} />
 * ```
 */
export function ResponsiveStoryPair({ desktop, meta, mobile, startAt }: ResponsiveStoryPairProps) {
  return (
    <section className="agora-story-review" aria-label="Desktop and mobile previews">
      <ReviewFrame story={desktop} meta={meta} startAt={startAt} viewport={reviewViewports.desktop} />
      <ReviewFrame story={mobile} meta={meta} startAt={startAt} viewport={reviewViewports.mobile} />
    </section>
  );
}
