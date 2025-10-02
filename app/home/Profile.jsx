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
  Modal,
  Alert,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import myAvatar from "../../assets/images/user.png";
import { auth, db } from "../../firebase/config";
import { doc, getDoc, setDoc, deleteField } from "firebase/firestore";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileInfo, setProfileInfo] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [formData, setFormData] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState(null); // "profile" | "school"
  const [editUsernameVisible, setEditUsernameVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const router = useRouter();

  // 🔑 Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await u.reload();
        setUser(auth.currentUser);
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 🔑 Redirect if no user
  useEffect(() => {
    if (authReady && !user) {
      router.replace("/auth/SignIn");
    }
  }, [authReady, user]);

  // 🔑 Fetch Firestore data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const docRef = doc(db, "profiles", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProfileInfo(snap.data().profileInfo || null);
        setSchoolInfo(snap.data().schoolInfo || null);
      }
    };
    fetchData();
  }, [user]);

  // 🔑 Save Profile or School info
  const handleSave = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "profiles", user.uid);
      await setDoc(
        docRef,
        {
          [editType === "profile" ? "profileInfo" : "schoolInfo"]: formData,
        },
        { merge: true }
      );

      if (editType === "profile") setProfileInfo(formData);
      else setSchoolInfo(formData);

      setEditModalVisible(false);
      Alert.alert("Success", "Information saved successfully.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // ✏️ Save Username
  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    try {
      // Firestore
      await setDoc(
        doc(db, "profiles", user.uid),
        { username: newUsername },
        { merge: true }
      );

      // Firebase Auth
      await updateProfile(auth.currentUser, { displayName: newUsername });
      await auth.currentUser.reload();
      setUser(auth.currentUser);

      setEditUsernameVisible(false);
      Alert.alert("Success", "Username updated successfully!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // 🔑 Delete Section
  const handleDelete = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "profiles", user.uid);
      await setDoc(
        docRef,
        {
          [editType === "profile" ? "profileInfo" : "schoolInfo"]: deleteField(),
        },
        { merge: true }
      );

      if (editType === "profile") setProfileInfo(null);
      else setSchoolInfo(null);

      setEditModalVisible(false);
      Alert.alert("Deleted", "Information removed.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // 🔑 Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/SignIn");
    } catch (err) {
      Alert.alert("Error signing out", err.message);
    }
  };

  // 🖼 Pick Avatar
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to gallery!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // 📝 Render Profile Info Section
  const renderProfileInfo = () => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <TouchableOpacity
          onPress={() => {
            setEditType("profile");
            setFormData(
              profileInfo || { status: "", gender: "", yearLevel: "", course: "" }
            );
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={22} color="#FF7043" />
        </TouchableOpacity>
      </View>

      {profileInfo ? (
        <>
          <Text style={styles.infoRow}>
            <Text style={styles.label}>Status: </Text>
            <Text style={styles.value}>{profileInfo.status}</Text>
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.label}>Gender: </Text>
            <Text style={styles.value}>{profileInfo.gender}</Text>
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.label}>Year Level: </Text>
            <Text style={styles.value}>{profileInfo.yearLevel}</Text>
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.label}>Course: </Text>
            <Text style={styles.value}>{profileInfo.course}</Text>
          </Text>
        </>
      ) : (
        <Text style={styles.value}>No profile info yet.</Text>
      )}
    </View>
  );

  // 🏫 Render School Info Section
  const renderSchoolInfo = () => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>School Information</Text>
        <TouchableOpacity
          onPress={() => {
            setEditType("school");
            setFormData(
              schoolInfo || { school: "", department: "", studentId: "" }
            );
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={22} color="#FF7043" />
        </TouchableOpacity>
      </View>

      {schoolInfo ? (
        <>
          <Text style={styles.infoRow}>
            <Text style={styles.label}>School: </Text>
            <Text style={styles.value}>{schoolInfo.school}</Text>
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.label}>Department: </Text>
            <Text style={styles.value}>{schoolInfo.department}</Text>
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.label}>Student ID: </Text>
            <Text style={styles.value}>{schoolInfo.studentId}</Text>
          </Text>
        </>
      ) : (
        <Text style={styles.value}>No school info yet.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={["#f2a790", "#FF5722", "#8c2404ff"]}
          style={styles.gradientHeader}
        >
          <View style={styles.profileHeader}>
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
              <TouchableOpacity
                style={styles.avatarEditBtn}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text style={styles.name}>
                {user?.displayName || "Student Name"}
              </Text>
              <TouchableOpacity
                onPress={() => setEditUsernameVisible(true)}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.studentId}>{user?.email || "No email"}</Text>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "profile" && styles.tabBtnActive]}
            onPress={() => setActiveTab("profile")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "profile" && styles.tabTextActive,
              ]}
            >
              Profile Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "school" && styles.tabBtnActive]}
            onPress={() => setActiveTab("school")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "school" && styles.tabTextActive,
              ]}
            >
              School Info
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "profile" ? renderProfileInfo() : renderSchoolInfo()}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Info Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.editModal}>
            <Text style={styles.sectionTitle}>
              Edit {editType === "profile" ? "Profile" : "School"} Info
            </Text>

            {editType === "profile" ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Status"
                  placeholderTextColor="#aaa"
                  value={formData.status}
                  onChangeText={(t) => setFormData({ ...formData, status: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Gender"
                  placeholderTextColor="#aaa"
                  value={formData.gender}
                  onChangeText={(t) => setFormData({ ...formData, gender: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Year Level"
                  placeholderTextColor="#aaa"
                  value={formData.yearLevel}
                  onChangeText={(t) => setFormData({ ...formData, yearLevel: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Course"
                  placeholderTextColor="#aaa"
                  value={formData.course}
                  onChangeText={(t) => setFormData({ ...formData, course: t })}
                />
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="School"
                  placeholderTextColor="#aaa"
                  value={formData.school}
                  onChangeText={(t) => setFormData({ ...formData, school: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Department"
                  placeholderTextColor="#aaa"
                  value={formData.department}
                  onChangeText={(t) =>
                    setFormData({ ...formData, department: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Student ID"
                  placeholderTextColor="#aaa"
                  value={formData.studentId}
                  onChangeText={(t) =>
                    setFormData({ ...formData, studentId: t })
                  }
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#FF7043" }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
             
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#555" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✏️ Edit Username Modal */}
      <Modal visible={editUsernameVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.editModal}>
            <Text style={styles.sectionTitle}>Edit Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new username"
              placeholderTextColor="#aaa"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#FF7043" }]}
                onPress={handleSaveUsername}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#555" }]}
                onPress={() => setEditUsernameVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
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
                onPress={handleSignOut}
              >
                <Text style={styles.confirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1e1e", paddingTop: 20 },
  gradientHeader: {
    width: "90%",
    borderRadius: 80,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 80,
    paddingVertical: 40,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  profileHeader: { alignItems: "center" },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 15,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 60 },
  avatarEditBtn: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#FF7043",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 6 },
  studentId: { fontSize: 16, color: "#ddd" },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabBtnActive: { 
    backgroundColor: "#FF7043",
    borderRadius: 5,
  },
  tabText: { color: "#aaa", fontWeight: "600",},
  tabTextActive: { color: "#fff", fontWeight: "700" },
  infoCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoRow: { marginBottom: 15 },
  label: { fontWeight: "700", color: "#FF7043", fontSize: 15 },
  value: { color: "#fff", fontSize: 15 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#fff",
    marginBottom: 10,
    
  },
  logoutBtn: {
    backgroundColor: "#FF7043",
    padding: 15,
    marginHorizontal: 50,
    borderRadius: 10,
    marginBottom: 10,
    width: '93%',
    alignItems: "center",
    alignSelf: 'center',
  },
  logoutText: { color: "#fff", fontWeight: "700" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  editModal: {
    backgroundColor: "#2a2a2a",
    padding: 20,
    borderRadius: 15,
    width: "100%",
  },
  input: {
    backgroundColor: "#3a3a3a",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
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
  cancelBtn: {
    flex: 1,
    backgroundColor: "#444",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtn: { backgroundColor: "#FF7043" },
  cancelText: { color: "#fff", fontWeight: "700" },
  confirmText: { color: "#fff", fontWeight: "700" },
});
