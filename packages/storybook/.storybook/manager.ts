import { agoraTheme } from "./agoraTheme";

import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";

import { addons } from "storybook/manager-api";

addons.setConfig({
  theme: agoraTheme,
});
