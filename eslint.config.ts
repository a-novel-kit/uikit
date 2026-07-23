import { Eslint } from "@a-novel-kit/nodelib-config";

// isLib relaxes the SvelteKit navigation rule — uikit links are generic/reusable.
export default Eslint({ svelte: {}, isLib: true, gitIgnorePath: import.meta.dirname + "/.gitignore" });
