import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getConversations,
  Conversation,
  deleteConversation,
} from "../../shared/utils/historyDatabase";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function HistoryScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  // Delete handler
  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Remove from DB and update state
            await deleteConversation(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));
          },
        },
      ]
    );
  };

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
              <View key={conv.id} style={styles.itemRow}>
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => router.push(`/history/${conv.id}`)}
                  accessibilityLabel={`Open conversation ${conv.name}`}
                >
                  <Text style={styles.name}>{conv.name}</Text>
                  <Text style={styles.date}>
                    {new Date(conv.date).toLocaleString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(conv.id)}
                  accessibilityLabel={`Delete conversation ${conv.name}`}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </TouchableOpacity>
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  item: {
    flex: 1,
    padding: 16,
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
  deleteButton: {
    padding: 12,
  },
  empty: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 48,
  },
});
