/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


import { Platform } from 'react-native';
import sportColors from './sportColorPattern';

export const Colors = {
  light: {
    text: sportColors.text,
    background: sportColors.background,
    tint: sportColors.primary,
    icon: sportColors.textLight,
    tabIconDefault: sportColors.textLight,
    tabIconSelected: sportColors.primary,
    primary: sportColors.primary,
    secondary: sportColors.secondary,
    accent: sportColors.accent,
    gold: sportColors.gold,
    error: sportColors.error,
    success: sportColors.success,
    warning: sportColors.warning,
    info: sportColors.info,
    border: sportColors.border,
    price: sportColors.price,
    disabled: sportColors.disabled,
    backgroundGray: sportColors.backgroundGray,
  },
  dark: {
    text: sportColors.textWhite,
    background: sportColors.backgroundDark,
    tint: sportColors.primaryLight,
    icon: sportColors.textMuted,
    tabIconDefault: sportColors.textMuted,
    tabIconSelected: sportColors.primaryLight,
    primary: sportColors.primaryLight,
    secondary: sportColors.secondaryDark,
    accent: sportColors.accentDark,
    gold: sportColors.goldDark,
    error: sportColors.error,
    success: sportColors.success,
    warning: sportColors.warning,
    info: sportColors.info,
    border: sportColors.borderDark,
    price: sportColors.price,
    disabled: sportColors.disabled,
    backgroundGray: sportColors.backgroundGray,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
