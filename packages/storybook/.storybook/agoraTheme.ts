import { create } from "storybook/theming";

const colors = {
  action: "#61b8e4",
  actionMuted: "#ace3ff",
  border: "#434349",
  canvas: "#0f0f11",
  hover: "#313136",
  subtle: "#1f1f22",
  text: "#f1f1f4",
  textMuted: "#d9dade",
} as const;

const fonts = {
  interface: '"TeX Gyre Heros", Arimo, "Noto Sans", Arial, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export const agoraTheme = create({
  base: "dark",
  brandTitle: "Agora UI",
  colorPrimary: colors.action,
  colorSecondary: colors.actionMuted,
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
