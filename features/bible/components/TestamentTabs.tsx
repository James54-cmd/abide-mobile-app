import { TabButtons, type TabButtonOption } from "@/components/ui/TabButtons";
import type { BibleTestament } from "@/features/bible/types";

export interface TestamentTabsProps {
  activeTestament: BibleTestament;
  onSelectTestament: (testament: BibleTestament) => void;
}

export function TestamentTabs({ activeTestament, onSelectTestament }: TestamentTabsProps) {
  const testamentTabs: TabButtonOption<BibleTestament>[] = [
    { key: "old", label: "Old Testament" },
    { key: "new", label: "New Testament" },
  ];

  return (
    <TabButtons options={testamentTabs} activeKey={activeTestament} onSelect={onSelectTestament} />
  );
}

