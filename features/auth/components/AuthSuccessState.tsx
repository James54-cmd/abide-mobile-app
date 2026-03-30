import { BrandLogo } from "@/components/brand/BrandLogo";
import { colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

interface Props {
  title: string;
  subtitle: string;
  /** Optional custom icon; defaults to teal check circle */
  icon?: ReactNode;
}

/**
 * Shared enter animation for post-OTP / post-reset success (tap to continue to login).
 */
export function AuthSuccessState({ title, subtitle, icon }: Props) {
  return (
    <View style={{ alignItems: "center", paddingHorizontal: 32 }}>
      <Animated.View entering={FadeIn.duration(380)}>
        <BrandLogo variant="symbol" style={{ width: 48, height: 48, marginBottom: 8 }} />
      </Animated.View>
      <Animated.View entering={ZoomIn.duration(480).delay(90)} style={{ marginBottom: 18 }}>
        {icon ?? <Feather name="check-circle" size={56} color={colors.teal} />}
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(420).delay(160)}>
        <Text
          style={{
            fontFamily: "serif",
            fontSize: 22,
            lineHeight: 30,
            color: colors.ink,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          {title}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(420).delay(260)}>
        <Text
          style={{
            fontFamily: "sans",
            fontSize: 15,
            lineHeight: 22,
            color: colors.muted,
            textAlign: "center",
          }}
        >
          {subtitle}
        </Text>
      </Animated.View>
    </View>
  );
}
