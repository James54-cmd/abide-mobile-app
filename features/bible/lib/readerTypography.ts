import type { BibleFontFamily, BibleFontSize, BibleLineSpacing, BibleReaderSettings } from "@/features/bible/types";
import { Platform } from "react-native";

const FONT_SIZE_PX: Record<BibleFontSize, number> = {
  small: 16,
  medium: 18,
  large: 21,
  extra_large: 24,
};

const LINE_HEIGHT_MULT: Record<BibleLineSpacing, number> = {
  tight: 1.4,
  normal: 1.55,
  relaxed: 1.7,
  loose: 1.85,
};

export function getReaderVerseTypography(settings: {
  fontSize: BibleFontSize;
  fontFamily: BibleFontFamily;
  lineSpacing: BibleLineSpacing;
}): { fontFamily: string; fontSizePx: number; lineHeightPx: number } {
  const fontSizePx = FONT_SIZE_PX[settings.fontSize];
  const lineHeightPx = Math.round(fontSizePx * LINE_HEIGHT_MULT[settings.lineSpacing]);
  return {
    fontFamily:
      settings.fontFamily === "serif"
        ? Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
          }) ?? "serif"
        : "DMSans-Regular",
    fontSizePx,
    lineHeightPx,
  };
}

export function getReaderVerseTypographyFromSettings(settings: BibleReaderSettings) {
  return getReaderVerseTypography(settings);
}

