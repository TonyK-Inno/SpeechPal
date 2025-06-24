import React, { useState, useEffect } from "react";
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

export default function TranscriptionScreen() {
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const language: Language = useSettingsStore((s) => s.language);
  const textSize: TextSize = useSettingsStore((s) => s.textSize);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [conversationName, setConversationName] = useState("");

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
    if (!history.length) {
      Toast.show("Nothing to save!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      setSaveModalVisible(false);
      setConversationName("");
      return;
    }
    try {
      await addConversation(name, history);
      setHistory([]);
      setSaveModalVisible(false);
      setConversationName("");
      Toast.show("Conversation saved!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } catch (e) {
      Toast.show("Failed to save conversation", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  const handleSavePress = () => {
    setSaveModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearHistory}
          accessibilityLabel="Clear all history"
        >
          <Ionicons name="trash-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePress}
          accessibilityLabel="Save conversation"
        >
          <Ionicons name="bookmark-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ScrollView
          style={styles.transcriptContainer}
          contentContainerStyle={styles.transcriptContent}
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
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recording]}
          onPress={isRecording ? stop : start}
          disabled={isLoading}
          accessibilityLabel={
            isRecording ? "Stop recording" : "Start recording"
          }
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRecording ? "Stop" : "Record"}
            </Text>
          )}
        </TouchableOpacity>
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    // padding: 16,
  },
  transcriptContainer: {
    flex: 1,
    width: "100%",
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
  recordButton: {
    position: "absolute",

    bottom: 12,
    backgroundColor: "#007AFF",
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    zIndex: 10,
    minWidth: 120,
  },
  recording: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  hr: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 8,
  },
  clearButton: {
    position: "absolute",
    top: "25%",
    right: 16,
    zIndex: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  saveButton: {
    position: "absolute",
    top: 24,
    right: 56,
    zIndex: 30,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
});
