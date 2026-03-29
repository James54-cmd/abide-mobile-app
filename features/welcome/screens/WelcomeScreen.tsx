import { BrandLogo } from "@/components/brand/BrandLogo";
import { splashArtSlides } from "@/constants/splash";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Full-screen legibility veil over photography (ink @ opacity — tune alpha only). */
const OVERLAY_SCRIM = "rgba(44, 31, 14, 0.38)";

const SLIDE_INTERVAL_MS = 5000;
const CROSSFADE_MS = 1400;
/** Inactive slides stay slightly visible to avoid a parchment flash between layers. */
const CROSSFADE_GHOST_OPACITY = 0;
const LOGO_MOVE_DURATION_MS = 850;

/** Parchment + centered logo hold before fade-out and logo move to top-left. */
const HOLD_MS = 2000;
const LOGO_MOVE_DELAY_MS = HOLD_MS;

/** Solid parchment intro (matches native splash); fades to reveal photography. */
const INTRO_FADE_DELAY_MS = HOLD_MS;
const INTRO_FADE_DURATION_MS = 1500;

/** `reading_1` (slide index 1): zoomed crop (width mult) + left offset to keep subject framed. */
const READING_1_WIDTH_MULT = 1.18;
const READING_1_OFFSET_X = -SCREEN_WIDTH * 0.095;

function SplashBackground({ activeIndex }: { activeIndex: number }) {
  const o0 = useSharedValue(1);
  const o1 = useSharedValue(CROSSFADE_GHOST_OPACITY);
  const o2 = useSharedValue(CROSSFADE_GHOST_OPACITY);

  useEffect(() => {
    const ghost = CROSSFADE_GHOST_OPACITY;
    const timing = { duration: CROSSFADE_MS, easing: Easing.inOut(Easing.sin) };
    o0.value = withTiming(activeIndex === 0 ? 1 : ghost, timing);
    o1.value = withTiming(activeIndex === 1 ? 1 : ghost, timing);
    o2.value = withTiming(activeIndex === 2 ? 1 : ghost, timing);
  }, [activeIndex]);

  const s0 = useAnimatedStyle(() => ({ opacity: o0.value }));
  const s1 = useAnimatedStyle(() => ({ opacity: o1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: o2.value }));

  const layers = [
    { source: splashArtSlides[0], style: s0 },
    { source: splashArtSlides[1], style: s1 },
    { source: splashArtSlides[2], style: s2 }
  ] as const;

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {layers.map(({ source, style }, i) => {
        const isReading1 = i === 1;
        const frame = isReading1
          ? {
              position: "absolute" as const,
              width: SCREEN_WIDTH * READING_1_WIDTH_MULT,
              height: SCREEN_HEIGHT,
              left: READING_1_OFFSET_X,
              top: 0
            }
          : { position: "absolute" as const, width: SCREEN_WIDTH, height: SCREEN_HEIGHT, left: 0, top: 0 };
        return (
          <Animated.Image
            key={i}
            source={source}
            style={[frame, style]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        );
      })}
    </View>
  );
}

export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bgIndex, setBgIndex] = useState(0);

  const logoProgress = useSharedValue(0);
  const introOpacity = useSharedValue(1);

  const logoW0 = 228;
  const logoH0 = 64;
  const logoW1 = 132;
  const logoH1 = 36;
  const centerTop = (SCREEN_HEIGHT - logoH0) / 2;
  const centerLeft = (SCREEN_WIDTH - logoW0) / 2;
  const finalTop = insets.top + 8;
  const finalLeft = insets.left + 16;

  useEffect(() => {
    introOpacity.value = 1;
    introOpacity.value = withDelay(
      INTRO_FADE_DELAY_MS,
      withTiming(0, { duration: INTRO_FADE_DURATION_MS, easing: Easing.out(Easing.cubic) })
    );
  }, [introOpacity]);

  useEffect(() => {
    logoProgress.value = 0;
    logoProgress.value = withDelay(
      LOGO_MOVE_DELAY_MS,
      withTiming(1, { duration: LOGO_MOVE_DURATION_MS, easing: Easing.out(Easing.cubic) })
    );
  }, [logoProgress]);

  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % splashArtSlides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    for (const mod of splashArtSlides) {
      const { uri } = Image.resolveAssetSource(mod) ?? {};
      if (uri) void Image.prefetch(uri);
    }
  }, []);

  const introFadeStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    backgroundColor: colors.parchment,
    opacity: introOpacity.value
  }));

  const logoMotion = useAnimatedStyle(() => {
    const top = interpolate(logoProgress.value, [0, 1], [centerTop, finalTop]);
    const left = interpolate(logoProgress.value, [0, 1], [centerLeft, finalLeft]);
    const w = interpolate(logoProgress.value, [0, 1], [logoW0, logoW1]);
    const h = interpolate(logoProgress.value, [0, 1], [logoH0, logoH1]);
    return {
      position: "absolute",
      top,
      left,
      width: w,
      height: h,
      zIndex: 30
    };
  });

  return (
    <View className="flex-1 bg-parchment" style={{ backgroundColor: colors.parchment }}>
      <SplashBackground activeIndex={bgIndex} />

      <View
        pointerEvents="none"
        className="absolute inset-0"
        style={{ backgroundColor: OVERLAY_SCRIM, zIndex: 10 }}
      />

      <Animated.View style={introFadeStyle} pointerEvents="none" />

      <Animated.View style={logoMotion}>
        <BrandLogo variant="full" style={{ width: "100%", height: "100%" }} />
      </Animated.View>

      <View
        className="absolute left-0 right-0"
        style={{
          bottom: 0,
          zIndex: 40,
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingTop: 12
        }}
        pointerEvents="box-none"
      >
        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 rounded-xl bg-gold py-3.5 active:opacity-90"
            onPress={() => router.push("/(auth)/register")}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <Text className="text-center font-sans-medium text-base text-white">Create account</Text>
          </Pressable>

          <Pressable
            className="flex-1 rounded-xl border py-3.5 active:opacity-90"
            style={{
              backgroundColor: colors.cream,
              borderColor: "rgba(201, 151, 58, 0.45)"
            }}
            onPress={() => router.push("/(auth)/login")}
            accessibilityRole="button"
            accessibilityLabel="Log in"
          >
            <Text className="text-center font-sans-medium text-base text-ink">Log in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
