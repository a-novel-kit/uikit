import { create } from "storybook/theming";

const colors = {
  action: "#61b8e4",
  actionMuted: "#ace3ff",
  border: "#3e4549",
  canvas: "#0e1010",
  hover: "#2d3235",
  pressure: "#e1996c",
  subtle: "#1d2022",
  text: "#f0f2f3",
  textMuted: "#d6dbdd",
} as const;

const fonts = {
  interface: '"TeX Gyre Heros", Arimo, "Noto Sans", Arial, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export const agoraTheme = create({
  base: "dark",
  brandTitle: "Agora UI",
  colorPrimary: colors.action,
  colorSecondary: colors.pressure,
  appBg: colors.canvas,
  appContentBg: colors.subtle,
  appHoverBg: colors.hover,
  appPreviewBg: colors.canvas,
  appBorderColor: colors.border,
  fontBase: fonts.interface,
  fontCode: fonts.mono,
  textColor: colors.text,
  textInverseColor: colors.canvas,
  textMutedColor: colors.textMuted,
  barTextColor: colors.textMuted,
  barHoverColor: colors.text,
  barSelectedColor: colors.actionMuted,
  barBg: colors.subtle,
  buttonBg: colors.canvas,
  buttonBorder: colors.border,
  booleanBg: colors.canvas,
  booleanSelectedBg: colors.hover,
  inputBg: colors.canvas,
  inputBorder: colors.border,
  inputTextColor: colors.text,
});
