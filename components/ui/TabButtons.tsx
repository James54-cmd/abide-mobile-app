import { colors } from "@/constants/theme";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type TabKey = string;

export type TabButtonOption<T extends TabKey> = {
  key: T;
  label: string;
};

export interface TabButtonsProps<T extends TabKey> {
  options: readonly TabButtonOption<T>[];
  activeKey: T;
  onSelect: (key: T) => void;
  style?: ViewStyle;
}

const ANIM_DURATION_MS = 240;

export function TabButtons<T extends TabKey>({
  options,
  activeKey,
  onSelect,
  style,
}: TabButtonsProps<T>) {
  const tabCount = Math.max(options.length, 1);
  const [containerWidth, setContainerWidth] = useState(0);

  const activeIndex = useMemo(() => {
    const idx = options.findIndex((o) => o.key === activeKey);
    return idx >= 0 ? idx : 0;
  }, [activeKey, options]);

  const translateX = useSharedValue(0);

  const tabWidth = containerWidth > 0 ? containerWidth / tabCount : 0;

  useEffect(() => {
    if (tabWidth <= 0) return;
    translateX.value = withTiming(activeIndex * tabWidth, {
      duration: ANIM_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, tabWidth, translateX]);

  const indicatorMotion = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      pointerEvents="box-none"
    >
      {tabWidth > 0 ? (
        <Animated.View
          style={[
            styles.indicator,
            { width: tabWidth, left: 0 },
            indicatorMotion,
          ]}
        />
      ) : null}

      {options.map((opt) => {
        const isActive = opt.key === activeKey;
        return (
          <Pressable
            key={opt.key}
            style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
            onPress={() => onSelect(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.labelBase, isActive ? styles.labelActive : styles.labelInactive]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(201, 151, 58, 0.35)",
    backgroundColor: "rgba(140,123,106,0.10)",
    overflow: "hidden",
    height: 38,
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: colors.white,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabActive: {},
  tabInactive: {},
  labelBase: {
    fontFamily: "sans",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontFamily: "sans-medium",
    color: colors.gold,
  },
  labelInactive: {
    color: colors.muted,
  },
});

