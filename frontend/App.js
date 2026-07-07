import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

export default function App() {
  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Embeera Energy</Text>
        <Text style={styles.subtitle}>Saving Together. Living Better.</Text>
        <Text style={styles.headerText}>
          Community-powered clean energy savings for Ugandan households.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Savings Progress</Text>
        <Text>Amount Saved: UGX 80,000</Text>
        <Text>Savings Target: UGX 250,000</Text>
        <Text>Progress: 32%</Text>
        <Text>Remaining: UGX 170,000</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Oluganda Circle</Text>
        <Text>Group: Mukono Clean Cooking Group</Text>
        <Text>Members save together toward LPG transition.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mock Payment</Text>
        <Text>Payment Method: MTN MoMo / Airtel Money</Text>
        <Text>Sample Payment: UGX 10,000</Text>
        <Text style={styles.success}>Status: Successful</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rewards and Enkola Certificate</Text>
        <Text>Reward Points: 120</Text>
        <Text>Certificate Status: In Progress</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>LPG Delivery Tracking</Text>
        <Text>Item: LPG Stove and Cylinder</Text>
        <Text>Location: Mukono</Text>
        <Text style={styles.warning}>Status: Pending</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4FBFF",
    padding: 24
  },
  header: {
    backgroundColor: "#006B8F",
    padding: 24,
    borderRadius: 18,
    marginBottom: 18
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6
  },
  subtitle: {
    fontSize: 18,
    color: "#D7F7FF",
    marginBottom: 10
  },
  headerText: {
    fontSize: 15,
    color: "white"
  },
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D6EEF7"
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#006B8F",
    marginBottom: 8
  },
  success: {
    color: "#168A42",
    fontWeight: "bold"
  },
  warning: {
    color: "#B36B00",
    fontWeight: "bold"
  }
});