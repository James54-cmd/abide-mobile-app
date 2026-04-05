import { StatusChip } from "@/components/ui/InfoCard";

export function StreakBadge({ days }: { days: number }) {
  return <StatusChip text={`${days}-day streak`} variant="streak" icon="🔥" />;
}
