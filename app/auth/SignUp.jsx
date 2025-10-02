// app/auth/SignUp.jsx
import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const { width, height } = Dimensions.get("window");

  const createFloatingAnimation = (duration) => {
    const anim = new Animated.Value(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    ).start();
    return anim;
  };

  const animations = [
    createFloatingAnimation(4000),
    createFloatingAnimation(5000),
    createFloatingAnimation(4500),
    createFloatingAnimation(6000),
    createFloatingAnimation(1500),
    createFloatingAnimation(1800),
  ];

  const icons = [
    { name: "cloud-outline", size: 40, color: "#FF7043", top: height * 0.2, left: width * 0.2 },
    { name: "balloon-outline", size: 30, color: "#FF7043", top: height * 0.3, right: width * 0.1 },
    { name: "sparkles-outline", size: 35, color: "#FF7043", bottom: height * 0.15, left: width * 0.25 },
    { name: "star-outline", size: 28, color: "#FFA726", top: height * 0.3, left: width * 0.05 },
    { name: "planet-outline", size: 45, color: "#FFCC80", bottom: height * 0.1, right: width * 0.2 },
    { name: "heart-outline", size: 32, color: "#FF7043", top: height * 0.2, left: width * 0.7 },
  ];

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Create a Firestore doc for the user (optional, for other user data)
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
      });

      router.replace("/home/Home");
    } catch (error) {
      Alert.alert("Signup Error", error.message);
    }
  };

  return (
    <View style={styles.fullScreenWrapper}>
      {icons.map((icon, idx) => (
        <Animated.View
          key={idx}
          style={{
            position: "absolute",
            ...(icon.top !== undefined ? { top: icon.top } : {}),
            ...(icon.bottom !== undefined ? { bottom: icon.bottom } : {}),
            ...(icon.left !== undefined ? { left: icon.left } : {}),
            ...(icon.right !== undefined ? { right: icon.right } : {}),
            opacity: animations[idx].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            transform: [
              {
                translateY: animations[idx].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20 - idx * 5],
                }),
              },
              {
                rotate: animations[idx].interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${5 + idx * 3}deg`],
                }),
              },
            ],
          }}
        >
          <Ionicons name={icon.name} size={icon.size} color={icon.color} />
        </Animated.View>
      ))}

      <View style={styles.container}>
        <Text style={styles.title}>eRegistrar</Text>
        <Text style={styles.subtitle}>Create an Account</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp}>
            <Text style={styles.btnText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.signInText}>
            Already have an account?{" "}
            <Text style={styles.signInLink} onPress={() => router.replace("/auth/SignIn")}>
              Sign In
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenWrapper: { flex: 1, backgroundColor: "#1e1e1e" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, zIndex: 1 },
  title: { fontSize: 50, fontWeight: "bold", color: "#FF7043", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 22, color: "#ddd", marginBottom: 30, fontWeight: "600" },
  card: {
    width: "100%",
    backgroundColor: "#2a2a2a",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  input: { backgroundColor: "#3b3b3b", color: "#fff", paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  signupBtn: { backgroundColor: "#FF7043", paddingVertical: 14, borderRadius: 10, marginBottom: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 18 },
  signInText: { color: "#ccc", textAlign: "center", fontSize: 15 },
  signInLink: { color: "#FF7043", fontWeight: "bold", fontSize: 16 },
});
