import { FlatList, Pressable, Text, View } from "react-native";

const books = ["Genesis", "Exodus", "Matthew", "John", "Romans", "Revelation"];

export function BibleIndexScreen({ onOpen }: { onOpen: (book: string, chapter: number) => void }) {
  return (
    <View className="flex-1 bg-parchment px-4 pt-4">
      <Text className="mb-3 font-serif text-3xl text-ink">Holy Scriptures</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable className="mb-2 rounded-xl bg-cream p-4 active:scale-95" onPress={() => onOpen(item, 1)}>
            <Text className="font-sans-medium text-ink">{item}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
