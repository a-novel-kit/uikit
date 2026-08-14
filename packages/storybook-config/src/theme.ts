import { palette } from "@a-novel-kit/uikit-tokens/palette";

import Color from "colorjs.io";
import { create } from "storybook/theming";

// Storybook's theme API transforms colors as sRGB strings.
const toManagerColor = (value: string) =>
  new Color(value).toGamut({ method: "css", space: "srgb" }).to("srgb").toString({ format: "hex" });

const colors = {
  accent: toManagerColor(palette.brand[11]),
  accentHover: toManagerColor(palette.brand[10]),
  border: toManagerColor(palette.neutral[5]),
  canvas: toManagerColor(palette.neutral[0]),
  chrome: toManagerColor(palette.neutral[2]),
  control: toManagerColor(palette.neutral[3]),
  hover: toManagerColor(palette.neutral[4]),
  text: toManagerColor(palette.neutral[11]),
  textMuted: toManagerColor(palette.neutral[9]),
} as const;

const fonts = {
  interface: '"TeX Gyre Heros", Arimo, "Noto Sans", Arial, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export const agoraTheme = create({
  base: "dark",
  brandTitle: "Agora UI",
  colorPrimary: colors.accent,
  colorSecondary: colors.accent,
  appBg: colors.canvas,
  appContentBg: colors.canvas,
  appHoverBg: colors.hover,
  appPreviewBg: colors.canvas,
  appBorderColor: colors.border,
  fontBase: fonts.interface,
  fontCode: fonts.mono,
  textColor: colors.text,
  textInverseColor: colors.canvas,
  textMutedColor: colors.textMuted,
  barTextColor: colors.textMuted,
  barHoverColor: colors.accentHover,
  barSelectedColor: colors.accent,
  barBg: colors.chrome,
  buttonBg: colors.control,
  buttonBorder: colors.border,
  booleanBg: colors.control,
  booleanSelectedBg: colors.hover,
  inputBg: colors.chrome,
  inputBorder: colors.border,
  inputTextColor: colors.text,
});
