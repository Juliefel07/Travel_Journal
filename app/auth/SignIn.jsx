// app/auth/SignIn.jsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { width, height } = Dimensions.get("window");

  const createFloatingAnimation = (duration) => {
    const anim = new Animated.Value(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
    return anim;
  };

  const animations = [
    createFloatingAnimation(2000),
    createFloatingAnimation(5000),
    createFloatingAnimation(4500),
    createFloatingAnimation(6000),
    createFloatingAnimation(1500),
    createFloatingAnimation(4800),
  ];

  const icons = [
    { name: "airplane-outline", size: 60, color: "#FF7043", top: height * 0.0, left: width * 0.1 },
    { name: "planet-outline", size: 30, color: "#FF7043", top: height * 0.3, right: width * 0.1 },
    { name: "rocket-outline", size: 35, color: "#FF7043", bottom: height * 0.2, left: width * 0.25 },
    { name: "sunny-outline", size: 28, color: "#FFA726", top: height * 0.4, left: width * 0.05 },
    { name: "star-outline", size: 25, color: "#FFCC80", bottom: height * 0.2, right: width * 0.2 },
    { name: "heart-outline", size: 32, color: "#FF7043", top: height * 0.2, left: width * 0.7 },
  ];

  const handleSignIn = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // On success, route to Home (or Profile)
      router.replace("/home/Home");
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {icons.map((icon, index) => (
        <Animated.View
          key={index}
          style={{
            position: "absolute",
            ...(icon.top !== undefined ? { top: icon.top } : {}),
            ...(icon.bottom !== undefined ? { bottom: icon.bottom } : {}),
            ...(icon.left !== undefined ? { left: icon.left } : {}),
            ...(icon.right !== undefined ? { right: icon.right } : {}),
            opacity: animations[index].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            transform: [
              {
                translateY: animations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20 - index * 5],
                }),
              },
              {
                rotate: animations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${5 + index * 3}deg`],
                }),
              },
            ],
          }}
        >
          <Ionicons name={icon.name} size={icon.size} color={icon.color} />
        </Animated.View>
      ))}

      <Text style={styles.title}>eRegistrar</Text>
      <Text style={styles.subtitle}>Welcome Back!</Text>

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
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleSignIn}>
          <Text style={styles.btnText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.signUpText}>
          Don't have an account?{" "}
          <Text style={styles.signUpLink} onPress={() => router.replace("/auth/SignUp")}>
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1e1e", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  title: { fontSize: 50, fontWeight: "bold", color: "#FF7043", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 22, color: "#ddd", marginBottom: 30, fontWeight: "600" },
  card: { width: "100%", backgroundColor: "#2a2a2a", padding: 20, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
  input: { backgroundColor: "#3b3b3b", color: "#fff", paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  loginBtn: { backgroundColor: "#FF7043", paddingVertical: 14, borderRadius: 10, marginBottom: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 18 },
  signUpText: { color: "#ccc", textAlign: "center", fontSize: 15 },
  signUpLink: { color: "#FF7043", fontWeight: "bold", fontSize: 16 },
});
