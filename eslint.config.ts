import { Eslint } from "@a-novel-kit/nodelib-config";

// isLib exempts links from route resolution, since applications supply the URLs uikit renders.
export default Eslint({ svelte: {}, isLib: true, gitIgnorePath: import.meta.dirname + "/.gitignore" });
