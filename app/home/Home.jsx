// app/home/Home.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth } from "../../firebase/config";

export default function Home() {
  // Get user from context or auth
  const user = auth.currentUser; // or via router context
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState("Processing");
  const [menuIndex, setMenuIndex] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    phone: "",
    document: "",
    date: "",
    reason: "",
    status: "Requesting",
  });

  const resetForm = () => {
    setFormData({
      id: null,
      firstName: "",
      lastName: "",
      studentId: "",
      email: "",
      phone: "",
      document: "",
      date: "",
      reason: "",
      status: "Requesting",
    });
  };

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) return;
      const key = `requests_${user.uid}`;
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setRequests(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load requests", err);
      }
    };
    loadRequests();
  }, [user]);

  const saveRequests = async (newRequests) => {
    if (!user) return;
    const key = `requests_${user.uid}`;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newRequests));
    } catch (err) {
      console.error("Failed to save requests", err);
    }
  };

 const handleSubmit = () => {
  if (formData.id) {
    // Edit existing request
    const updatedRequests = requests.map((r) =>
      r.id === formData.id ? { ...formData, status: r.status || "Processing" } : r
    );
    setRequests(updatedRequests);
    saveRequests(updatedRequests);
  } else {
    // New request
    const id = Date.now().toString();
    const newRequest = {
      ...formData,
      id,
      status: "Processing",
    };
    const updated = [...requests, newRequest];
    setRequests(updated);
    saveRequests(updated);

    // After 1 hour, move to To Receive
    setTimeout(() => {
      setRequests((prev) => {
        const updated2 = prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "To Receive",
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              }
            : r
        );
        saveRequests(updated2);
        return updated2;
      });
    }, 10000);
  }

  setRequestModalVisible(false);
  resetForm();
};


  const handleEdit = (item) => {
    setFormData(item);
    setRequestModalVisible(true);
    setMenuIndex(null);
  };

  const handleDelete = (id) => {
    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    saveRequests(updated);
    setMenuIndex(null);
  };

  const handleClaim = (id) => {
    const updated = requests.map((r) => (r.id === id ? { ...r, status: "Completed" } : r));
    setRequests(updated);
    saveRequests(updated);
  };

  const filteredRequests = requests.filter(
    (r) => r.status === currentTab || (currentTab === "Processing" && r.status === "Requesting")
  );

  const tabData = [
    { label: "Processing", icon: "settings-outline" },
    { label: "To Receive", icon: "mail-open-outline" },
    { label: "Completed", icon: "checkmark-done-outline" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>eRegistrar</Text>
      <Text style={styles.subHeader}>Request Campus Registrar Documents</Text>

      <View style={styles.tabContainer}>
        {tabData.map((tab) => (
          <TouchableOpacity key={tab.label} onPress={() => setCurrentTab(tab.label)} style={styles.tab}>
            <Ionicons name={tab.icon} size={29} color={currentTab === tab.label ? "#FF7043" : "#777"} />
            <Text style={[styles.tabText, currentTab === tab.label && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>{item.document}</Text>
              <Text style={styles.docInfo}>
                {item.firstName} {item.lastName} • {item.studentId}
              </Text>
              <Text style={styles.docInfo}>Date: {item.date}</Text>
              <Text style={styles.docInfo}>Reason: {item.reason}</Text>
              <Text style={styles.status}>
                Status:{" "}
                <Text
                  style={{
                    color:
                      item.status === "Completed"
                        ? "#4caf50"
                        : item.status === "To Receive"
                        ? "#ff9800"
                        : "#ff5722",
                  }}
                >
                  {item.status}
                </Text>
              </Text>
            </View>

            {item.status === "Processing" && (
              <View style={{ justifyContent: "center" }}>
                <TouchableOpacity onPress={() => setMenuIndex(index)}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#bbb" />
                </TouchableOpacity>
                {menuIndex === index && (
                  <View style={styles.menu}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.menuItem}>
                      <Text style={styles.menuText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.menuItem}>
                      <Text style={[styles.menuText, { color: "#f44336" }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {item.status === "To Receive" && (
              <TouchableOpacity style={styles.claimButton} onPress={() => handleClaim(item.id)}>
                <Text style={styles.claimText}>Claim</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No requests in this tab.</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          setRequestModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={requestModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Document Request Form</Text>

            {[
              { placeholder: "First Name", key: "firstName" },
              { placeholder: "Last Name", key: "lastName" },
              { placeholder: "Student ID", key: "studentId" },
              { placeholder: "Email", key: "email" },
              { placeholder: "Phone", key: "phone" },
              { placeholder: "Document Type", key: "document" },
              { placeholder: "Date Requested", key: "date" },
            ].map((field) => (
              <TextInput
                key={field.key}
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#999"
                value={formData[field.key]}
                onChangeText={(text) => setFormData({ ...formData, [field.key]: text })}
              />
            ))}

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Reason for Request"
              placeholderTextColor="#999"
              multiline
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{formData.id ? "Update" : "Submit"} Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 10, alignSelf: "center" }}
              onPress={() => {
                setRequestModalVisible(false);
                resetForm();
              }}
            >
              <Text style={{ color: "#ccc" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1e1e", padding: 20 },
  header: { fontSize: 30, fontWeight: "bold", color: "#FF7043", textAlign: "center", marginBottom: 4, marginTop: 45 },
  subHeader: { textAlign: "center", fontSize: 14, color: "#ccc", marginBottom: 20 },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  tab: { alignItems: "center" },
  tabText: { fontSize: 18, color: "#777" },
  activeTabText: { color: "#FF7043", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    backgroundColor: "#f1e8e5ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF7043",
    alignItems: "center",
    justifyContent: "space-between",
  },
  docTitle: { fontSize: 16, fontWeight: "bold", color: "#000000ff" },
  docInfo: { color: "#000000ff", fontSize: 13, marginTop: 2 },
  status: { marginTop: 5, fontSize: 13, color: "#000000ff" },
  fab: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#FF7043",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF7043",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(30,30,30,0.95)", justifyContent: "center", paddingHorizontal: 20 },
  modalContainer: { backgroundColor: "#2a2a2a", padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#FF7043", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#444", borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 15, backgroundColor: "#3b3b3b", color: "#fff" },
  submitButton: { backgroundColor: "#FF7043", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  menu: { position: "absolute", top: 25, right: 0, backgroundColor: "#2a2a2a", borderRadius: 6, elevation: 5, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, zIndex: 100, width: 100 },
  menuItem: { paddingHorizontal: 15, paddingVertical: 10, borderBottomColor: "#444", borderBottomWidth: 1 },
  menuText: { fontSize: 14, color: "#ccc" },
  emptyText: { color: "#999", textAlign: "center", marginTop: 50, fontSize: 16 },
  claimButton: { backgroundColor: "#d45405ff", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, marginTop: 45 },
  claimText: { color: "#fff", fontWeight: "bold" },
});
