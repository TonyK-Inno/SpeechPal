import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "../shared/store/useSettingsStore";
import { Language } from "../shared/constants/languages";
import { TextSize } from "../shared/constants/textSize";
import { Ionicons } from "@expo/vector-icons";
import { Alert as RNAlert } from "react-native";
import Toast from "react-native-root-toast";
import {
  initHistoryDB,
  addConversation,
} from "../shared/utils/historyDatabase";
import { TEST_CONVERSATION } from "../shared/constants/testConversation";

export default function TranscriptionScreen() {
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const language: Language = useSettingsStore((s) => s.language);
  const textSize: TextSize = useSettingsStore((s) => s.textSize);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [conversationName, setConversationName] = useState("");
  const [isProtectionOn, setIsProtectionOn] = useState(false);
  const lastTap = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0].transcript);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    if (transcript.trim()) {
      setHistory((prev) => [...prev, transcript]);
      setTranscript("");
    }
  });

  useSpeechRecognitionEvent("error", (error) => {
    setIsRecording(false);
    Alert.alert("Speech recognition error", error.message || "Unknown error");
  });

  useEffect(() => {
    initHistoryDB();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [history, transcript]);

  const start = async () => {
    setIsLoading(true);
    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert(
          "Microphone Permission Required",
          "Please enable microphone access in your device settings to use speech recognition.",
          [
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }
      setTranscript(""); // Clear transcript for new phrase
      ExpoSpeechRecognitionModule.start({
        lang: language,
        continuous: true,
        interimResults: true,
      });
      setIsRecording(true);
    } catch (e) {
      const err = e as Error;
      Alert.alert("Could not start recording", err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const stop = async () => {
    setIsLoading(true);
    try {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
    } catch (e) {
      const err = e as Error;
      Alert.alert("Could not stop recording", err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => setHistory([]);

  const saveConversation = async (name: string) => {
    console.log(
      "saveConversation called with name:",
      name,
      "history:",
      history
    );
    if (!history.length) {
      console.log("Nothing to save, showing toast");
      Toast.show("Nothing to save!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      setSaveModalVisible(false);
      setConversationName("");
      return;
    }
    try {
      console.log("Calling addConversation");
      await addConversation(name, history);
      console.log("addConversation finished");
      setSaveModalVisible(false);
      setConversationName("");
      console.log("Showing success toast");
      Toast.show("Conversation saved!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } catch (e) {
      console.log("Error in saveConversation:", e);
      Toast.show("Failed to save conversation", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  const handleSavePress = () => {
    setSaveModalVisible(true);
  };

  // Handler for lock/unlock (double tap)
  const handleLockButton = async () => {
    if (!isProtectionOn) {
      if (isRecording) {
        await stop();
      }
      setIsProtectionOn(true);
    } else {
      const now = Date.now();
      if (now - lastTap.current < 400) {
        setIsProtectionOn(false);
      }
      lastTap.current = now;
    }
  };

  // Vignette overlay
  const { width, height } = Dimensions.get("window");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.flexContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.transcriptContainer}
          contentContainerStyle={styles.transcriptContent}
          scrollEnabled={!isProtectionOn}
        >
          {history.map((phrase, idx) => (
            <React.Fragment key={idx}>
              <Text style={[styles.transcriptText, { fontSize: textSize }]}>
                {phrase}
              </Text>
              <View style={styles.hr} />
            </React.Fragment>
          ))}
          {transcript ? (
            <Text style={[styles.transcriptText, { fontSize: textSize }]}>
              {transcript}
            </Text>
          ) : !history.length ? (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Press record button to begin transcribing
              </Text>
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.bottomRow}>
          <View style={styles.lockButtonContainer}>
            <TouchableOpacity
              style={[
                styles.protectionButton,
                isProtectionOn && styles.protectionButtonLocked,
              ]}
              onPress={handleLockButton}
              disabled={isRecording}
              accessibilityLabel={
                isProtectionOn
                  ? "Double tap to unlock"
                  : "Activate screen protection"
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={isProtectionOn ? "lock-closed-outline" : "shield-outline"}
                size={23}
                color={isProtectionOn ? "#fff" : "#007AFF"}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.centerButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={clearHistory}
              accessibilityLabel="Clear all history"
              disabled={isProtectionOn}
            >
              <Ionicons name="trash-outline" size={23} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recording]}
              onPress={isRecording ? stop : start}
              disabled={isLoading || isProtectionOn}
              accessibilityLabel={
                isRecording ? "Stop recording" : "Start recording"
              }
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="mic" size={29} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSavePress}
              accessibilityLabel="Save conversation"
              disabled={isProtectionOn}
            >
              <Ionicons name="bookmark-outline" size={23} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.rightSpacer} />
        </View>
        {saveModalVisible && (
          <View style={styles.saveModalOverlay}>
            <View style={styles.saveModal}>
              <Text style={styles.saveModalTitle}>Save Conversation</Text>
              <TextInput
                style={styles.saveModalInput}
                placeholder="Enter conversation name"
                value={conversationName}
                onChangeText={setConversationName}
                autoFocus
              />
              <View style={styles.saveModalActions}>
                <TouchableOpacity
                  onPress={() => setSaveModalVisible(false)}
                  style={styles.saveModalCancel}
                >
                  <Text style={{ color: "#888" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (conversationName.trim()) {
                      saveConversation(conversationName.trim());
                    } else {
                      RNAlert.alert(
                        "Please enter a name for the conversation."
                      );
                    }
                  }}
                  style={styles.saveModalConfirm}
                >
                  <Text style={{ color: "#007AFF", fontWeight: "bold" }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flexContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  transcriptContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: "5%",
  },
  transcriptContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingBottom: 16,
  },
  transcriptText: {
    fontSize: 28,
    textAlign: "left",
    color: "#222",
    fontWeight: "bold",
    width: "100%",
    alignSelf: "stretch",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "rgba(21, 93, 97, 0.2)",
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 19,
    padding: 8,
    marginHorizontal: 12,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordButton: {
    backgroundColor: "#007AFF",
    borderRadius: 29,
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    zIndex: 12,
  },
  recording: {
    backgroundColor: "#FF3B30",
  },
  hr: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 8,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 120,
  },
  placeholderText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 32,
  },
  saveModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  saveModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  saveModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  saveModalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  saveModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  saveModalCancel: {
    marginRight: 24,
  },
  saveModalConfirm: {},
  protectionButton: {
    backgroundColor: "#fff",
    borderRadius: 19,
    padding: 8,
    marginLeft: 8,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignSelf: "center",
  },
  protectionButtonLocked: {
    backgroundColor: "#FF3B30",
  },
  centerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    alignItems: "center",
  },
  lockButtonContainer: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSpacer: {
    width: 58, // Same as lockButtonContainer
  },
});
