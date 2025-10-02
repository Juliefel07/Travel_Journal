import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Tutorial() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* HEADER */}
      <Text style={styles.header}>eRegistrar Tutorial</Text>
      <Text style={styles.subHeader}>
        Follow this step-by-step guide to learn how to use the system.
      </Text>

      {/* STEP 1: ADD DOCUMENT REQUEST */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>1. Add a Document Request</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/tutorial/home-sample.png")} // ⬅️ replace with your real screenshot
            style={styles.screenImage}
          />
          <Ionicons name="arrow-down-circle" size={36} color="#FF7043" style={styles.arrow} />
        </View>
        <Text style={styles.stepText}>
          Tap the <Text style={styles.highlight}>orange + button</Text> at the bottom center to open the form.
          Fill in all the required information carefully and submit your request. It will appear under the
          <Text style={styles.highlight}> Processing</Text> tab.
        </Text>
      </View>

      {/* STEP 2: PROCESSING STAGE */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>2. Check the Processing Tab</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/tutorial/processing-sample.png")}
            style={styles.screenImage}
          />
          <Ionicons name="arrow-down-circle" size={36} color="#FF7043" style={styles.arrow} />
        </View>
        <Text style={styles.stepText}>
          While the registrar reviews your request, you can monitor its status in the
          <Text style={styles.highlight}> Processing</Text> tab.
        </Text>
      </View>

      {/* STEP 3: TO RECEIVE */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>3. To Receive — When Approved</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/tutorial/to-receive-sample.png")}
            style={styles.screenImage}
          />
          <Ionicons name="arrow-down-circle" size={36} color="#FF7043" style={styles.arrow} />
        </View>
        <Text style={styles.stepText}>
          Once approved, your request will move to the
          <Text style={styles.highlight}> To Receive</Text> tab. A <Text style={styles.highlight}>Claim</Text> button 
          will appear beside your document.
        </Text>
      </View>

      {/* STEP 4: CLAIMING */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>4. Claim the Document</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/tutorial/claim-sample.png")}
            style={styles.screenImage}
          />
          <Ionicons name="arrow-down-circle" size={36} color="#FF7043" style={styles.arrow} />
        </View>
        <Text style={styles.stepText}>
          Tap the <Text style={styles.highlight}>Claim</Text> button after receiving your document. 
          The request will then move to the <Text style={styles.highlight}>Completed</Text> tab.
        </Text>
      </View>
 {/* STEP 5: ANNOUNCEMENTS */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>5. Completed</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/tutorial/completed-sample.png")}
            style={styles.screenImage}
          />
          <Ionicons name="arrow-down-circle" size={36} color="#FF7043" style={styles.arrow} />
        </View>
        <Text style={styles.stepText}>
         The request process has been completed.
         
        </Text>
      </View>

      {/* STEP 5: ANNOUNCEMENTS */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>6. Check for Registrar Announcements</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/tutorial/messages-sample.png")}
            style={styles.screenImage}
          />
          <Ionicons name="arrow-down-circle" size={36} color="#FF7043" style={styles.arrow} />
        </View>
        <Text style={styles.stepText}>
          All official announcements from the registrar will be posted in the
          <Text style={styles.highlight}> Messages</Text> tab. These are one-way messages — users cannot reply.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF7043",
    textAlign: "center",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: "#ffffffff",
    textAlign: "center",
    marginBottom: 30,
  },
  stepContainer: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#c6360eff",
    marginBottom: 10,
  },
  stepText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginTop: 10,
  },
  highlight: {
    fontWeight: "600",
    color: "#FF7043",
  },
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  screenImage: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  arrow: {
    marginTop: 8,
  },
});
