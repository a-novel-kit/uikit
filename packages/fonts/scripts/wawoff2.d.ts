// Minimal declarations for the untyped wawoff2 package used by the vendoring script.
declare module "wawoff2" {
  /** Compresses OpenType or TrueType bytes to WOFF2. */
  export function compress(input: Uint8Array): Promise<Uint8Array>;
  /** Decompresses WOFF2 bytes to their original font container. */
  export function decompress(input: Uint8Array): Promise<Uint8Array>;
}
