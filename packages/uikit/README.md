# @a-novel-kit/uikit

The Svelte components of the A-Novel design system. They render with the tokens of
`@a-novel-kit/uikit-tokens` and the faces of `@a-novel-kit/uikit-fonts`.

## Installation

Install the component package with its peer dependencies and the foundations your application imports.

```bash
pnpm add @a-novel-kit/uikit @a-novel-kit/uikit-fonts @a-novel-kit/uikit-tokens @a-novel-kit/nodelib-i18n i18next
```

Import the foundation styles and the page canvas once in the application shell.

```ts
import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/canvas.css";
import "@a-novel-kit/uikit-tokens/tokens.css";
```

Components, their prop types, and shared contracts such as `ComponentSize` are exported from the
package root.

```svelte
<script lang="ts">
  import { Button } from "@a-novel-kit/uikit";
</script>

<Button variant="solid">Continue</Button>
```

## Shadow roots

Components work inside a shadow root, which brings its own copy of their styles and of the tokens, and
may run its own copy of uikit. A modal `Dialog` there blurs and holds the page behind it as one in the
page does: while it shows, it adopts a stylesheet into the document, with the values of its own
tokens, so the page needs no copy of uikit. The page scrolls on its root, which the dialog holds
still, and marks its own frosted surfaces with `data-frost`, so they drop their blur under it. A
request the reader must answer, such as a `ConsentBanner`, shows in the topmost modal dialog of its
own copy of uikit. A dialog of another copy leaves it in the page, under its backdrop, until it closes.

## Localization

Built-in text, such as labels and placeholders, ships in English and French. Inside an
`@a-novel-kit/nodelib-i18n` provider, components join the app's i18next instance under the `uikit`
namespace and follow its language. Elsewhere, they render in English. An app's own `uikit` messages
always win, so an app can reword a message or translate uikit into another language. `useMessages()`
reads uikit's text from app code, as a page title that names the state the page shows does.

## Authorization

Mount `AuthorizationProvider` once with an app-owned controller. Boundaries inherit it, and an
optional `when` prop restricts access further. The headless controller and hook also import from
`@a-novel-kit/uikit/authorization`, which loads no Svelte component.

`ProtectedPage` renders a protected page once access is allowed, and otherwise the access state that stops it,
with uikit's translated copy. The state components behind it, such as `AccessForbiddenState`, also compose an app's
error page, as `PageNotFoundState` does.

Your adapter supplies server-derived decisions, and server endpoints still enforce access. See
[authorization setup and usage](https://a-novel-kit.github.io/uikit/?path=/docs/access-authorization--documentation).

## Design

Components keep the semantics of the native elements they render, such as buttons, dialogs, and form
controls. Tabs, menus, tooltips, and selection controls follow their WAI-ARIA Authoring Practices
patterns. Applications compose page shells, landmarks, workflows, and domain content from
these components.

Components use semantic color tokens and generated metric tokens. An application can override a base
token at its root to change the scale derived from it, without rewriting component styles.
