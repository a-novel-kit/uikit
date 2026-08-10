import { create } from "storybook/theming";

const colors = {
  action: "#00bbfc",
  actionMuted: "#afe3ff",
  border: "#414446",
  canvas: "#0e1010",
  hover: "#2f3233",
  pressure: "#fb7ab6",
  subtle: "#1e2021",
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
