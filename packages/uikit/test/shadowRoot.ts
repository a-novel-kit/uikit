import { onTestFinished } from "vitest";

/**
 * Attaches an open shadow root to a new element at the end of the page, as an interface that embeds uikit does. The
 * root holds a copy of the page's style elements, so the components rendered in it keep their rules, and it inherits
 * the page's tokens through its host. The host leaves the page when the test ends.
 */
export function attachShadowRoot(): ShadowRoot {
  const host = document.body.appendChild(document.createElement("div"));
  onTestFinished(() => host.remove());
  const root = host.attachShadow({ mode: "open" });
  root.append(...[...document.querySelectorAll("style, link[rel=stylesheet]")].map((style) => style.cloneNode(true)));
  return root;
}

/**
 * Imports a module of a second copy of uikit, which the browser project serves (`vitest.browser.config.ts`): its
 * modules share nothing with the first copy's but their dependencies and the page. `path` starts from this folder.
 */
export function importCopy<Module>(path: string): Promise<Module> {
  return import(/* @vite-ignore */ `${path}?copy&lang${path.slice(path.lastIndexOf("."))}`);
}
