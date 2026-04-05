import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ScreenHeaderProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  iconColor?: string;
}

/**
 * Shared screen header component - provides consistent header styling (SKILL.md Rule 16).
 * Used for screen titles with optional icon and subtitle.
 */
export function ScreenHeader({ 
  icon, 
  title, 
  subtitle, 
  iconColor = "#C9973A" 
}: ScreenHeaderProps) {
  return (
    <View className="border-b border-muted/20 bg-parchment px-5 pb-4 pt-2">
      <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-gold/10">
        <Feather name={icon} size={22} color={iconColor} />
      </View>
      <Text className="mb-1.5 font-serif text-2xl text-ink">{title}</Text>
      {subtitle && (
        <Text className="font-sans text-sm leading-5 text-muted">{subtitle}</Text>
      )}
    </View>
  );
}