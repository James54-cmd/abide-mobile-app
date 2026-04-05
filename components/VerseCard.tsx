import type { Verse } from "@/types";
import { BaseVerseCard } from "@/components/ui/BaseVerseCard";

interface Props {
  verse: Verse;
  onLongPress?: () => void;
}

export function VerseCard({ verse, onLongPress }: Props) {
  return (
    <BaseVerseCard
      verse={verse}
      variant="default"
      onLongPress={onLongPress}
      showTranslation
      showRelevance
    />
  );
}
