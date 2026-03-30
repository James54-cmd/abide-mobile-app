import type { BibleIndexScreenProps } from "@/features/bible/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

const BOOKS = [
  { id: "genesis", name: "Genesis" },
  { id: "exodus", name: "Exodus" },
  { id: "matthew", name: "Matthew" },
  { id: "john", name: "John" },
  { id: "romans", name: "Romans" },
  { id: "revelation", name: "Revelation" },
];

export function useBibleIndexScreenState(): BibleIndexScreenProps {
  const router = useRouter();
  const books = useMemo(() => BOOKS, []);

  const onOpen = useCallback(
    (book: string, chapter: number) => {
      router.push(`/(tabs)/bible/${book}/${chapter}`);
    },
    [router]
  );

  return { books, onOpen };
}
