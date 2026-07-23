// Public API of @a-novel-kit/uikit. Platforms import styled, accessible
// components from here — never the underlying primitive library (bits-ui)
// directly (the "adapter boundary": we can re-point the internals without
// touching a consumer).
export { default as Button } from "./Button.svelte";
export type { ButtonProps } from "./Button.svelte";
