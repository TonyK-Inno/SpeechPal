import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { useSettingsStore } from "../shared/store/useSettingsStore";
import { SUPPORTED_LANGUAGES, Language } from "../shared/constants/languages";
import { SUPPORTED_TEXT_SIZES, TextSize } from "../shared/constants/textSize";

export default function SettingsScreen() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const textSize = useSettingsStore((s) => s.textSize);
  const setTextSize = useSettingsStore((s) => s.setTextSize);

  const [langOpen, setLangOpen] = useState(false);
  const [langItems] = useState(
    SUPPORTED_LANGUAGES.map((l) => ({ label: l.label, value: l.value }))
  );
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sizeItems] = useState(
    SUPPORTED_TEXT_SIZES.map((s) => ({ label: s.label, value: s.value }))
  );

  // Improved zIndex gap for stacking dropdowns
  const langZIndex = langOpen ? 4000 : 1000;
  const langZIndexInverse = langOpen ? 1000 : 4000;
  const sizeZIndex = sizeOpen ? 3000 : 500;
  const sizeZIndexInverse = sizeOpen ? 500 : 3000;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.text}>Settings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Translation Language</Text>
          <View style={styles.pickerWrapper}>
            <DropDownPicker
              open={langOpen}
              value={language}
              items={langItems}
              setOpen={setLangOpen}
              setValue={(val) => {
                if (typeof val === "function") {
                  setLanguage((val as (curr: Language) => Language)(language));
                } else {
                  setLanguage(val as Language);
                }
              }}
              setItems={() => {}}
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholder="Select language"
              zIndex={langZIndex}
              zIndexInverse={langZIndexInverse}
            />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Text Size</Text>
          <View style={styles.pickerWrapper}>
            <DropDownPicker
              open={sizeOpen}
              value={textSize}
              items={sizeItems}
              setOpen={setSizeOpen}
              setValue={(val) => {
                if (typeof val === "function") {
                  setTextSize((val as (curr: TextSize) => TextSize)(textSize));
                } else {
                  setTextSize(val as TextSize);
                }
              }}
              setItems={() => {}}
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholder="Select text size"
              zIndex={sizeZIndex}
              zIndexInverse={sizeZIndexInverse}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    paddingTop: 32,
    paddingHorizontal: 16,
    position: "relative",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    width: "100%",
  },
  label: {
    fontSize: 18,
    flex: 1,
    marginRight: 12,
    color: "#222",
  },
  pickerWrapper: {
    flex: 1,
    minWidth: 150,
    maxWidth: 220,
    position: "relative",
  },
  dropdown: {
    backgroundColor: "#f2f2f2",
    borderColor: "#ccc",
    minHeight: 48,
  },
  dropdownText: {
    color: "#222",
    fontSize: 16,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
});
