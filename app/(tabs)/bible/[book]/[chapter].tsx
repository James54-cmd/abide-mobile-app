import { useLocalSearchParams } from "expo-router";
import { BibleChapterScreen } from "@/features/bible/screens/BibleChapterScreen";

export default function BibleChapterRoute() {
  const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
  return <BibleChapterScreen book={book} chapter={Number(chapter || "1")} translation="NIV" />;
}
