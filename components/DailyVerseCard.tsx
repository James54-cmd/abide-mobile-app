import type { Verse } from "@/types";
import { BaseVerseCard } from "@/components/ui/BaseVerseCard";

export function DailyVerseCard({ verse }: { verse: Verse }) {
  return <BaseVerseCard verse={verse} variant="daily" />;
}
