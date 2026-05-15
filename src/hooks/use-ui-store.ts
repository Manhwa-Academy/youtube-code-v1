import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  isFireworkEnabled: boolean;
  toggleFirework: () => void;
  setFireworkEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isFireworkEnabled: true,
      toggleFirework: () => set((state) => ({ isFireworkEnabled: !state.isFireworkEnabled })),
      setFireworkEnabled: (enabled) => set({ isFireworkEnabled: enabled }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
