import { splashArtSlides } from "@/constants/splash";
import { cacheJson, getCachedJson, offlineKeys } from "@/lib/native/offline";
import {
  loadRemoteDailyDevotionProgress,
} from "@/lib/supabase/dailyDevotion";
import type { DailyDevotionEntry, DailyDevotionProgress } from "@/features/home/types";
import type { StreakState } from "@/types";

const DAILY_DEVOTIONS: DailyDevotionEntry[] = [
  {
    id: "rest-in-grace",
    theme: "Rest in grace",
    image: splashArtSlides[1],
    quote: {
      text: "God loves each of us as if there were only one of us.",
      author: "Augustine",
      sourceLabel: "TODAY'S CHRISTIAN QUOTE",
    },
    passage: {
      reference: "Psalm 23",
      bookId: "PSA",
      chapter: 23,
      summary: "The Shepherd does not rush you. He restores, leads, and stays near.",
    },
    devotional: {
      title: "Let today slow down",
      body:
        "You do not have to prove your worth before you come to God today. Start from being loved, then let obedience grow from peace instead of pressure.",
    },
    prayer: {
      title: "A simple prayer",
      body:
        "Jesus, quiet the noise in me. Teach me to receive Your care before I try to carry everything on my own. Amen.",
    },
  },
  {
    id: "steady-faith",
    theme: "Steady faith",
    image: splashArtSlides[2],
    quote: {
      text: "Faith is to believe what you do not see.",
      author: "Augustine",
      sourceLabel: "TODAY'S CHRISTIAN QUOTE",
    },
    passage: {
      reference: "Hebrews 11",
      bookId: "HEB",
      chapter: 11,
      summary: "Faith keeps walking before the whole road becomes visible.",
    },
    devotional: {
      title: "Trust the next step",
      body:
        "God often gives enough light for the next faithful step, not the entire map. Small obedience is still holy when it is offered with trust.",
    },
    prayer: {
      title: "A prayer for trust",
      body:
        "Father, give me courage for the step in front of me. When I cannot see far, remind me that I am still led by You. Amen.",
    },
  },
  {
    id: "courage-and-peace",
    theme: "Courage and peace",
    image: splashArtSlides[0],
    quote: {
      text: "Courage is fear that has said its prayers.",
      author: "Dorothy Bernard",
      sourceLabel: "TODAY'S CHRISTIAN REFLECTION",
    },
    passage: {
      reference: "Joshua 1:9",
      bookId: "JOS",
      chapter: 1,
      summary: "Strength in Scripture is not bravado. It is presence-aware courage.",
    },
    devotional: {
      title: "Bring your fear with you",
      body:
        "You do not need to wait until fear disappears before you move toward what is right. Bring the fear to God, let Him steady you, and keep going with a quiet heart.",
    },
    prayer: {
      title: "A prayer for bravery",
      body:
        "Lord, meet me in the places where I feel weak. Grow a brave and peaceful spirit in me as I walk with You today. Amen.",
    },
  },
  {
    id: "abide-in-love",
    theme: "Abide in love",
    image: splashArtSlides[1],
    quote: {
      text: "The fruit of silence is prayer, the fruit of prayer is faith.",
      author: "Mother Teresa",
      sourceLabel: "TODAY'S CHRISTIAN QUOTE",
    },
    passage: {
      reference: "John 15",
      bookId: "JHN",
      chapter: 15,
      summary: "Fruit grows by abiding, not by striving harder than your soul can bear.",
    },
    devotional: {
      title: "Stay close before you do more",
      body:
        "Productivity can imitate purpose for a while, but it cannot replace communion. Let closeness with Jesus become the source of what you carry into the day.",
    },
    prayer: {
      title: "A prayer to abide",
      body:
        "Jesus, keep me near You today. Help me live from intimacy with You instead of hurry, image, or performance. Amen.",
    },
  },
  {
    id: "held-by-mercy",
    theme: "Held by mercy",
    image: splashArtSlides[2],
    quote: {
      text: "My deepest awareness of myself is that I am deeply loved by Jesus Christ.",
      author: "Brennan Manning",
      sourceLabel: "TODAY'S CHRISTIAN QUOTE",
    },
    passage: {
      reference: "Lamentations 3:22-23",
      bookId: "LAM",
      chapter: 3,
      summary: "Mercy meets you again this morning. Grace did not run out overnight.",
    },
    devotional: {
      title: "Begin again without shame",
      body:
        "If yesterday felt heavy or unfinished, God is not asking you to hide from Him today. Mercy is not reluctant. It welcomes your honest return.",
    },
    prayer: {
      title: "A prayer for mercy",
      body:
        "Father, thank You for meeting me with fresh mercy. Wash away shame and help me receive the kindness You freely give. Amen.",
    },
  },
  {
    id: "joyful-obedience",
    theme: "Joyful obedience",
    image: splashArtSlides[0],
    quote: {
      text: "Joy is the serious business of heaven.",
      author: "C.S. Lewis",
      sourceLabel: "TODAY'S CHRISTIAN QUOTE",
    },
    passage: {
      reference: "Philippians 4:4-7",
      bookId: "PHP",
      chapter: 4,
      summary: "Joy and peace deepen when worry is turned into prayer.",
    },
    devotional: {
      title: "Joy can be practiced",
      body:
        "Christian joy is not pretending life is easy. It is choosing to remember that Christ is present, good, and worthy of trust in the middle of real life.",
    },
    prayer: {
      title: "A prayer for joy",
      body:
        "God, lift my eyes today. Teach me to notice Your gifts, bring You my anxieties, and walk in the gladness that comes from Your nearness. Amen.",
    },
  },
  {
    id: "gentle-strength",
    theme: "Gentle strength",
    image: splashArtSlides[1],
    quote: {
      text: "There is no one who is insignificant in the purpose of God.",
      author: "Alistair Begg",
      sourceLabel: "TODAY'S CHRISTIAN QUOTE",
    },
    passage: {
      reference: "Micah 6:8",
      bookId: "MIC",
      chapter: 6,
      summary: "A meaningful life is often built through humble, faithful, ordinary steps.",
    },
    devotional: {
      title: "Let faithfulness be enough",
      body:
        "You do not need a dramatic platform to live a life that pleases God. Kindness, humility, and faithful love still matter deeply in His kingdom.",
    },
    prayer: {
      title: "A prayer for purpose",
      body:
        "Lord, make me faithful in small things today. Help me walk humbly, love well, and trust that my life matters in Your hands. Amen.",
    },
  },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / 86400000);
}

export function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDailyDevotionForDate(date: Date): DailyDevotionEntry {
  const index = (getDayOfYear(date) - 1) % DAILY_DEVOTIONS.length;
  return DAILY_DEVOTIONS[index] ?? DAILY_DEVOTIONS[0]!;
}

export function getDefaultDailyDevotionProgress(dateKey: string): DailyDevotionProgress {
  return {
    dateKey,
    quoteCompleted: false,
    passageCompleted: false,
    devotionalCompleted: false,
    prayerCompleted: false,
    isCompleted: false,
    completedAt: null,
    dismissedAt: null,
    isFavorite: false,
  };
}

export async function loadDailyDevotionProgress(dateKey: string): Promise<DailyDevotionProgress> {
  const cached = await getCachedJson<DailyDevotionProgress>(offlineKeys.dailyDevotionProgress);
  if (!cached || cached.dateKey !== dateKey) {
    return getDefaultDailyDevotionProgress(dateKey);
  }
  return normalizeLocalDailyDevotionProgress(dateKey, cached);
}

export function normalizeLocalDailyDevotionProgress(
  dateKey: string,
  cached: Partial<DailyDevotionProgress> | null | undefined
): DailyDevotionProgress {
  const quoteCompleted = cached?.quoteCompleted ?? cached?.isCompleted ?? false;
  const passageCompleted = cached?.passageCompleted ?? cached?.isCompleted ?? false;
  const devotionalCompleted = cached?.devotionalCompleted ?? cached?.isCompleted ?? false;
  const prayerCompleted = cached?.prayerCompleted ?? cached?.isCompleted ?? false;
  const isCompleted =
    quoteCompleted && passageCompleted && devotionalCompleted && prayerCompleted;

  return {
    dateKey,
    quoteCompleted,
    passageCompleted,
    devotionalCompleted,
    prayerCompleted,
    isCompleted,
    completedAt: isCompleted ? cached?.completedAt ?? null : null,
    dismissedAt: cached?.dismissedAt ?? null,
    isFavorite: cached?.isFavorite ?? false,
  };
}

export async function resolveDailyDevotionProgress(
  dateKey: string,
  userId?: string | null
): Promise<DailyDevotionProgress> {
  if (userId) {
    try {
      const remote = await loadRemoteDailyDevotionProgress(userId, dateKey);
      if (remote) {
        await saveDailyDevotionProgress(remote);
        return remote;
      }
      const emptyProgress = getDefaultDailyDevotionProgress(dateKey);
      await saveDailyDevotionProgress(emptyProgress);
      return emptyProgress;
    } catch (error) {
      console.warn("Falling back to default daily devotion progress for signed-in user.", error);
      const emptyProgress = getDefaultDailyDevotionProgress(dateKey);
      await saveDailyDevotionProgress(emptyProgress);
      return emptyProgress;
    }
  }

  return loadDailyDevotionProgress(dateKey);
}

export async function shouldPresentDailyDevotionOnLaunch(
  dateKey: string,
  userId?: string | null
): Promise<boolean> {
  const progress = await resolveDailyDevotionProgress(dateKey, userId);
  return !progress.isCompleted && !progress.dismissedAt;
}

export async function saveDailyDevotionProgress(progress: DailyDevotionProgress): Promise<void> {
  await cacheJson(offlineKeys.dailyDevotionProgress, progress);
}

export async function loadStoredStreakState(): Promise<StreakState | null> {
  return getCachedJson<StreakState>(offlineKeys.streakState);
}

export async function saveStoredStreakState(streak: StreakState): Promise<void> {
  await cacheJson(offlineKeys.streakState, streak);
}
