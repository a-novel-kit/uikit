/**
 * Vendors the WOFF2 font files into files/ and their licenses into licenses/. Both directories are
 * committed and published, so applications serve the fonts from their own origin.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { compress } from "wawoff2";

const require = createRequire(import.meta.url);
const root = join(import.meta.dirname, "..");
const outDir = join(root, "files");
mkdirSync(outDir, { recursive: true });

// 1. TeX Gyre Heros and its condensed sibling, downloaded from CTAN as OTF and converted to WOFF2.
// The fixed CTAN mirror avoids load-balanced mirrors with inconsistent TLS.
const CTAN = "https://ctan.math.illinois.edu/fonts/tex-gyre/opentype";
const HEROS: Array<[string, string]> = [
  ["texgyreheros-regular.otf", "heros-regular.woff2"],
  ["texgyreheros-bold.otf", "heros-bold.woff2"],
  ["texgyreheros-italic.otf", "heros-italic.woff2"],
  ["texgyreheros-bolditalic.otf", "heros-bolditalic.woff2"],
  ["texgyreheroscn-regular.otf", "heros-cn-regular.woff2"],
  ["texgyreheroscn-bold.otf", "heros-cn-bold.woff2"],
];
const tmp = mkdtempSync(join(tmpdir(), "texgyre-"));
for (const [src, dst] of HEROS) {
  const otfPath = join(tmp, src);
  execFileSync("curl", ["-sSL", "--fail", "-m", "60", `${CTAN}/${src}`, "-o", otfPath]);
  const woff2 = await compress(new Uint8Array(readFileSync(otfPath)));
  writeFileSync(join(outDir, dst), woff2);
  console.log(`heros  ${dst.padEnd(24)} ${(woff2.length / 1024).toFixed(0)}KB`);
}

// 2. The OFL variable faces, copied from their npm packages. Only their Latin subset ships.
const OFL = ["@fontsource-variable/lora", "@fontsource-variable/jetbrains-mono", "@fontsource-variable/arimo"];
for (const pkg of OFL) {
  const filesDir = join(dirname(require.resolve(`${pkg}/package.json`)), "files");
  if (!existsSync(filesDir)) {
    console.warn(`MISSING files/ for ${pkg}`);
    continue;
  }
  const picks = readdirSync(filesDir).filter((f) => /-latin-wght-(normal|italic)\.woff2$/.test(f));
  for (const f of picks) {
    writeFileSync(join(outDir, f), readFileSync(join(filesDir, f)));
    console.log(`ofl    ${f}`);
  }
}

// 3. The licenses, which both the GUST Font License and the OFL require to travel with the fonts.
const licDir = join(root, "licenses");
mkdirSync(licDir, { recursive: true });
for (const pkg of OFL) {
  const pkgDir = dirname(require.resolve(`${pkg}/package.json`));
  const lic = ["LICENSE", "LICENSE.txt", "LICENSE.md"].map((f) => join(pkgDir, f)).find(existsSync);
  if (lic) {
    const name = `OFL-${pkg.split("/")[1]}.txt`;
    writeFileSync(join(licDir, name), readFileSync(lic));
    console.log(`lic    ${name}`);
  }
}
try {
  execFileSync("curl", [
    "-sSL",
    "--fail",
    "-m",
    "30",
    `${CTAN.replace("/opentype", "")}/doc/GUST-FONT-LICENSE.txt`,
    "-o",
    join(licDir, "GUST-FONT-LICENSE.txt"),
  ]);
  console.log("lic    GUST-FONT-LICENSE.txt");
} catch {
  console.warn("WARN   could not fetch GUST-FONT-LICENSE.txt (vendor it manually from CTAN)");
}

console.log(`\nvendored -> ${outDir}`);
