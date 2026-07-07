import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const savingsProgress = 68;

const sections = [
  {
    title: "4. Oluganda Circle",
    label: "Mukono Clean Cooking Circle",
    body: "18 members are saving together toward LPG starter kits.",
    accent: "Circle savings: UGX 1,840,000"
  },
  {
    title: "5. Mock Payment",
    label: "Save with mobile money",
    body: "Demo payment of UGX 20,000 using MTN MoMo or Airtel Money.",
    accent: "Status: Successful demo transaction"
  },
  {
    title: "6. Learning and LPG Safety",
    label: "Beginner safety lessons",
    body: "Learn ventilation, cylinder storage, leak checks, and safe stove use.",
    accent: "3 of 5 lessons completed"
  },
  {
    title: "7. Rewards and Enkola Certificate",
    label: "Healthy home rewards",
    body: "Earn points for saving, learning, referrals, and safe LPG adoption.",
    accent: "Enkola Certificate: 70% complete"
  },
  {
    title: "8. LPG Delivery Tracking",
    label: "Starter kit delivery",
    body: "Track the LPG stove, cylinder, regulator, and safety card delivery.",
    accent: "Current stage: In transit to Mukono"
  }
];

export default function App() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.sectionNumber}>1. Welcome</Text>
        <Text style={styles.badge}>Embeera Energy MVP</Text>
        <Text style={styles.title}>Saving Together. Living Better.</Text>
        <Text style={styles.subtitle}>
          A simple Ugandan health-tech demo for clean cooking savings, learning,
          rewards, and LPG delivery support.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <InfoCard
        title="2. Registration Placeholder"
        label="Create household profile"
        body="Full name, phone number, district, household size, and preferred access method."
        accent="App and USSD support planned for wider access."
      />

      <View style={styles.dashboardCard}>
        <Text style={styles.sectionNumber}>3. Dashboard</Text>
        <Text style={styles.dashboardTitle}>Savings progress</Text>
        <Text style={styles.largeAmount}>UGX 170,000</Text>
        <Text style={styles.mutedText}>Target: UGX 250,000 for an LPG starter kit</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${savingsProgress}%` }]} />
        </View>

        <View style={styles.statsRow}>
          <SmallStat label="Progress" value={`${savingsProgress}%`} />
          <SmallStat label="Circle" value="Mukono" />
          <SmallStat label="Points" value="320" />
        </View>
      </View>

      {sections.map((section) => (
        <InfoCard
          key={section.title}
          title={section.title}
          label={section.label}
          body={section.body}
          accent={section.accent}
        />
      ))}
    </ScrollView>
  );
}

function InfoCard({ title, label, body, accent }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionNumber}>{title}</Text>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.bodyText}>{body}</Text>
      <Text style={styles.accentText}>{accent}</Text>
    </View>
  );
}

function SmallStat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F7FCFF"
  },
  content: {
    padding: 20,
    paddingBottom: 36
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D7EEF7"
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F8F7",
    color: "#007C7A",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14
  },
  title: {
    color: "#075C8E",
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 38,
    marginBottom: 10
  },
  subtitle: {
    color: "#486575",
    fontSize: 16,
    lineHeight: 24
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  primaryButton: {
    backgroundColor: "#087DB5",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15
  },
  secondaryButton: {
    backgroundColor: "#EAF7FB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  secondaryButtonText: {
    color: "#075C8E",
    fontWeight: "800",
    fontSize: 15
  },
  dashboardCard: {
    backgroundColor: "#075C8E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D7EEF7"
  },
  sectionNumber: {
    color: "#00A7A0",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
    textTransform: "uppercase"
  },
  cardTitle: {
    color: "#075C8E",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8
  },
  dashboardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8
  },
  largeAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 4
  },
  mutedText: {
    color: "#D8F1FA",
    fontSize: 15,
    lineHeight: 22
  },
  bodyText: {
    color: "#425F6F",
    fontSize: 15,
    lineHeight: 23
  },
  accentText: {
    color: "#007C7A",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12
  },
  progressTrack: {
    height: 12,
    backgroundColor: "#CDE8F3",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 18,
    marginBottom: 16
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1DD4C6",
    borderRadius: 999
  },
  statsRow: {
    flexDirection: "row",
    gap: 9
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12
  },
  statValue: {
    color: "#075C8E",
    fontSize: 18,
    fontWeight: "900"
  },
  statLabel: {
    color: "#557080",
    fontSize: 12,
    marginTop: 3
  }
});
