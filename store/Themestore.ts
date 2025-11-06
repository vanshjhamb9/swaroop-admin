import { create } from "zustand";

const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "light",
  setTheme(name) {
    set({ theme: name });
  },
}));

export default useThemeStore