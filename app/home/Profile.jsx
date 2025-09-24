import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import myAvatar from "../../assets/images/user.png";
import { auth, firestore } from "../../firebase/config";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function Profile() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Requests state
  const [requests, setRequests] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const router = useRouter();

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u?.displayName) {
        setNewName(u.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (authReady && !user) {
      router.replace("/auth/SignIn");
    }
  }, [authReady, user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/SignIn");
    } catch (err) {
      Alert.alert("Error signing out", err.message);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      Alert.alert("Invalid", "Name cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      await updateProfile(auth.currentUser, {
        displayName: newName.trim(),
      });
      Alert.alert("Success", "Username updated.");
      setEditing(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewName(user?.displayName || "");
    setEditing(false);
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      // TODO: Upload to Firebase Storage and update photoURL if needed
    }
  };

  // Fetch requests from Firestore
  const fetchRequests = async () => {
    if (!user?.uid) return;
    setIsFetching(true);
    try {
      const qSnapshot = await getDocs(collection(firestore, "requests"));
      const arr = qSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setRequests(arr);
    } catch (err) {
      Alert.alert("Error", "Could not load requests.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleDelete = async (item) => {
    if (!item || !item.id) return;
    Alert.alert("Confirm Delete", "Are you sure you want to delete this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(firestore, "requests", item.id));
          Alert.alert("Deleted", "Request has been deleted.");
          fetchRequests();
        },
      },
    ]);
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.requestText}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={styles.requestText}>Reason: {item.reason}</Text>
      <Text style={styles.requestText}>Status: {item.status}</Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (!activeSection) {
      return (
        <>
          {["My Profile", "Settings", "Archive", "Deleted", "About App"].map(
            (label, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.card}
                onPress={() =>
                  setActiveSection(label.toLowerCase().replace(" ", ""))
                }
              >
                <Text style={styles.label}>{label}</Text>
              </TouchableOpacity>
            )
          )}
        </>
      );
    }

    const commonHeader = (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setActiveSection(null)}
      >
        <Ionicons name="arrow-back" size={28} color="#FF7043" />
      </TouchableOpacity>
    );

    if (activeSection === "deleted") {
      return (
        <View style={styles.sectionContainer}>
          {commonHeader}
          <Text style={styles.sectionTitle}>Deleted Requests</Text>
          {isFetching ? (
            <ActivityIndicator color="#FF7043" />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              renderItem={renderRequestItem}
              ListEmptyComponent={() => (
                <Text style={styles.sectionText}>No requests found.</Text>
              )}
            />
          )}
        </View>
      );
    }

    return (
      <View style={styles.sectionContainer}>
        {commonHeader}
        <Text style={styles.sectionTitle}>
          {activeSection.replace(/^\w/, (c) => c.toUpperCase())}
        </Text>
        <Text style={styles.sectionText}>
          {activeSection === "myprofile"
            ? `Name: ${user?.displayName || "N/A"}\nEmail: ${user?.email || "N/A"}`
            : activeSection === "aboutapp"
            ? "This app is developed for eRegistrar document requests."
            : `${activeSection} content goes here.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : user?.photoURL
                  ? { uri: user.photoURL }
                  : myAvatar
              }
              style={styles.avatar}
            />
          </View>

          <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
            <Ionicons name="image" size={24} color="#FF7043" />
            <Text style={styles.pickImageText}>Change Photo</Text>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.displayName || "Username"}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Ionicons name="pencil" size={20} color="#FF7043" />
          </TouchableOpacity>
        </View>

        {renderContent()}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Edit username overlay */}
        {editing && (
          <View style={styles.overlay}>
            <View style={styles.floatingWrapper}>
              <Text style={styles.editLabel}>Edit Username</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter your name"
                placeholderTextColor="#aaa"
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveName}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Logout modal */}
        <Modal
          visible={logoutModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLogoutModalVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.logoutModalContent}>
              <Text style={styles.logoutModalText}>
                Are you sure you want to Log Out?
              </Text>
              <View style={styles.logoutModalButtons}>
                <TouchableOpacity
                  style={[styles.logoutModalBtn, styles.cancelBtn]}
                  onPress={() => setLogoutModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logoutModalBtn, styles.confirmBtn]}
                  onPress={async () => {
                    setLogoutModalVisible(false);
                    await handleSignOut();
                  }}
                >
                  <Text style={styles.confirmText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 70,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FF7043",
    marginTop: 15,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    resizeMode: "cover",
  },
  pickImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#2a2a2a",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  pickImageText: {
    color: "#FF7043",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginTop: 8,
  },
  email: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 4,
  },
  editBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
  },
  card: {
    backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 5,
    marginTop: 2,
  },
  label: {
    fontWeight: "600",
    fontSize: 17,
    color: "#fff",
  },
  logoutBtn: {
    backgroundColor: "#FF7043",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  floatingWrapper: {
    backgroundColor: "#2a2a2a",
    width: "85%",
    maxWidth: 400,
    padding: 25,
    borderRadius: 20,
  },
  editLabel: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
    color: "#FF7043",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#3b3b3b",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#FF7043",
    paddingVertical: 14,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#444",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#ccc",
    fontWeight: "700",
    fontSize: 16,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  confirmBtn: {
    backgroundColor: "#FF7043",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  logoutModalContent: {
    backgroundColor: "#2a2a2a",
    padding: 30,
    borderRadius: 24,
    width: "80%",
  },
  logoutModalText: {
    color: "#FF7043",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  logoutModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logoutModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  backButton: {
    marginBottom: 20,
  },
  sectionContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: "#FF7043",
  },
  sectionText: {
    fontSize: 17,
    color: "#ccc",
    marginBottom: 8,
  },
  requestCard: {
    backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
  },
  requestText: {
    color: "#fff",
    marginBottom: 4,
  },
  deleteBtn: {
    marginTop: 6,
    backgroundColor: "#FF7043",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
