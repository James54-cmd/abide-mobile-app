import { Text, View } from "react-native";

interface InfoCardProps {
  children: React.ReactNode;
  variant?: "warning" | "info" | "rebuke";
  borderSide?: "left" | "none";
}

/**
 * Shared info card component - eliminates styling duplication (SKILL.md Rule 16).
 * Provides consistent container styling for warnings, notifications, and content blocks.
 */
export function InfoCard({ children, variant = "info", borderSide = "none" }: InfoCardProps) {
  const getBaseClass = () => {
    switch (variant) {
      case "warning":
        return "rounded-xl bg-amber px-3 py-2";
      case "rebuke":
        return borderSide === "left"
          ? "rounded-xl border-l-4 border-amber bg-cream p-3"
          : "rounded-xl bg-cream p-3";
      case "info":
      default:
        return "rounded-full bg-cream px-3 py-1";
    }
  };

  return <View className={getBaseClass()}>{children}</View>;
}

interface StatusChipProps {
  text: string;
  variant?: "streak" | "step" | "translation";
  icon?: string;
}

/**
 * Shared status chip component - eliminates styling duplication (SKILL.md Rule 16).
 * Provides consistent chip styling for badges, tags, and status indicators.
 */
export function StatusChip({ text, variant = "translation", icon }: StatusChipProps) {
  const getChipClass = () => {
    switch (variant) {
      case "streak":
        return "rounded-full bg-cream px-3 py-1";
      case "step":
        return "rounded-xl bg-teal px-3 py-2";
      case "translation":
      default:
        return "rounded-full bg-parchment px-2 py-1";
    }
  };

  const getTextClass = () => {
    switch (variant) {
      case "streak":
        return "font-sans-medium text-sm text-ink";
      case "step":
        return "font-sans-medium text-sm text-white";
      case "translation":
      default:
        return "font-sans text-xs text-muted";
    }
  };

  const displayText = icon ? `${icon} ${text}` : text;

  return (
    <View className={getChipClass()}>
      <Text className={getTextClass()}>{displayText}</Text>
    </View>
  );
}