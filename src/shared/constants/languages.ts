export const SUPPORTED_LANGUAGES = [
  { label: "English (en-US)", value: "en-US" },
  { label: "Russian (ru-RU)", value: "ru-RU" },
] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number]["value"];
