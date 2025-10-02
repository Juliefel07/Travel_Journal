import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const OFFICE_START = 8;
const OFFICE_END = 17;

export default function Mail() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [announcementMessages, setAnnouncementMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkRegistrarStatus();
  }, []);

  const checkRegistrarStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const day = now.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const isOpen = isWeekday && currentHour >= OFFICE_START && currentHour < OFFICE_END;

    if (isOpen) {
      const adminAnnouncement = {
        id: "admin",
        name: " Registrar Announcement",
        message: "The school registrar is OPEN ",
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
        avatar: "https://cdn-icons-png.flaticon.com/512/906/906343.png",
        isAdmin: true,
      };

      setAnnouncementMessages([
        {
          id: "a1",
          text: "📢 The school registrar is now OPEN. Office hours: 8:00 AM – 5:00 PM.",
          sender: "admin",
        },
      ]);

      setConversations([adminAnnouncement]);
    } else {
      setAnnouncementMessages([]);
      setConversations([]);
    }
  };

  const filteredConversations = conversations.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.message.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedChat) {
    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: selectedChat.avatar }} style={styles.chatAvatar} />
          <Text style={styles.chatName}>{selectedChat.name}</Text>
        </View>

        <FlatList
          data={announcementMessages}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, styles.theirBubble]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>

      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 📚 Floating Tutorial Icon Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/home/Tutorial")}
      >
        <Ionicons name="book-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chatItem,
              item.isAdmin && { backgroundColor: "#333335ff" },
            ]}
            onPress={() => setSelectedChat(item)}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <Text
                style={[
                  styles.chatName,
                  item.isAdmin && { color: "#FF7043", fontWeight: "bold" },
                ]}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.chatMessage,
                  item.isAdmin && { color: "#ffffffff", fontWeight: "500" },
                ]}
                numberOfLines={1}
              >
                {item.message}
              </Text>
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
            No messages yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FF7043",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: "#000",
  },
  // 🟠 Floating Tutorial Button
    floatingButton: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    backgroundColor: "#FF7043",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 10,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000ff",
  },
  chatMessage: {
    color: "#666",
    marginTop: 2,
  },
  chatTime: {
    fontSize: 12,
    color: "#888",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7043",
    padding: 15,
    paddingTop: 50,
  },
  chatAvatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 5,
    maxWidth: "80%",
  },
  theirBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#000",
  },
});
