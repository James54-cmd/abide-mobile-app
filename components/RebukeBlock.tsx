import { Text } from "react-native";
import { InfoCard } from "@/components/ui/InfoCard";

export function RebukeBlock({ text }: { text: string }) {
  if (!text) return null;
  return (
    <InfoCard variant="rebuke" borderSide="left">
      <Text className="font-sans text-sm text-ink">{text}</Text>
    </InfoCard>
  );
}
