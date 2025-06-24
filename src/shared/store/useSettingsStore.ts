import { create } from "zustand";
import { MMKV } from "react-native-mmkv";
import { Language } from "../constants/languages";
import { TextSize, SUPPORTED_TEXT_SIZES } from "../constants/textSize";

const storage = new MMKV();

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const SETTINGS_KEY = "settings";
const TEXT_SIZE_KEY = "textSize";

const getInitialTextSize = (): TextSize => {
  const saved = storage.getNumber(TEXT_SIZE_KEY);
  const valid = SUPPORTED_TEXT_SIZES.some((s) => s.value === saved);
  if (valid) return saved as TextSize;
  return 28;
};

const getInitialLanguage = (): Language => {
  const saved = storage.getString(SETTINGS_KEY);
  if (saved === "en-US" || saved === "ru-RU") return saved;
  return "en-US";
};

export const useSettingsStore = create<SettingsState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (lang) => {
    set({ language: lang });
    storage.set(SETTINGS_KEY, lang);
  },
  textSize: getInitialTextSize(),
  setTextSize: (size) => {
    set({ textSize: size });
    storage.set(TEXT_SIZE_KEY, size);
  },
}));
