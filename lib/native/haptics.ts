import * as Haptics from "expo-haptics";

export const triggerTab = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const triggerSend = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
export const triggerSuccess = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const triggerRebuke = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
