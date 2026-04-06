import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface BaseListCardProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  showChevron?: boolean;
  accentColor?: string;
  spacing?: boolean;
}

/**
 * Base list card component - provides consistent card styling for list items (SKILL.md Rule 16).
 * Used for conversation rows, bible chapters, and other list-based content.
 */
export function BaseListCard({
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  showChevron = true,
  accentColor = "bg-gold",
  spacing = false,
}: BaseListCardProps) {
  return (
    <Pressable
      className={`
        flex-row items-center overflow-hidden rounded-2xl border border-gold/15 
        bg-cream shadow-sm active:opacity-95
        ${spacing ? "mt-3" : ""}
      `}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View className={`w-1 self-stretch ${accentColor}`} />
      <View className="flex-1 px-3.5 py-4">
        <Text className="mb-1 font-sans-medium text-base text-ink">{title}</Text>
        {subtitle && (
          <Text className="font-sans text-sm leading-5 text-muted" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && (
        <View className="pr-3">
          <Feather name="chevron-right" size={18} color="#8C7B6A" style={{ opacity: 0.45 }} />
        </View>
      )}
    </Pressable>
  );
}