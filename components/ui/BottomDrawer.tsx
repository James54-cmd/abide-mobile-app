import { colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontText from "react-native-fontext";

const passthroughComputeFont = (fontFamily: string) => fontFamily;

interface BottomDrawerProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

const CLOSE_VELOCITY_THRESHOLD = 900;

export function BottomDrawer({ visible, title, onClose, children }: BottomDrawerProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const drawerHeight = useMemo(() => Math.max(620, Math.floor(screenHeight * 0.86)), [screenHeight]);
  const closeProgressThreshold = useMemo(() => drawerHeight * 0.25, [drawerHeight]);
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(visible ? 0 : drawerHeight);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    translateY.value = withTiming(drawerHeight, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    const id = setTimeout(() => setMounted(false), 230);
    return () => clearTimeout(id);
  }, [visible, drawerHeight, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY <= 0) {
        translateY.value = 0;
        return;
      }
      translateY.value = Math.min(event.translationY, drawerHeight);
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > closeProgressThreshold || event.velocityY > CLOSE_VELOCITY_THRESHOLD;

      if (shouldClose) {
        translateY.value = withTiming(
          drawerHeight,
          { duration: 180, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(onClose)();
          }
        );
        return;
      }

      translateY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    });

  const backdropAnimated = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, drawerHeight], [1, 0]),
  }));

  const drawerAnimated = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const drawerPaddingBottom = useMemo(() => Math.max(insets.bottom, 16), [insets.bottom]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropAnimated]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.drawer, drawerAnimated, { maxHeight: drawerHeight, paddingBottom: drawerPaddingBottom }]}
          >
            <View style={styles.grabber} />
            <View style={styles.headerRow}>
              <FontText style={styles.headerTitle} computeFont={passthroughComputeFont}>
                {title ?? "Drawer"}
              </FontText>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close drawer"
              >
                <Feather name="x" size={20} color={colors.muted} />
              </Pressable>
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(44,31,14,0.35)",
  },
  drawer: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(201,151,58,0.20)",
    backgroundColor: colors.parchment,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(140,123,106,0.35)",
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: "serif",
    fontSize: 20,
    color: colors.ink,
  },
});

