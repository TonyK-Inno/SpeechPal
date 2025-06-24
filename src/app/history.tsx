import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getConversations,
  Conversation,
} from "../shared/utils/historyDatabase";

export default function HistoryScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.header}>Saved Conversations</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 32 }}
          />
        ) : conversations.length === 0 ? (
          <Text style={styles.empty}>No saved conversations.</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {conversations.map((conv) => (
              <View key={conv.id} style={styles.item}>
                <Text style={styles.name}>{conv.name}</Text>
                <Text style={styles.date}>
                  {new Date(conv.date).toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>
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
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  list: {
    paddingBottom: 32,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  empty: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 48,
  },
});
