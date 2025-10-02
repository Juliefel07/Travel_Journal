import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF7043",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarShowLabel: false,  // Hide text labels
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-sharp" size={30} color={color} />
          ),
        }}
      />
        <Tabs.Screen
        name="Mail"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={30} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={31} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Tutorial"
        options={{
          href: null,   // ❌ Hides from tab bar
        }}
      />
    </Tabs>
  );
}
