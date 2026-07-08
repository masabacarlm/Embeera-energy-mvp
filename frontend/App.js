import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

const API_BASE_URL = "http://localhost:5000";
const DEMO_USER_ID = 1;
const DEMO_GROUP_ID = 1;

export default function App() {
  const [savings, setSavings] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [amount, setAmount] = useState("10000");
  const [paymentMethod, setPaymentMethod] = useState("MTN MoMo");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMessageType, setPaymentMessageType] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationMessageType, setRegistrationMessageType] = useState("");
  const [registering, setRegistering] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("Not requested");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryMessageType, setDeliveryMessageType] = useState("");
  const [requestingDelivery, setRequestingDelivery] = useState(false);

  const loadSavingsProgress = async () => {
    const savingsResponse = await fetch(`${API_BASE_URL}/api/savings/progress/${DEMO_USER_ID}`);

    if (!savingsResponse.ok) {
      throw new Error("Could not load savings progress.");
    }

    const savingsData = await savingsResponse.json();
    setSavings(savingsData);
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        await loadSavingsProgress();

        const rewardsResponse = await fetch(`${API_BASE_URL}/api/rewards/${DEMO_USER_ID}`);
        if (rewardsResponse.ok) {
          const rewardsData = await rewardsResponse.json();
          setRewards(rewardsData);
        }
      } catch (error) {
        setErrorMessage("Could not connect to backend. Make sure backend is running on port 5000.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleSaveMoney = async () => {
    const paymentAmount = Number(String(amount).replace(/,/g, "").trim());

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setPaymentMessageType("error");
      setPaymentMessage("Enter an amount greater than 0.");
      return;
    }

    setSavingPayment(true);
    setPaymentMessage("");
    setPaymentMessageType("");

    try {
      const paymentResponse = await fetch(`${API_BASE_URL}/api/payments/mock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          group_id: DEMO_GROUP_ID,
          amount: paymentAmount,
          payment_method: paymentMethod
        })
      });

      const paymentData = await paymentResponse.json().catch(() => ({}));

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Payment failed.");
      }

      await loadSavingsProgress();
      setPaymentMessageType("success");
      setPaymentMessage(`Saved UGX ${paymentAmount.toLocaleString()} with ${paymentMethod}.`);
    } catch (error) {
      setPaymentMessageType("error");
      setPaymentMessage(error.message || "Payment failed. Make sure backend is running.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !phoneNumber) {
      setRegistrationMessageType("error");
      setRegistrationMessage("Enter full name and phone number.");
      return;
    }

    setRegistering(true);
    setRegistrationMessage("");
    setRegistrationMessageType("");

    try {
      const registrationResponse = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phoneNumber,
          location
        })
      });

      const registrationData = await registrationResponse.json();

      if (!registrationResponse.ok) {
        throw new Error(registrationData.message || "Registration failed.");
      }

      setRegistrationMessageType("success");
      setRegistrationMessage("Registration successful.");
      setFullName("");
      setPhoneNumber("");
      setLocation("");
    } catch (error) {
      setRegistrationMessageType("error");
      setRegistrationMessage(error.message || "Registration failed. Make sure backend is running.");
    } finally {
      setRegistering(false);
    }
  };

  const handleRequestDelivery = async () => {
    setRequestingDelivery(true);
    setDeliveryMessage("");
    setDeliveryMessageType("");

    try {
      const deliveryResponse = await fetch(`${API_BASE_URL}/api/deliveries/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          group_id: DEMO_GROUP_ID,
          item_name: "LPG Stove and Cylinder",
          delivery_location: "Mukono"
        })
      });

      const deliveryData = await deliveryResponse.json();

      if (!deliveryResponse.ok) {
        throw new Error(deliveryData.message || "Delivery request failed.");
      }

      setDeliveryStatus(deliveryData.delivery_status || "Pending");
      setDeliveryMessageType("success");
      setDeliveryMessage(deliveryData.message || "LPG delivery request sent.");
    } catch (error) {
      setDeliveryMessageType("error");
      setDeliveryMessage(error.message || "Delivery request failed. Make sure backend is running.");
    } finally {
      setRequestingDelivery(false);
    }
  };

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
        <Text style={styles.cardTitle}>Household Registration</Text>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <TouchableOpacity
          style={[styles.saveButton, registering && styles.saveButtonDisabled]}
          onPress={handleRegister}
          disabled={registering}
        >
          <Text style={styles.saveButtonText}>
            {registering ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        {registrationMessage !== "" && (
          <Text style={registrationMessageType === "success" ? styles.success : styles.paymentError}>
            {registrationMessage}
          </Text>
        )}
      </View>

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
        <Text style={styles.label}>Amount to save</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount in UGX"
        />

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.methodRow}>
          {["MTN MoMo", "Airtel Money"].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.methodButton,
                paymentMethod === method && styles.methodButtonSelected
              ]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  paymentMethod === method && styles.methodButtonTextSelected
                ]}
              >
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, savingPayment && styles.saveButtonDisabled]}
          onPress={handleSaveMoney}
          disabled={savingPayment}
        >
          <Text style={styles.saveButtonText}>
            {savingPayment ? "Saving..." : "Save Money"}
          </Text>
        </TouchableOpacity>

        {paymentMessage !== "" && (
          <Text style={paymentMessageType === "success" ? styles.success : styles.paymentError}>
            {paymentMessage}
          </Text>
        )}
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
        <Text style={deliveryStatus === "Pending" ? styles.warning : styles.statusText}>
          Status: {deliveryStatus}
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, requestingDelivery && styles.saveButtonDisabled]}
          onPress={handleRequestDelivery}
          disabled={requestingDelivery}
        >
          <Text style={styles.saveButtonText}>
            {requestingDelivery ? "Requesting..." : "Request LPG Delivery"}
          </Text>
        </TouchableOpacity>

        {deliveryMessage !== "" && (
          <Text style={deliveryMessageType === "success" ? styles.success : styles.paymentError}>
            {deliveryMessage}
          </Text>
        )}
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
  label: {
    color: "#24424A",
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 6
  },
  input: {
    backgroundColor: "#F8FCFE",
    borderColor: "#B7DDE8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10
  },
  methodRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  methodButton: {
    borderColor: "#006B8F",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  methodButtonSelected: {
    backgroundColor: "#006B8F"
  },
  methodButtonText: {
    color: "#006B8F",
    fontWeight: "bold"
  },
  methodButtonTextSelected: {
    color: "white"
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#168A42",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10
  },
  saveButtonDisabled: {
    backgroundColor: "#8AB99C"
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold"
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
  paymentError: {
    color: "#B00020",
    fontWeight: "bold"
  },
  statusText: {
    color: "#24424A",
    fontWeight: "bold",
    marginBottom: 10
  },
  warning: {
    color: "#B36B00",
    fontWeight: "bold",
    marginBottom: 10
  }
});
