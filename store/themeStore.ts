import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () =>
        set((state) => {
          console.log(
            `[Theme] Toggling theme from ${state.isDark ? "dark" : "light"} to ${!state.isDark ? "dark" : "light"}`
          );
          return { isDark: !state.isDark };
        }),
      setTheme: (isDark: boolean) =>
        set(() => {
          console.log(`[Theme] Setting theme to ${isDark ? "dark" : "light"}`);
          return { isDark };
        }),
    }),
    {
      name: "theme-store",
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Fail silently
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
