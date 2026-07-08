import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

const API_BASE_URL = "http://localhost:5000";

export default function App() {
  const [savings, setSavings] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const savingsResponse = await fetch(`${API_BASE_URL}/api/savings/progress/1`);
        const rewardsResponse = await fetch(`${API_BASE_URL}/api/rewards/1`);

        const savingsData = await savingsResponse.json();
        const rewardsData = await rewardsResponse.json();

        setSavings(savingsData);
        setRewards(rewardsData);
      } catch (error) {
        setErrorMessage("Could not connect to backend. Make sure backend is running on port 5000.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Embeera Energy</Text>
        <Text style={styles.subtitle}>Saving Together. Living Better.</Text>
        <Text style={styles.headerText}>
          Community-powered clean energy savings for Ugandan households.
        </Text>
      </View>

      {loading && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loading</Text>
          <Text>Fetching data from backend...</Text>
        </View>
      )}

      {errorMessage !== "" && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Savings Progress</Text>
        <Text>Amount Saved: UGX {savings?.amount_saved ?? "80,000"}</Text>
        <Text>Savings Target: UGX {savings?.savings_target ?? "250,000"}</Text>
        <Text>Progress: {savings?.progress_percentage ?? "32"}%</Text>
        <Text>Remaining: UGX {savings?.remaining_amount ?? "170,000"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Oluganda Circle</Text>
        <Text>Group: Mukono Clean Cooking Group</Text>
        <Text>Members save together toward LPG stove and cylinder purchase.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mock Payment</Text>
        <Text>Payment Method: MTN MoMo / Airtel Money</Text>
        <Text>Sample Payment: UGX 10,000</Text>
        <Text style={styles.success}>Status: Successful</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learning and LPG Safety</Text>
        <Text>- Benefits of LPG</Text>
        <Text>- LPG safety tips</Text>
        <Text>- Clean cooking transition checklist</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rewards and Enkola Certificate</Text>
        <Text>Reward Points: {rewards?.reward_points ?? "120"}</Text>
        <Text>Certificate Status: {rewards?.certificate_status ?? "In Progress"}</Text>
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
  errorCard: {
    backgroundColor: "#FFF4F4",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFBDBD"
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#006B8F",
    marginBottom: 8
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B00020",
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