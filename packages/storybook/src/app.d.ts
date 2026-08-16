declare module "*.css";
declare module "@a-novel-kit/uikit-fonts/fonts.css";
declare module "@a-novel-kit/uikit-tokens/tokens.css";

declare module "*?raw" {
  const source: string;
  export default source;
}
