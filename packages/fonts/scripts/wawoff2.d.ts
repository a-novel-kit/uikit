// wawoff2 ships no types. It is a WASM port of Google's woff2 encoder; we use
// only compress() (sfnt OTF/TTF -> WOFF2), which resolves to a Uint8Array.
declare module "wawoff2" {
  export function compress(input: Uint8Array): Promise<Uint8Array>;
  export function decompress(input: Uint8Array): Promise<Uint8Array>;
}
