import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Connect",
    description:
      "Stay connected with Consolatrix College of Toledo City Inc. Receive important updates anytime, anywhere.",
    icon: "groups",
  },
  {
    id: "2",
    title: "Convenience",
    description:
      "No more long lines — request, track, and manage registrar documents in just a few taps.",
    icon: "event-note",
  },
  {
    id: "3",
    title: "Future Ready",
    description:
      "Empowering students with a smarter, faster, and hassle-free registrar system.",
    icon: "school",
  },
];

export default function Index() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Floating animations
  const floatAnims = Array(5)
    .fill(0)
    .map(() => useRef(new Animated.Value(0)).current);

  // Firebase auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  // Floating icon animation
  useEffect(() => {
    const createFloatAnimation = (anim, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -15,
            duration: 3000,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );

    const animations = floatAnims.map((anim, i) =>
      createFloatAnimation(anim, i * 500)
    );
    animations.forEach((anim) => anim.start());
    return () => animations.forEach((anim) => anim.stop());
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7043" />
      </View>
    );
  }

  // Handle Next
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      goToApp();
    }
  };

  // Handle Skip / Get Started
  const goToApp = () => {
    if (user) {
      router.replace("/home");
    } else {
      router.push("/auth/SignIn");
    }
  };

  const renderItem = ({ item }) => (
  <View style={[styles.slide, { width, marginTop: 100, alignItems: 'center' }]}>
    <MaterialIcons name={item.icon} size={200} marginBottom={10}color="#FF7043" />
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.subtitle}>{item.description}</Text>
  </View>
);



  return (
    <View style={styles.container}>
      {/* Floating Background Icons */}
      <Animated.View
        style={[
          styles.floatingIcon,
          { top: 100, left: 40, transform: [{ translateY: floatAnims[0] }] },
        ]}
      >
        <MaterialIcons name="assignment" size={80} color="#FF7043AA" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { top: 200, right: 20, transform: [{ translateY: floatAnims[1] }] },
        ]}
      >
        <MaterialIcons name="event" size={70} color="#FF7043AA" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { bottom: 150, left: 70, transform: [{ translateY: floatAnims[2] }] },
        ]}
      >
        <MaterialIcons name="chat" size={65} color="#FF7043AA" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { bottom: 100, right: 80, transform: [{ translateY: floatAnims[3] }] },
        ]}
      >
        <MaterialIcons name="school" size={85} color="#FF7043AA" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { top: 90, right: 120, transform: [{ translateY: floatAnims[4] }] },
        ]}
      >
        <MaterialIcons name="cloud" size={75} color="#FF7043AA" />
      </Animated.View>

      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id + index}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        ref={flatListRef}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        extraData={currentIndex}
      />

      {/* Indicators */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === currentIndex ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity onPress={goToApp}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    
  },
  floatingIcon: {
    position: "absolute",
    opacity: 0.25,
    
    
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FF7043",
    marginTop: 0,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#ddd",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    marginVertical: 20,
    alignSelf: "center",
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#FF7043",
    marginHorizontal: 5,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginBottom: 40,
    alignSelf: "center",
  },
  skip: {
    fontSize: 18,
    color: "#ddd",
  },
  nextBtn: {
    backgroundColor: "#FF7043",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
