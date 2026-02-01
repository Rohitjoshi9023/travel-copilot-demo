import { create } from 'zustand';
import type { Place } from '@/types';

interface ChatIntent {
  type: 'addToTrip';
  place: Place;
  timestamp: number;
}

interface ChatIntentState {
  pendingIntent: ChatIntent | null;
  setPendingIntent: (intent: ChatIntent | null) => void;
  clearIntent: () => void;
  // Callback to switch tabs in CopilotPanel
  onIntentSet: (() => void) | null;
  setOnIntentSet: (callback: (() => void) | null) => void;
}

export const useChatIntentStore = create<ChatIntentState>((set, get) => ({
  pendingIntent: null,
  onIntentSet: null,
  setPendingIntent: (intent) => {
    set({ pendingIntent: intent });
    // Call the tab switch callback if it exists
    if (intent && get().onIntentSet) {
      get().onIntentSet?.();
    }
  },
  clearIntent: () => set({ pendingIntent: null }),
  setOnIntentSet: (callback) => set({ onIntentSet: callback }),
}));
