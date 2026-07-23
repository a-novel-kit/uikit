// Compile the DTCG token source to the durable artifacts: CSS custom properties
// (the contract every platform consumes) and a typed TS module. The CSS vars
// outlive Style Dictionary itself — a consumer depends on `--color-*`, never on
// the token JSON shape.
import { join } from "node:path";

import StyleDictionary from "style-dictionary";

const root = join(import.meta.dirname, "..");
const buildPath = `${join(root, "dist")}/`;

const sd = new StyleDictionary({
  source: [join(root, "src", "*.tokens.json")],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath,
      files: [{ destination: "tokens.css", format: "css/variables", options: { selector: ":root" } }],
    },
    js: {
      transformGroup: "js",
      buildPath,
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        { destination: "tokens.d.ts", format: "typescript/es6-declarations" },
      ],
    },
  },
});

await sd.buildAllPlatforms();
