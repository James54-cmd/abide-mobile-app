import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  iconSize?: number;
}

/**
 * Shared empty state component - provides consistent empty state styling (SKILL.md Rule 16).
 * Used for empty lists, search results, and placeholder content.
 */
export function EmptyState({ 
  icon, 
  title, 
  subtitle, 
  iconSize = 40 
}: EmptyStateProps) {
  return (
    <View className="items-center px-6 py-12">
      <Feather name={icon} size={iconSize} color="#8C7B6A" style={{ opacity: 0.5 }} />
      <Text className="mt-4 font-sans-medium text-base text-ink">{title}</Text>
      <Text className="mt-2 text-center font-sans text-sm leading-5 text-muted">
        {subtitle}
      </Text>
    </View>
  );
}