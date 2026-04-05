import { StatusChip } from "@/components/ui/InfoCard";

export function PracticalStepChip({ text }: { text: string }) {
  return <StatusChip text={text} variant="step" />;
}
