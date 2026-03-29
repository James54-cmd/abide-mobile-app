import { router } from "expo-router";
import { BibleIndexScreen } from "@/features/bible/screens/BibleIndexScreen";

export default function BibleIndexRoute() {
  return <BibleIndexScreen onOpen={(book, chapter) => router.push(`/(tabs)/bible/${book}/${chapter}`)} />;
}
