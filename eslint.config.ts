import { EslintSvelte } from "@a-novel-kit/nodelib-config/eslint-svelte";

// isLib exempts links from route resolution, since applications supply the URLs uikit renders.
export default EslintSvelte({ svelte: {}, isLib: true, gitIgnorePath: import.meta.dirname + "/.gitignore" });
