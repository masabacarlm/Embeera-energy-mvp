import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  MenuItem,
  Select,
  TextField
} from "@mui/material";

const API_BASE_URL = "http://localhost:5000";
const SEEDED_USER_ID = 1;
const SEEDED_GROUP_ID = 1;

const HOUSEHOLD_PROFILE = {
  name: "Amina Nakato",
  location: "Mukono",
  phone: "+256 772 123 456",
  householdSize: "5 people",
  cookingGoal: "LPG Stove and Cylinder"
};

const OLUGANDA_GROUPS = [
  {
    id: 1,
    name: "Mukono Clean Cooking Group",
    location: "Mukono",
    members: 18,
    meetingDay: "Saturday",
    description: "Households saving together toward LPG starter kits."
  },
  {
    id: 2,
    name: "Seeta LPG Savings Circle",
    location: "Seeta",
    members: 12,
    meetingDay: "Wednesday",
    description: "Neighbourhood savings circle for families moving to clean cooking."
  }
];

const LEARNING_TOPICS = [
  "Benefits of LPG",
  "LPG Safety Tips",
  "Clean Cooking Transition Checklist"
];

const PAYMENT_METHODS = ["MTN MoMo", "Airtel Money"];

const formatCurrency = (value) => `UGX ${Number(value || 0).toLocaleString()}`;

function statusColor(status) {
  if (!status) return "default";
  const normalized = String(status).toLowerCase();
  if (normalized.includes("eligible") || normalized.includes("ready") || normalized.includes("complete")) {
    return "success";
  }
  if (normalized.includes("pending") || normalized.includes("request")) {
    return "warning";
  }
  return "default";
}

function MessageAlert({ message, type }) {
  if (!message) return null;

  return (
    <Alert severity={type === "success" ? "success" : "error"} className="mt-3 py-1">
      {message}
    </Alert>
  );
}

export default function App() {
  const [activeUserId, setActiveUserId] = useState(SEEDED_USER_ID);
  const [activeGroupId, setActiveGroupId] = useState(SEEDED_GROUP_ID);
  const [savings, setSavings] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [adminOverview, setAdminOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [amount, setAmount] = useState("25000");
  const [paymentMethod, setPaymentMethod] = useState("MTN MoMo");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMessageType, setPaymentMessageType] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [fullName, setFullName] = useState(HOUSEHOLD_PROFILE.name);
  const [phoneNumber, setPhoneNumber] = useState("0772123456");
  const [location, setLocation] = useState(HOUSEHOLD_PROFILE.location);
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
  const activeGroup = OLUGANDA_GROUPS.find((group) => group.id === activeGroupId);
  const rewardRequirements = rewards?.certificate_requirements || {};
  const completedTopicCount = rewardRequirements.completed_topics ?? completedTopics.length;
  const savingsProgress = Math.min(Number(savings?.progress_percentage ?? 0), 100);
  const savingsComplete = rewardRequirements.savings_target_reached ?? savingsProgress >= 100;
  const learningComplete =
    rewardRequirements.learning_completed ?? completedTopicCount === LEARNING_TOPICS.length;
  const deliveryRequested =
    rewardRequirements.delivery_requested ?? deliveryStatus !== "Not requested";
  const certificateReady =
    rewardRequirements.certificate_ready ?? (savingsComplete && learningComplete && deliveryRequested);
  const certificateStatus = rewards?.certificate_status || "Not Eligible";

  const certificateChecklist = useMemo(
    () => [
      { label: "Savings target reached", completed: savingsComplete },
      { label: "Learning completed", completed: learningComplete },
      { label: "LPG delivery requested", completed: deliveryRequested },
      { label: "Certificate ready", completed: certificateReady }
    ],
    [certificateReady, deliveryRequested, learningComplete, savingsComplete]
  );

  const adminSummaryCards = [
    { label: "Households", value: adminOverview?.total_households ?? "-" },
    { label: "Oluganda Circles", value: adminOverview?.active_groups ?? "-" },
    { label: "Savings recorded", value: formatCurrency(adminOverview?.total_savings) },
    { label: "Pending deliveries", value: adminOverview?.pending_deliveries ?? "-" },
    { label: "Certificates issued", value: adminOverview?.certificates_issued ?? "-" },
    { label: "Active ambassadors", value: adminOverview?.active_ambassadors ?? "-" }
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
        headers: { "Content-Type": "application/json" },
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
      setPaymentMessage(`Saved ${formatCurrency(paymentAmount)} with ${paymentMethod}.`);
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
    setAmount("25000");
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
      setRefreshMessage("Amina Nakato profile refreshed.");
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg app-navbar">
        <div className="container">
          <a className="navbar-brand" href="#dashboard">Embeera Energy</a>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <Chip label={HOUSEHOLD_PROFILE.location} size="small" className="nav-chip" />
            <Button variant="outlined" size="small" onClick={handleRefreshSeededData}>
              Refresh profile
            </Button>
          </div>
        </div>
      </nav>

      <main id="dashboard" className="container py-4 py-lg-5">
        <section className="dashboard-intro mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <p className="section-kicker mb-2">Household clean-energy savings</p>
              <h1 className="mb-2">Amina Nakato's LPG savings dashboard</h1>
              <p className="intro-copy mb-0">
                Track savings, group activity, learning progress, rewards, and LPG delivery for a Mukono household.
              </p>
            </div>
            <div className="col-lg-4">
              <Card className="profile-card">
                <CardContent>
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <p className="eyebrow mb-1">Current household</p>
                      <h2 className="card-heading mb-1">{HOUSEHOLD_PROFILE.name}</h2>
                      <p className="muted-text mb-0">{HOUSEHOLD_PROFILE.location}</p>
                    </div>
                    <Chip label={`User ${activeUserId}`} size="small" />
                  </div>
                  <div className="profile-grid">
                    <span>Phone</span>
                    <strong>{HOUSEHOLD_PROFILE.phone}</strong>
                    <span>Family size</span>
                    <strong>{HOUSEHOLD_PROFILE.householdSize}</strong>
                    <span>Active circle</span>
                    <strong>{activeGroup?.name || "Not joined"}</strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {loading && <Alert severity="info" className="mb-4">Loading dashboard records from the backend.</Alert>}
        {errorMessage && <Alert severity="error" className="mb-4">{errorMessage}</Alert>}
        {refreshMessage && <Alert severity="success" className="mb-4">{refreshMessage}</Alert>}

        <div className="row g-4">
          <div className="col-lg-8">
            <Card className="section-card h-100">
              <CardContent>
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                  <div>
                    <p className="eyebrow mb-1">Savings progress</p>
                    <h2 className="card-heading mb-0">{formatCurrency(savings?.amount_saved)} saved</h2>
                  </div>
                  <Chip
                    label={`${Math.round(savingsProgress)}% complete`}
                    color={savingsProgress >= 100 ? "success" : "primary"}
                    variant="outlined"
                  />
                </div>
                <LinearProgress variant="determinate" value={savingsProgress} className="progress-bar" />
                <div className="row g-3 mt-3">
                  <div className="col-sm-4">
                    <div className="metric-box">
                      <span>Target</span>
                      <strong>{formatCurrency(savings?.savings_target)}</strong>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="metric-box">
                      <span>Remaining</span>
                      <strong>{formatCurrency(savings?.remaining_amount)}</strong>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="metric-box">
                      <span>Goal item</span>
                      <strong>{HOUSEHOLD_PROFILE.cookingGoal}</strong>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-lg-4">
            <Card className="section-card h-100">
              <CardContent>
                <p className="eyebrow mb-1">Registration</p>
                <h2 className="card-heading mb-3">Household record</h2>
                <div className="form-stack">
                  <TextField label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} fullWidth size="small" />
                  <TextField label="Phone number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} fullWidth size="small" />
                  <TextField label="Location" value={location} onChange={(event) => setLocation(event.target.value)} fullWidth size="small" />
                  <Button variant="contained" onClick={handleRegister} disabled={registering}>
                    {registering ? "Registering..." : "Register household"}
                  </Button>
                </div>
                <MessageAlert message={registrationMessage} type={registrationMessageType} />
              </CardContent>
            </Card>
          </div>

          <div className="col-lg-5">
            <Card className="section-card h-100">
              <CardContent>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <div>
                    <p className="eyebrow mb-1">Oluganda Circle</p>
                    <h2 className="card-heading mb-0">Join a savings group</h2>
                  </div>
                  <Chip label={activeGroup ? "Joined" : "Not joined"} color={activeGroup ? "success" : "default"} size="small" />
                </div>
                <div className="circle-list">
                  {OLUGANDA_GROUPS.map((group) => (
                    <button
                      type="button"
                      key={group.id}
                      className={`circle-option ${selectedGroupId === group.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setJoinMessage("");
                        setJoinMessageType("");
                      }}
                    >
                      <span>
                        <strong>{group.name}</strong>
                        <small>{group.description}</small>
                      </span>
                      <em>{group.members} members</em>
                    </button>
                  ))}
                </div>
                <div className="group-meta mt-3">
                  <span>Meeting day: {selectedGroup?.meetingDay}</span>
                  <span>Location: {selectedGroup?.location}</span>
                </div>
                <Button className="mt-3" variant="contained" onClick={handleJoinGroup} disabled={joiningGroup}>
                  {joiningGroup ? "Joining..." : "Join selected circle"}
                </Button>
                <MessageAlert message={joinMessage} type={joinMessageType} />
              </CardContent>
            </Card>
          </div>

          <div className="col-lg-7">
            <Card className="section-card h-100">
              <CardContent>
                <p className="eyebrow mb-1">Save money</p>
                <h2 className="card-heading mb-3">Record a mobile money contribution</h2>
                <div className="row g-3 align-items-end">
                  <div className="col-md-5">
                    <TextField
                      label="Amount in UGX"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      fullWidth
                      size="small"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="select-label" htmlFor="payment-method">Payment option</label>
                    <Select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      fullWidth
                      size="small"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>{method}</MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="col-md-3 d-grid">
                    <Button variant="contained" onClick={handleSaveMoney} disabled={savingPayment}>
                      {savingPayment ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
                <div className="payment-note mt-3">
                  Money is linked to {selectedGroup?.name || "the selected circle"} for {HOUSEHOLD_PROFILE.cookingGoal}.
                </div>
                <MessageAlert message={paymentMessage} type={paymentMessageType} />
              </CardContent>
            </Card>
          </div>

          <div className="col-lg-6">
            <Card className="section-card h-100">
              <CardContent>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <div>
                    <p className="eyebrow mb-1">Learning checklist</p>
                    <h2 className="card-heading mb-0">Clean cooking readiness</h2>
                  </div>
                  <Chip label={`${completedTopicCount}/${LEARNING_TOPICS.length}`} variant="outlined" />
                </div>
                <div className="topic-list">
                  {LEARNING_TOPICS.map((topic) => {
                    const isCompleted = completedTopics.includes(topic);
                    const isSaving = savingTopic === topic;

                    return (
                      <button
                        type="button"
                        key={topic}
                        className={`topic-item ${isCompleted ? "complete" : ""}`}
                        onClick={() => handleCompleteTopic(topic)}
                        disabled={isSaving}
                      >
                        <span>{topic}</span>
                        <Chip
                          label={isSaving ? "Saving..." : isCompleted ? "Completed" : "Mark complete"}
                          color={isCompleted ? "success" : "default"}
                          size="small"
                        />
                      </button>
                    );
                  })}
                </div>
                <MessageAlert message={learningMessage} type={learningMessageType} />
              </CardContent>
            </Card>
          </div>

          <div className="col-lg-6">
            <Card className="section-card h-100">
              <CardContent>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <div>
                    <p className="eyebrow mb-1">Rewards</p>
                    <h2 className="card-heading mb-0">Enkola Certificate</h2>
                  </div>
                  <Chip label={certificateStatus} color={statusColor(certificateStatus)} />
                </div>
                <div className="reward-strip mb-3">
                  <span>Reward points</span>
                  <strong>{rewards?.reward_points ?? 0}</strong>
                </div>
                <div className="certificate-list">
                  {certificateChecklist.map((item) => (
                    <div key={item.label} className="certificate-row">
                      <span>{item.label}</span>
                      <Chip
                        label={item.completed ? "Done" : "Pending"}
                        color={item.completed ? "success" : "default"}
                        size="small"
                        variant={item.completed ? "filled" : "outlined"}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-lg-5">
            <Card className="section-card h-100">
              <CardContent>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <div>
                    <p className="eyebrow mb-1">LPG delivery tracking</p>
                    <h2 className="card-heading mb-0">{HOUSEHOLD_PROFILE.cookingGoal}</h2>
                  </div>
                  <Chip label={deliveryStatus} color={statusColor(deliveryStatus)} />
                </div>
                <div className="delivery-timeline">
                  <div className="timeline-step active">
                    <span>1</span>
                    <p>Savings and group details checked</p>
                  </div>
                  <div className={`timeline-step ${deliveryRequested ? "active" : ""}`}>
                    <span>2</span>
                    <p>Delivery request submitted for {selectedGroup?.location || "Mukono"}</p>
                  </div>
                  <div className="timeline-step">
                    <span>3</span>
                    <p>Field team confirms handover</p>
                  </div>
                </div>
                <Button variant="contained" onClick={handleRequestDelivery} disabled={requestingDelivery}>
                  {requestingDelivery ? "Requesting..." : "Request LPG delivery"}
                </Button>
                <MessageAlert message={deliveryMessage} type={deliveryMessageType} />
              </CardContent>
            </Card>
          </div>

          <div className="col-lg-7">
            <Card className="section-card h-100">
              <CardContent>
                <p className="eyebrow mb-1">Admin overview</p>
                <h2 className="card-heading mb-3">Operations snapshot</h2>
                <div className="row g-3">
                  {adminSummaryCards.map((item) => (
                    <div className="col-sm-6 col-xl-4" key={item.label}>
                      <div className="admin-metric">
                        <strong>{item.value}</strong>
                        <span>{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
