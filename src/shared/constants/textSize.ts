export const SUPPORTED_TEXT_SIZES = [
  { label: "Small", value: 20 },
  { label: "Medium", value: 24 },
  { label: "Large", value: 28 },
  { label: "Extra Large", value: 32 },
  { label: "XXL", value: 36 },
  { label: "Huge", value: 44 },
] as const;

export type TextSize = (typeof SUPPORTED_TEXT_SIZES)[number]["value"];
