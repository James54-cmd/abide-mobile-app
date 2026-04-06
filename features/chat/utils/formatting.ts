/**
 * Chat utility functions for formatting and display logic (SKILL.md Rule 16).
 * Pure functions with no side effects.
 */

/**
 * Format timestamp to relative time for conversation lists.
 * @param timestamp - ISO string timestamp
 * @returns Human-readable relative time string
 */
export function formatConversationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours === 1) return "1h ago";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Format message count for display in conversation cards.
 * @param count - Number of messages
 * @returns Formatted message count string
 */
export function formatMessageCount(count: number): string {
  return `${count} message${count !== 1 ? "s" : ""}`;
}