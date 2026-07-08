import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from "react-native";

const API_BASE_URL = "http://localhost:5000";
const SEEDED_USER_ID = 1;
const SEEDED_GROUP_ID = 1;
const OLUGANDA_GROUPS = [
  {
    id: 1,
    name: "Mukono Clean Cooking Group",
    location: "Mukono",
    description: "Members save together toward LPG stove and cylinder purchase."
  },
  {
    id: 2,
    name: "Seeta LPG Savings Circle",
    location: "Seeta",
    description: "A simple savings circle for households preparing to switch to LPG."
  }
];
const LEARNING_TOPICS = [
  "Benefits of LPG",
  "LPG Safety Tips",
  "Clean Cooking Transition Checklist"
];
const formatCurrency = (value) =>
  Number(value || 0).toLocaleString();
export default function App() {
  const [activeUserId, setActiveUserId] = useState(SEEDED_USER_ID);
  const [activeGroupId, setActiveGroupId] = useState(SEEDED_GROUP_ID);
  const [savings, setSavings] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [adminOverview, setAdminOverview] = useState(null);
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
  const [selectedGroupId, setSelectedGroupId] = useState(SEEDED_GROUP_ID);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinMessageType, setJoinMessageType] = useState("");
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [learningMessage, setLearningMessage] = useState("");
  const [learningMessageType, setLearningMessageType] = useState("");
  const [savingTopic, setSavingTopic] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");

  const selectedGroup = OLUGANDA_GROUPS.find((group) => group.id === selectedGroupId);
  const rewardRequirements = rewards?.certificate_requirements || {};
  const completedTopicCount =
    rewardRequirements.completed_topics ?? completedTopics.length;
  const savingsProgress = Number(savings?.progress_percentage ?? 0);
  const savingsComplete =
    rewardRequirements.savings_target_reached ?? savingsProgress >= 100;
  const learningComplete =
    rewardRequirements.learning_completed ??
    completedTopicCount === LEARNING_TOPICS.length;
  const deliveryRequested =
    rewardRequirements.delivery_requested ?? deliveryStatus !== "Not requested";
  const certificateReady =
    rewardRequirements.certificate_ready ??
    (savingsComplete && learningComplete && deliveryRequested);
  const certificateStatus = rewards?.certificate_status || "Not Eligible";
  const certificateChecklist = [
    {
      label: "Savings target reached",
      completed: savingsComplete
    },
    {
      label: "Learning completed",
      completed: learningComplete
    },
    {
      label: "LPG delivery requested",
      completed: deliveryRequested
    },
    {
      label: "Certificate ready",
      completed: certificateReady
    }
  ];
  const adminSummaryCards = [
    {
      label: "Total households",
      value: adminOverview?.total_households ?? "-"
    },
    {
      label: "Active Oluganda Circles",
      value: adminOverview?.active_groups ?? "-"
    },
    {
      label: "Total savings recorded",
      value: `UGX ${formatCurrency(adminOverview?.total_savings)}`
    },
    {
      label: "Pending deliveries",
      value: adminOverview?.pending_deliveries ?? "-"
    },
    {
      label: "Certificates issued",
      value: adminOverview?.certificates_issued ?? "-"
    },
    {
      label: "Active ambassadors",
      value: adminOverview?.active_ambassadors ?? "-"
    }
  ];

  const loadSavingsProgress = async (userId = activeUserId) => {
    const savingsResponse = await fetch(`${API_BASE_URL}/api/savings/progress/${userId}`);

    if (!savingsResponse.ok) {
      setSavings(null);
      throw new Error("Could not load savings progress.");
    }

    const savingsData = await savingsResponse.json();
    setSavings(savingsData);
  };

  const loadRewards = async (userId = activeUserId) => {
    const rewardsResponse = await fetch(`${API_BASE_URL}/api/rewards/${userId}`);

    if (rewardsResponse.ok) {
      const rewardsData = await rewardsResponse.json();
      setRewards(rewardsData);
    }
  };

  const loadAdminOverview = async () => {
    const adminResponse = await fetch(`${API_BASE_URL}/api/admin/overview`);

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      setAdminOverview(adminData);
    }
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        await loadSavingsProgress();
        await loadRewards();
        await loadAdminOverview();
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
    const groupIdForPayment = selectedGroupId;

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setPaymentMessageType("error");
      setPaymentMessage("Enter an amount greater than 0.");
      return;
    }

    if (!activeGroupId || activeGroupId !== selectedGroupId) {
      setPaymentMessageType("error");
      setPaymentMessage("Join the selected Oluganda Circle before saving money.");
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
          user_id: activeUserId,
          group_id: groupIdForPayment,
          amount: paymentAmount,
          payment_method: paymentMethod
        })
      });

      const paymentData = await paymentResponse.json().catch(() => ({}));

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Payment failed.");
      }

      await loadSavingsProgress(activeUserId);
      await loadRewards(activeUserId).catch(() => {});
      await loadAdminOverview().catch(() => {});
      setPaymentMessageType("success");
      setPaymentMessage(`Saved UGX ${paymentAmount.toLocaleString()} with ${paymentMethod}.`);
    } catch (error) {
      setPaymentMessageType("error");
      setPaymentMessage(error.message || "Payment failed. Make sure backend is running.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleRefreshSeededData = async () => {
    setActiveUserId(SEEDED_USER_ID);
    setActiveGroupId(SEEDED_GROUP_ID);
    setRegistrationMessage("");
    setRegistrationMessageType("");
    setSelectedGroupId(SEEDED_GROUP_ID);
    setJoinMessage("");
    setJoinMessageType("");
    setAmount("");
    setPaymentMethod("MTN MoMo");
    setPaymentMessage("");
    setPaymentMessageType("");
    setCompletedTopics([]);
    setLearningMessage("");
    setLearningMessageType("");
    setSavingTopic("");
    setDeliveryStatus("Not requested");
    setDeliveryMessage("");
    setDeliveryMessageType("");
    setErrorMessage("");
    setRefreshMessage("");
    setLoading(true);

    try {
      await loadSavingsProgress(SEEDED_USER_ID);
      await loadRewards(SEEDED_USER_ID);
      await loadAdminOverview();
      setRefreshMessage("Seeded household view refreshed.");
    } catch (error) {
      setErrorMessage("Could not connect to backend. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
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
          location,
          user_type: "household"
        })
      });

      const registrationData = await registrationResponse.json().catch(() => ({}));

      if (!registrationResponse.ok) {
        throw new Error(registrationData.message || "Registration failed.");
      }

      setRegistrationMessageType("success");
      setRegistrationMessage("Registration successful. You can now join an Oluganda Circle.");
      setActiveUserId(registrationData.user.user_id);
      setActiveGroupId(null);
      setSavings(null);
      setRewards(null);
      setCompletedTopics([]);
      setDeliveryStatus("Not requested");
      setFullName("");
      setPhoneNumber("");
      setLocation("");
      await loadAdminOverview().catch(() => {});
    } catch (error) {
      setRegistrationMessageType("error");
      setRegistrationMessage(error.message || "Registration failed. Make sure backend is running.");
    } finally {
      setRegistering(false);
    }
  };

  const handleRequestDelivery = async () => {
    const groupIdForDelivery = selectedGroupId;

    if (!activeGroupId || activeGroupId !== selectedGroupId) {
      setDeliveryMessageType("error");
      setDeliveryMessage("Join the selected Oluganda Circle before requesting delivery.");
      return;
    }

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
          user_id: activeUserId,
          group_id: groupIdForDelivery,
          item_name: "LPG Stove and Cylinder",
          delivery_location: selectedGroup?.location || "Mukono"
        })
      });

      const deliveryData = await deliveryResponse.json().catch(() => ({}));

      if (!deliveryResponse.ok) {
        throw new Error(deliveryData.message || "Delivery request failed.");
      }

      setDeliveryStatus(deliveryData.delivery_status || deliveryData.status || "Pending");
      await loadRewards(activeUserId).catch(() => {});
      await loadAdminOverview().catch(() => {});
      setDeliveryMessageType("success");
      setDeliveryMessage(deliveryData.message || "LPG delivery request sent.");
    } catch (error) {
      setDeliveryMessageType("error");
      setDeliveryMessage(error.message || "Delivery request failed. Make sure backend is running.");
    } finally {
      setRequestingDelivery(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!selectedGroupId) {
      setJoinMessageType("error");
      setJoinMessage("Choose an Oluganda Circle before joining.");
      return;
    }

    setJoiningGroup(true);
    setJoinMessage("");
    setJoinMessageType("");

    try {
      const joinResponse = await fetch(`${API_BASE_URL}/api/groups/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: activeUserId,
          group_id: selectedGroupId
        })
      });

      const joinData = await joinResponse.json().catch(() => ({}));

      if (!joinResponse.ok) {
        throw new Error(joinData.message || "Could not join group.");
      }

      setActiveGroupId(selectedGroupId);
      await loadSavingsProgress(activeUserId).catch(() => {});
      await loadRewards(activeUserId).catch(() => {});
      await loadAdminOverview().catch(() => {});
      setJoinMessageType("success");
      setJoinMessage(joinData.message || `Joined ${selectedGroup?.name || "Oluganda Circle"} successfully.`);
    } catch (error) {
      setJoinMessageType("error");
      setJoinMessage(error.message || "Could not join group. Make sure backend is running.");
    } finally {
      setJoiningGroup(false);
    }
  };

  const handleCompleteTopic = async (topicName) => {
    setSavingTopic(topicName);
    setLearningMessage("");
    setLearningMessageType("");

    try {
      const learningResponse = await fetch(`${API_BASE_URL}/api/learning/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: activeUserId,
          topic_name: topicName,
          completion_status: "completed"
        })
      });

      const learningData = await learningResponse.json().catch(() => ({}));

      if (!learningResponse.ok) {
        throw new Error(learningData.message || "Could not update learning progress.");
      }

      const topicAlreadyCompleted = completedTopics.includes(topicName);
      const nextCompletedTopicCount = topicAlreadyCompleted ? completedTopicCount : completedTopicCount + 1;

      setCompletedTopics((currentTopics) =>
        currentTopics.includes(topicName) ? currentTopics : [...currentTopics, topicName]
      );
      setLearningMessageType("success");
      setLearningMessage(
        nextCompletedTopicCount === LEARNING_TOPICS.length
          ? `Learning completed. ${nextCompletedTopicCount} of ${LEARNING_TOPICS.length} topics completed.`
          : `${topicName} completed. ${nextCompletedTopicCount} of ${LEARNING_TOPICS.length} topics completed.`
      );
      await loadRewards(activeUserId).catch(() => {});
    } catch (error) {
      setLearningMessageType("error");
      setLearningMessage(error.message || "Could not update learning progress. Make sure backend is running.");
    } finally {
      setSavingTopic("");
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
        <TouchableOpacity style={styles.resetButton} onPress={handleRefreshSeededData}>
          <Text style={styles.resetButtonText}>Refresh Seeded Household</Text>
        </TouchableOpacity>
        {refreshMessage !== "" && (
          <Text style={styles.resetMessage}>{refreshMessage}</Text>
        )}
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
        <Text style={styles.cardTitle}>User Registration</Text>
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
        <Text>Active User ID: {activeUserId}</Text>
        <Text>Amount Saved: UGX {formatCurrency(savings?.amount_saved)}</Text>
        <Text>Savings Target: UGX {formatCurrency(savings?.savings_target)}</Text>
        <Text>Progress: {savings?.progress_percentage ?? 0}%</Text>
        <Text>Remaining: UGX {formatCurrency(savings?.remaining_amount)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Oluganda Circle Joining</Text>
        <Text style={styles.label}>Choose a group</Text>
        <View style={styles.groupList}>
          {OLUGANDA_GROUPS.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupOption,
                selectedGroupId === group.id && styles.groupOptionSelected
              ]}
              onPress={() => {
                setSelectedGroupId(group.id);
                setJoinMessage("");
                setJoinMessageType("");
              }}
            >
              <Text
                style={[
                  styles.groupOptionTitle,
                  selectedGroupId === group.id && styles.groupOptionTitleSelected
                ]}
              >
                {group.name}
              </Text>
              <Text
                style={[
                  styles.groupOptionText,
                  selectedGroupId === group.id && styles.groupOptionTextSelected
                ]}
              >
                {group.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, joiningGroup && styles.saveButtonDisabled]}
          onPress={handleJoinGroup}
          disabled={joiningGroup}
        >
          <Text style={styles.saveButtonText}>
            {joiningGroup ? "Joining..." : "Join Group"}
          </Text>
        </TouchableOpacity>

        {joinMessage !== "" && (
          <Text style={joinMessageType === "success" ? styles.success : styles.paymentError}>
            {joinMessage}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Save Money</Text>
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
        <Text style={styles.progressText}>
          {completedTopicCount} of {LEARNING_TOPICS.length} topics completed
        </Text>
        <View style={styles.topicList}>
          {LEARNING_TOPICS.map((topic) => {
            const isCompleted = completedTopics.includes(topic);
            const isSaving = savingTopic === topic;

            return (
              <Pressable
                key={topic}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.topicButton,
                  isCompleted && styles.topicButtonCompleted,
                  isSaving && styles.topicButtonSaving,
                  pressed && !isSaving && styles.topicButtonPressed
                ]}
                onPress={() => handleCompleteTopic(topic)}
                disabled={isSaving}
              >
                <Text
                  style={[
                    styles.topicButtonText,
                    isCompleted && styles.topicButtonTextCompleted
                  ]}
                >
                  {isCompleted ? "[x]" : "[ ]"} {topic}
                </Text>
                <Text
                  style={[
                    styles.topicStatusText,
                    isCompleted && styles.topicButtonTextCompleted
                  ]}
                >
                  {isSaving ? "Saving..." : isCompleted ? "Completed" : "Mark Complete"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {learningMessage !== "" && (
          <Text style={learningMessageType === "success" ? styles.success : styles.paymentError}>
            {learningMessage}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rewards and Enkola Certificate</Text>
        <Text>Reward Points: {rewards?.reward_points ?? 0}</Text>
        <Text style={styles.certificateStatus}>Certificate Status: {certificateStatus}</Text>
        <View style={styles.checklist}>
          {certificateChecklist.map((item) => (
            <View key={item.label} style={styles.checklistItem}>
              <Text style={item.completed ? styles.checklistDone : styles.checklistPending}>
                {item.completed ? "[x]" : "[ ]"} {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>LPG Delivery Tracking</Text>
        <Text>Item: LPG Stove and Cylinder</Text>
        <Text>Location: {selectedGroup?.location || "Mukono"}</Text>
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Admin Overview</Text>
        <Text style={styles.adminNote}>
          Live MySQL summary for households, Oluganda Circles, savings, deliveries, ambassadors, and certificates.
        </Text>
        <View style={styles.adminSummaryGrid}>
          {adminSummaryCards.map((item) => (
            <View key={item.label} style={styles.adminSummaryCard}>
              <Text style={styles.adminSummaryValue}>{item.value}</Text>
              <Text style={styles.adminSummaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
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
  resetButton: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  resetButtonText: {
    color: "#006B8F",
    fontWeight: "bold"
  },
  resetMessage: {
    color: "#D7F7FF",
    fontWeight: "bold",
    marginTop: 8
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
  groupList: {
    gap: 10,
    marginBottom: 12
  },
  groupOption: {
    backgroundColor: "#F8FCFE",
    borderColor: "#B7DDE8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  groupOptionSelected: {
    backgroundColor: "#006B8F",
    borderColor: "#006B8F"
  },
  groupOptionTitle: {
    color: "#006B8F",
    fontWeight: "bold",
    marginBottom: 4
  },
  groupOptionTitleSelected: {
    color: "white"
  },
  groupOptionText: {
    color: "#24424A"
  },
  groupOptionTextSelected: {
    color: "#D7F7FF"
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
  },
  progressText: {
    color: "#24424A",
    fontWeight: "bold",
    marginBottom: 10
  },
  certificateStatus: {
    color: "#24424A",
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 10
  },
  checklist: {
    gap: 8
  },
  checklistItem: {
    backgroundColor: "#F8FCFE",
    borderColor: "#B7DDE8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10
  },
  checklistDone: {
    color: "#168A42",
    fontWeight: "bold"
  },
  checklistPending: {
    color: "#6A7A80",
    fontWeight: "bold"
  },
  topicList: {
    gap: 10,
    marginBottom: 10
  },
  topicButton: {
    backgroundColor: "#F8FCFE",
    borderColor: "#B7DDE8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    marginBottom: 2
  },
  topicButtonCompleted: {
    backgroundColor: "#168A42",
    borderColor: "#168A42"
  },
  topicButtonSaving: {
    backgroundColor: "#8AB99C",
    borderColor: "#8AB99C"
  },
  topicButtonPressed: {
    opacity: 0.75
  },
  topicButtonText: {
    color: "#006B8F",
    fontWeight: "bold",
    marginBottom: 4
  },
  topicButtonTextCompleted: {
    color: "white"
  },
  topicStatusText: {
    color: "#24424A"
  },
  adminNote: {
    color: "#24424A",
    marginBottom: 12
  },
  adminSummaryGrid: {
    gap: 10
  },
  adminSummaryCard: {
    backgroundColor: "#F8FCFE",
    borderColor: "#B7DDE8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  adminSummaryValue: {
    color: "#006B8F",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4
  },
  adminSummaryLabel: {
    color: "#24424A",
    fontWeight: "bold"
  }
});
