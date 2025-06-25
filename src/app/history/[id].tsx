import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  getConversationById,
  Conversation,
} from "../../shared/utils/historyDatabase";
import { useSettingsStore } from "../../shared/store/useSettingsStore";

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const textSize = useSettingsStore((s) => s.textSize);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const conv = await getConversationById(Number(id));
      setConversation(conv);
      setLoading(false);
      if (conv) {
        navigation.setOptions({
          headerTitle: conv.name,
          headerSubtitle: new Date(conv.date).toLocaleString(),
          headerBackTitle: "",
        });
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Conversation not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {conversation.phrases.map((phrase, idx) => (
          <Text key={idx} style={[styles.phrase, { fontSize: textSize }]}>
            {phrase}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: 20,
    color: "#888",
    textAlign: "center",
  },
  phrase: {
    color: "#222",
    marginBottom: 12,
    lineHeight: 28,
  },
});
