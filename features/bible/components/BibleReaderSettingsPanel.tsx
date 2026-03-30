import { colors } from "@/constants/theme";
import { TabButtons, type TabButtonOption } from "@/components/ui/TabButtons";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { BibleFontFamily, BibleFontSize, BibleLineSpacing, BibleReaderSettings } from "@/features/bible/types";
import { getReaderVerseTypographyFromSettings } from "@/features/bible/lib/readerTypography";
import FontText from "react-native-fontext";
import type { Translation } from "@/types";

const passthroughComputeFont = (fontFamily: string) => fontFamily;

const TEXT_SIZE_OPTIONS: { key: BibleFontSize; label: string }[] = [
  { key: "small", label: "S" },
  { key: "medium", label: "M" },
  { key: "large", label: "L" },
  { key: "extra_large", label: "XL" },
];

const TYPOGRAPHY_OPTIONS: { key: BibleFontFamily; label: string }[] = [
  { key: "serif", label: "Serif" },
  { key: "sans", label: "Sans" },
];

const LINE_SPACING_OPTIONS: { key: BibleLineSpacing; label: string }[] = [
  { key: "tight", label: "Tight" },
  { key: "normal", label: "Normal" },
  { key: "relaxed", label: "Relaxed" },
  { key: "loose", label: "Loose" },
];

export interface BibleReaderSettingsPanelProps {
  translation: Translation;
  onChangeTranslation: (translation: Translation) => void;
  settings: BibleReaderSettings;
  onChange: (next: BibleReaderSettings) => void;
}

const TRANSLATION_TABS: TabButtonOption<Translation>[] = [
  { key: "NIV", label: "NIV" },
  { key: "NLT", label: "NLT" },
];

export function BibleReaderSettingsPanel({
  translation,
  onChangeTranslation,
  settings,
  onChange,
}: BibleReaderSettingsPanelProps) {
  const previewTextStyle = useMemo(() => {
    const { fontFamily, fontSizePx, lineHeightPx } = getReaderVerseTypographyFromSettings(settings);
    return {
      fontFamily,
      fontSize: fontSizePx,
      lineHeight: lineHeightPx,
    };
  }, [settings]);

  const sizeHint = useMemo(() => {
    const map: Record<BibleFontSize, string> = {
      small: "small",
      medium: "medium",
      large: "large",
      extra_large: "extra large",
    };
    return map[settings.fontSize] ?? "medium";
  }, [settings.fontSize]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <SectionLabel label="Appearance" />

      <View style={styles.block}>
        <FontText style={styles.fieldLabel} computeFont={passthroughComputeFont}>
          Translation
        </FontText>
        <TabButtons
          options={TRANSLATION_TABS}
          activeKey={translation}
          onSelect={onChangeTranslation}
          style={styles.translationTabs}
        />
      </View>

      <View style={styles.block}>
        <View style={styles.rowBetween}>
          <FontText style={styles.fieldLabel} computeFont={passthroughComputeFont}>
            Text Size
          </FontText>
          <FontText style={styles.fieldHint} computeFont={passthroughComputeFont}>
            {sizeHint}
          </FontText>
        </View>
        <View style={styles.grid4}>
          {TEXT_SIZE_OPTIONS.map((opt) => (
            <ChoicePill
              key={opt.key}
              label={opt.label}
              selected={settings.fontSize === opt.key}
              onPress={() => onChange({ ...settings, fontSize: opt.key })}
            />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <FontText style={styles.fieldLabel} computeFont={passthroughComputeFont}>
          Typography
        </FontText>
        <View style={styles.grid2}>
          {TYPOGRAPHY_OPTIONS.map((opt) => (
            <ChoicePill
              key={opt.key}
              label={opt.label}
              selected={settings.fontFamily === opt.key}
              onPress={() => onChange({ ...settings, fontFamily: opt.key })}
              isSerif={opt.key === "serif"}
            />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <FontText style={styles.fieldLabel} computeFont={passthroughComputeFont}>
          Line Spacing
        </FontText>
        <View style={styles.grid4}>
          {LINE_SPACING_OPTIONS.map((opt) => (
            <ChoicePill
              key={opt.key}
              label={opt.label}
              selected={settings.lineSpacing === opt.key}
              onPress={() => onChange({ ...settings, lineSpacing: opt.key })}
            />
          ))}
        </View>
      </View>

      <SectionLabel label="Preview" />

      <View style={styles.previewCard}>
        <FontText style={styles.previewVerseNum} computeFont={passthroughComputeFont}>
          1
        </FontText>
        <FontText style={[styles.previewText, previewTextStyle]} computeFont={passthroughComputeFont}>
          In the beginning God created the heavens and the earth.
        </FontText>
      </View>
    </ScrollView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.sectionDot} />
      <FontText style={styles.sectionLabel} computeFont={passthroughComputeFont}>
        {label}
      </FontText>
    </View>
  );
}

function ChoicePill({
  label,
  selected,
  onPress,
  isSerif,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isSerif?: boolean;
}) {
  return (
    <Pressable
      style={[styles.choicePill, selected ? styles.choicePillSelected : styles.choicePillIdle]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={8}
    >
      <FontText
        style={[
          styles.choiceText,
          isSerif
            ? selected
              ? styles.choiceTextSerifSelected
              : styles.choiceTextSerifIdle
            : selected
              ? styles.choiceTextSansSelected
              : styles.choiceTextSansIdle,
        ]}
        computeFont={passthroughComputeFont}
      >
        {label}
      </FontText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
  translationTabs: {
    height: 44,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  sectionLabel: {
    fontFamily: "sans-medium",
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: colors.muted,
  },
  block: {
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: "sans-medium",
    fontSize: 17,
    color: colors.ink,
    marginBottom: 10,
  },
  fieldHint: {
    fontFamily: "sans",
    fontSize: 14,
    color: colors.muted,
    marginBottom: 10,
  },
  grid4: {
    flexDirection: "row",
    gap: 10,
  },
  grid2: {
    flexDirection: "row",
    gap: 10,
  },
  choicePill: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  choicePillSelected: {
    backgroundColor: colors.gold,
    shadowColor: "rgba(44,31,14,0.10)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  choicePillIdle: {
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  choiceText: {
    fontSize: 17,
  },
  choiceTextSansSelected: {
    fontFamily: "DMSans-Medium",
    fontWeight: "700",
    color: colors.white,
  },
  choiceTextSansIdle: {
    fontFamily: "DMSans-Regular",
    fontWeight: "400",
    color: colors.muted,
  },
  choiceTextSerifSelected: {
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 20,
  },
  choiceTextSerifIdle: {
    fontFamily: "Georgia",
    fontWeight: "400",
    fontSize: 20,
  },
  previewCard: {
    marginTop: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.20)",
    backgroundColor: "rgba(255,255,255,0.45)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  previewVerseNum: {
    marginTop: 4,
    fontFamily: "sans-medium",
    fontSize: 9,
    color: colors.gold,
  },
  previewText: {
    flex: 1,
    color: colors.ink,
  },
});

