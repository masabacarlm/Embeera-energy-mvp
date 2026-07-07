import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";

export default function App() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Embeera Energy</Text>
      <Text style={styles.subtitle}>Saving Together. Living Better.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome Screen</Text>
        <Text>Register or login to start your clean energy savings journey.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dashboard</Text>
        <Text>Amount Saved: UGX 80,000</Text>
        <Text>Savings Target: UGX 250,000</Text>
        <Text>Progress: 32%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Oluganda Circle</Text>
        <Text>Group: Mukono Clean Cooking Group</Text>
        <Text>Members save together toward LPG transition.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mock Payment</Text>
        <Text>Payment Options: MTN MoMo and Airtel Money</Text>
        <Text>Status: Successful</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learning</Text>
        <Text>Topics: LPG safety, clean cooking benefits, transition checklist.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rewards</Text>
        <Text>Reward Points: 120</Text>
        <Text>Enkola Certificate: In Progress</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Tracking</Text>
        <Text>Item: LPG Stove and Cylinder</Text>
        <Text>Status: Pending</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F4FBFF"
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#006B8F",
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: "#0B7A75",
    marginBottom: 20
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D9EEF7"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#006B8F",
    marginBottom: 8
  }
});
