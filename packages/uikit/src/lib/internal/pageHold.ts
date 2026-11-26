import { hold } from "./overModal.svelte";

/**
 * Holds the page behind a modal dialog inside a shadow root as Dialog's own `:root:has(dialog.dialog:modal)` rules
 * hold it behind a dialog in the page: the root blurs unless `blur` is false and keeps its scroll, frosted surfaces drop
 * their blur once the backdrop has faded in, and what animates pauses. A selector crosses no shadow boundary, and the
 * page may run another copy of uikit or none, so the dialog adopts a stylesheet of its own into the document and into
 * its shadow root, with the values of its own tokens. Each rule is important: it must outweigh the page's own frost,
 * which a dialog in the page outweighs through the specificity of `:has()`. Returns nothing for a dialog in the page.
 */
export function holdPage(dialog: HTMLDialogElement, blur: boolean) {
  const root = dialog.getRootNode();
  if (!(root instanceof ShadowRoot)) return undefined;

  const style = getComputedStyle(dialog);
  const token = (name: string) => style.getPropertyValue(name);
  const transition = `:root { transition: filter ${token("--motion-surface")} !important; }`;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    ${transition}
    :root { overflow: hidden !important; ${blur ? `filter: blur(${token("--blur-sm")}) !important;` : ""} }
    [data-frost]:not(dialog *) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      transition:
        background-color ${token("--motion-state")},
        box-shadow ${token("--motion-state")},
        backdrop-filter 0s ${token("--duration-normal")},
        -webkit-backdrop-filter 0s ${token("--duration-normal")} !important;
    }
    :not(dialog, dialog *),
    :not(dialog, dialog *)::before,
    :not(dialog, dialog *)::after {
      animation-play-state: paused !important;
    }
  `);
  const leaveScopes = [document, root].map((scope) => hold(scope.adoptedStyleSheets, sheet));

  return {
    /** Keeps the root's transition alone once the dialog closes, so the page's blur eases out as the dialog fades. */
    release: () => sheet.replaceSync(transition),
    /** Takes the stylesheet out of the page and the shadow root once the dialog has faded out. */
    leave: () => leaveScopes.forEach((leaveScope) => leaveScope()),
  };
}
