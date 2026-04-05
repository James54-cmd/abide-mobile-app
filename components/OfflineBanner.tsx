import { Text } from "react-native";
import { InfoCard } from "@/components/ui/InfoCard";

export function OfflineBanner() {
  return (
    <InfoCard variant="warning">
      <Text className="font-sans-medium text-sm text-ink">You are offline. Showing cached content.</Text>
    </InfoCard>
  );
}
