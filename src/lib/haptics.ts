import * as Haptics from 'expo-haptics';

export async function tapLight(): Promise<void> {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Silencioso: Expo Go/web ou dispositivo sem suporte não quebram.
  }
}

export async function tapMedium(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Silencioso: Expo Go/web ou dispositivo sem suporte não quebram.
  }
}

export async function success(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Silencioso: Expo Go/web ou dispositivo sem suporte não quebram.
  }
}

export async function errorFeedback(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Silencioso: Expo Go/web ou dispositivo sem suporte não quebram.
  }
}
