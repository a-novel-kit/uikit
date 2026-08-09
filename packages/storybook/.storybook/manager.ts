import { agoraTheme } from "./agoraTheme";

import "@a-novel-kit/uikit-fonts/fonts.css";

import { addons } from "storybook/manager-api";

addons.setConfig({
  theme: agoraTheme,
});
