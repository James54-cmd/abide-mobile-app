import { colors } from "@/constants/theme";
import type { EncouragementResponse, FullEncouragementResponse } from "@/types";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  encouragement: EncouragementResponse | string;
}

// Type guard to check if encouragement has character property
function hasCharacter(encouragement: EncouragementResponse): encouragement is FullEncouragementResponse {
  return 'character' in encouragement && encouragement.character != null;
}

/**
 * Enhanced UI for structured encouragement responses
 * Displays intro, optional Bible character story, verses, and closing with pastoral guidance
 */
export function EnhancedEncouragementCard({ encouragement: rawEncouragement }: Props) {
  // Handle both object and string formats (for legacy compatibility)
  let encouragement: EncouragementResponse;
  
  if (typeof rawEncouragement === 'string') {
    try {
      encouragement = JSON.parse(rawEncouragement);
    } catch {
      // If parsing fails, create a basic structure
      encouragement = {
        intro: "I'm here to offer biblical encouragement.",
        verses: [{ 
          reference: "Psalm 34:18", 
          text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit." 
        }],
        closing: "Please consider talking to your pastor or a Christian friend for prayer and support."
      };
    }
  } else {
    encouragement = rawEncouragement;
  }
  
  // Ensure we have valid data
  if (!encouragement.intro || !encouragement.verses || !encouragement.closing) {
    return null;
  }
  return (
    <View style={styles.container}>
      {/* Intro Section */}
      <View style={styles.introSection}>
        <Text style={styles.introText}>{encouragement.intro}</Text>
      </View>

      {/* Bible Character Story (Optional) */}
      {hasCharacter(encouragement) && encouragement.character && (
        <View style={styles.characterSection}>
          <View style={styles.characterHeader}>
            <Feather name="user" size={16} color={colors.teal} />
            <Text style={styles.characterName}>{encouragement.character.name}</Text>
          </View>
          <Text style={styles.characterStory}>{encouragement.character.story}</Text>
          <Text style={styles.characterConnection}>
            {encouragement.character.connection}
          </Text>
        </View>
      )}

      {/* Scripture Verses */}
      {encouragement.verses && encouragement.verses.length > 0 && (
        <View style={styles.versesSection}>
          <View style={styles.versesHeader}>
            <Feather name="book-open" size={16} color={colors.gold} />
            <Text style={styles.versesTitle}>Scripture</Text>
          </View>
          
          {encouragement.verses.map((verse, index) => (
            <View key={index} style={styles.verseContainer}>
              <View style={styles.verseAccent} />
              <View style={styles.verseContent}>
                <Text style={styles.verseText}>"{verse.text}"</Text>
                <Text style={styles.verseReference}>— {verse.reference}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Closing with Pastoral Guidance */}
      <View style={styles.closingSection}>
        <Text style={styles.closingText}>{encouragement.closing}</Text>
      </View>

      {/* Community Connection Call-to-Action */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaHeader}>
          <Feather name="users" size={14} color={colors.teal} />
          <Text style={styles.ctaTitle}>Connect with Community</Text>
        </View>
        <Text style={styles.ctaText}>
          Consider sharing this with your pastor or small group leader for prayer and support.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 1,
    marginTop: 8,
    maxWidth: "82%",
  },

  // Intro Section
  introSection: {
    marginBottom: 12,
  },
  introText: {
    fontFamily: "sans",
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    fontWeight: "500",
  },

  // Character Section
  characterSection: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
  },
  characterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  characterName: {
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    marginLeft: 6,
  },
  characterStory: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    marginBottom: 6,
  },
  characterConnection: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.teal,
    fontStyle: "italic",
  },

  // Verses Section
  versesSection: {
    marginBottom: 12,
  },
  versesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  versesTitle: {
    fontFamily: "serif",
    fontSize: 15,
    fontWeight: "600",
    color: colors.gold,
    marginLeft: 6,
  },
  verseContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  verseAccent: {
    width: 3,
    backgroundColor: colors.gold,
    borderRadius: 1.5,
    marginRight: 10,
  },
  verseContent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(201,151,58,0.15)",
  },
  verseText: {
    fontFamily: "serif",
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    marginBottom: 4,
  },
  verseReference: {
    fontFamily: "sans",
    fontSize: 12,
    color: colors.muted,
    fontWeight: "500",
  },

  // Closing Section
  closingSection: {
    backgroundColor: colors.parchment,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  closingText: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },

  // CTA Section
  ctaSection: {
    backgroundColor: "rgba(88, 166, 175, 0.08)",
    borderRadius: 10,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(88, 166, 175, 0.2)",
  },
  ctaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ctaTitle: {
    fontFamily: "sans",
    fontSize: 12,
    fontWeight: "600",
    color: colors.teal,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ctaText: {
    fontFamily: "sans",
    fontSize: 12,
    lineHeight: 16,
    color: colors.teal,
  },
});