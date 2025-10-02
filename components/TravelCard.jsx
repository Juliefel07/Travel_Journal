
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function TravelCard({ entry }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: entry.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{entry.title}</Text>
      <Text style={styles.description}>{entry.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { margin: 10, padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  image: { width: '100%', height: 200, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  description: { fontSize: 14, color: '#555' },
});
