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

function ReviewFrame({ meta, story, viewport }: ReviewFrameProps) {
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
              title={`${viewport.label}: ${preparedStory.name}`}
            />
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
