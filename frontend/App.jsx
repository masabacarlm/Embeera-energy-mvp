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
const SEEDED_GROUP_ID = 1;

const TEST_USERS = {
  admin: {
    label: "Admin",
    email: "masabacarl8@gmail.com",
    password: "admin123"
  },
  household: {
    label: "Household",
    email: "household@embeera.local",
    password: "household123"
  },
  ambassador: {
    label: "Ambassador",
    email: "ambassador@embeera.local",
    password: "ambassador123"
  }
};

const HOUSEHOLD_DEFAULTS = {
  phone: "0772123456",
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

function roleLabel(userType) {
  if (!userType) return "";
  return userType.charAt(0).toUpperCase() + userType.slice(1);
}

function MessageAlert({ message, type }) {
  if (!message) return null;

  return (
    <Alert severity={type === "success" ? "success" : "error"} className="mt-3 py-1">
      {message}
    </Alert>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const submitLogin = async (credentials = { email, password }) => {
    setLoggingIn(true);
    setLoginMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      onLogin(data.user);
    } catch (error) {
      setLoginMessage(error.message || "Could not connect to the backend on port 5000.");
    } finally {
      setLoggingIn(false);
    }
  };

  const quickLogin = (userType) => {
    const credentials = TEST_USERS[userType];
    setEmail(credentials.email);
    setPassword(credentials.password);
    submitLogin(credentials);
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <p className="section-kicker mb-2">Embeera Energy</p>
          <h1>Clean-energy savings system</h1>
          <p>
            Sign in as an operations admin, household member, or community ambassador to see the right workspace.
          </p>
        </div>

        <Card className="login-card">
          <CardContent>
            <h2 className="card-heading mb-3">Login</h2>
            <div className="form-stack">
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                size="small"
              />
              <Button variant="contained" onClick={() => submitLogin()} disabled={loggingIn}>
                {loggingIn ? "Logging in..." : "Login"}
              </Button>
            </div>

            <div className="quick-login">
              {Object.entries(TEST_USERS).map(([key, user]) => (
                <Button key={key} variant="outlined" size="small" onClick={() => quickLogin(key)}>
                  {user.label}
                </Button>
              ))}
            </div>

            <MessageAlert message={loginMessage} type="error" />

            <div className="credentials-list mt-4">
              <p className="eyebrow mb-2">Test credentials</p>
              {Object.entries(TEST_USERS).map(([key, user]) => (
                <div key={key} className="credential-row">
                  <strong>{user.label}</strong>
                  <span>{user.email}</span>
                  <span>{user.password}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(SEEDED_GROUP_ID);
  const [savings, setSavings] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [adminOverview, setAdminOverview] = useState(null);
  const [ambassadorOverview, setAmbassadorOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [amount, setAmount] = useState("25000");
  const [paymentMethod, setPaymentMethod] = useState("MTN MoMo");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMessageType, setPaymentMessageType] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(HOUSEHOLD_DEFAULTS.phone);
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

  const activeUserId = currentUser?.user_id;
  const isHousehold = currentUser?.user_type === "household";
  const isAdmin = currentUser?.user_type === "admin";
  const isAmbassador = currentUser?.user_type === "ambassador";
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
    { label: "Total households", value: adminOverview?.total_households ?? "-" },
    { label: "Active Oluganda Circles", value: adminOverview?.active_groups ?? "-" },
    { label: "Total savings", value: formatCurrency(adminOverview?.total_savings) },
    { label: "Pending deliveries", value: adminOverview?.pending_deliveries ?? "-" },
    { label: "Certificates issued", value: adminOverview?.certificates_issued ?? "-" },
    { label: "Active ambassadors", value: adminOverview?.active_ambassadors ?? "-" }
  ];

  const ambassadorSummaryCards = [
    { label: "Assigned location", value: ambassadorOverview?.assigned_location || currentUser?.location || "-" },
    { label: "Referrals count", value: ambassadorOverview?.referrals_count ?? "-" },
    { label: "Supported households", value: ambassadorOverview?.supported_households ?? "-" },
    { label: "Joined circles", value: ambassadorOverview?.households_in_circles ?? "-" },
    { label: "Started saving", value: ambassadorOverview?.households_saving ?? "-" }
  ];

  const loadSavingsProgress = async (userId = activeUserId) => {
    const savingsResponse = await fetch(`${API_BASE_URL}/api/savings/progress/${userId}`);

    if (!savingsResponse.ok) {
      setSavings(null);
      throw new Error("Could not load savings progress.");
    }

    const savingsData = await savingsResponse.json();
    setSavings(savingsData);
    setActiveGroupId(savingsData.group_id || null);
    setSelectedGroupId(savingsData.group_id || SEEDED_GROUP_ID);
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

  const loadAmbassadorOverview = async (userId = activeUserId) => {
    const ambassadorResponse = await fetch(`${API_BASE_URL}/api/admin/ambassador/${userId}`);

    if (ambassadorResponse.ok) {
      const ambassadorData = await ambassadorResponse.json();
      setAmbassadorOverview(ambassadorData);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    setFullName(currentUser.full_name || "");
    setPhoneNumber(currentUser.phone_number || HOUSEHOLD_DEFAULTS.phone);
    setLocation(currentUser.location || "");
    setErrorMessage("");
    setLoading(true);

    async function loadRoleData() {
      try {
        if (currentUser.user_type === "household") {
          await loadSavingsProgress(currentUser.user_id);
          await loadRewards(currentUser.user_id);
        }

        if (currentUser.user_type === "admin") {
          await loadAdminOverview();
        }

        if (currentUser.user_type === "ambassador") {
          await loadAmbassadorOverview(currentUser.user_id);
        }
      } catch (error) {
        setErrorMessage("Could not connect to backend. Make sure backend is running on port 5000.");
      } finally {
        setLoading(false);
      }
    }

    loadRoleData();
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setSavings(null);
    setRewards(null);
    setAdminOverview(null);
    setAmbassadorOverview(null);
    setCompletedTopics([]);
    setDeliveryStatus("Not requested");
    setPaymentMessage("");
    setRegistrationMessage("");
    setJoinMessage("");
    setLearningMessage("");
    setDeliveryMessage("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavings(null);
    setRewards(null);
    setAdminOverview(null);
    setAmbassadorOverview(null);
    setErrorMessage("");
  };

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
      setPaymentMessageType("success");
      setPaymentMessage(`Saved ${formatCurrency(paymentAmount)} with ${paymentMethod}.`);
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
      setRegistrationMessage("Household record saved. You can now join an Oluganda Circle.");
      setCurrentUser({
        ...currentUser,
        user_id: registrationData.user.user_id,
        full_name: registrationData.user.full_name,
        phone_number: registrationData.user.phone_number,
        location: registrationData.user.location,
        user_type: "household"
      });
      setActiveGroupId(null);
      setSavings(null);
      setRewards(null);
      setCompletedTopics([]);
      setDeliveryStatus("Not requested");
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
          item_name: HOUSEHOLD_DEFAULTS.cookingGoal,
          delivery_location: selectedGroup?.location || currentUser.location || "Mukono"
        })
      });

      const deliveryData = await deliveryResponse.json().catch(() => ({}));

      if (!deliveryResponse.ok) {
        throw new Error(deliveryData.message || "Delivery request failed.");
      }

      setDeliveryStatus(deliveryData.delivery_status || deliveryData.status || "Pending");
      await loadRewards(activeUserId).catch(() => {});
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

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg app-navbar">
        <div className="container">
          <a className="navbar-brand" href="#dashboard">Embeera Energy</a>
          <div className="d-flex align-items-center gap-2 ms-auto topbar-user">
            <Chip label={currentUser.full_name} size="small" className="nav-chip" />
            <Chip label={roleLabel(currentUser.user_type)} size="small" variant="outlined" />
            <Button variant="outlined" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main id="dashboard" className="container py-4 py-lg-5">
        {loading && <Alert severity="info" className="mb-4">Loading dashboard records from the backend.</Alert>}
        {errorMessage && <Alert severity="error" className="mb-4">{errorMessage}</Alert>}

        {isHousehold && (
          <>
            <section className="dashboard-intro mb-4">
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <p className="section-kicker mb-2">Household clean-energy savings</p>
                  <h1 className="mb-2">{currentUser.full_name}'s LPG savings dashboard</h1>
                  <p className="intro-copy mb-0">
                    Track savings, group activity, learning progress, rewards, and LPG delivery for this household.
                  </p>
                </div>
                <div className="col-lg-4">
                  <Card className="profile-card">
                    <CardContent>
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div>
                          <p className="eyebrow mb-1">Current household</p>
                          <h2 className="card-heading mb-1">{currentUser.full_name}</h2>
                          <p className="muted-text mb-0">{currentUser.location || "Location not set"}</p>
                        </div>
                        <Chip label={roleLabel(currentUser.user_type)} size="small" />
                      </div>
                      <div className="profile-grid">
                        <span>Email</span>
                        <strong>{currentUser.email}</strong>
                        <span>Phone</span>
                        <strong>{currentUser.phone_number || phoneNumber}</strong>
                        <span>Family size</span>
                        <strong>{HOUSEHOLD_DEFAULTS.householdSize}</strong>
                        <span>Active circle</span>
                        <strong>{activeGroup?.name || "Not joined"}</strong>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

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
                          <strong>{HOUSEHOLD_DEFAULTS.cookingGoal}</strong>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-lg-4">
                <Card className="section-card h-100">
                  <CardContent>
                    <p className="eyebrow mb-1">Registration and profile</p>
                    <h2 className="card-heading mb-3">Household record</h2>
                    <div className="form-stack">
                      <TextField label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} fullWidth size="small" />
                      <TextField label="Phone number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} fullWidth size="small" />
                      <TextField label="Location" value={location} onChange={(event) => setLocation(event.target.value)} fullWidth size="small" />
                      <Button variant="contained" onClick={handleRegister} disabled={registering}>
                        {registering ? "Saving..." : "Save household record"}
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
                      Money is linked to {selectedGroup?.name || "the selected circle"} for {HOUSEHOLD_DEFAULTS.cookingGoal}.
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
                        <p className="eyebrow mb-1">Learning and LPG safety</p>
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
                        <h2 className="card-heading mb-0">{HOUSEHOLD_DEFAULTS.cookingGoal}</h2>
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
                        <p>Delivery request submitted for {selectedGroup?.location || currentUser.location || "Mukono"}</p>
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
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <section className="dashboard-intro mb-4">
              <p className="section-kicker mb-2">Admin dashboard</p>
              <h1 className="mb-2">Operations overview</h1>
              <p className="intro-copy mb-0">
                Monitor household growth, savings activity, delivery work, certificates, and ambassador coverage.
              </p>
            </section>

            <div className="row g-4">
              {adminSummaryCards.map((item) => (
                <div className="col-sm-6 col-xl-4" key={item.label}>
                  <div className="admin-metric admin-metric-large">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}

              <div className="col-12">
                <Card className="section-card">
                  <CardContent>
                    <p className="eyebrow mb-1">Recent users</p>
                    <h2 className="card-heading mb-3">Latest account records</h2>
                    <div className="user-table">
                      {(adminOverview?.recent_users || []).map((user) => (
                        <div className="user-row" key={user.user_id}>
                          <strong>{user.full_name}</strong>
                          <span>{user.email || "No email"}</span>
                          <Chip label={roleLabel(user.user_type)} size="small" />
                          <span>{user.location || "Location not set"}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {isAmbassador && (
          <>
            <section className="dashboard-intro mb-4">
              <p className="section-kicker mb-2">Ambassador dashboard</p>
              <h1 className="mb-2">{currentUser.full_name}'s community support</h1>
              <p className="intro-copy mb-0">
                Track referrals, supported households, and clean-cooking transition progress in the assigned area.
              </p>
            </section>

            <div className="row g-4">
              {ambassadorSummaryCards.map((item) => (
                <div className="col-sm-6 col-xl-4" key={item.label}>
                  <div className="admin-metric admin-metric-large">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}

              <div className="col-lg-6">
                <Card className="section-card h-100">
                  <CardContent>
                    <p className="eyebrow mb-1">Community support notes</p>
                    <h2 className="card-heading mb-3">Current field priorities</h2>
                    <div className="topic-list">
                      {(ambassadorOverview?.community_support_notes || []).map((note) => (
                        <div className="support-note" key={note}>{note}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-lg-6">
                <Card className="section-card h-100">
                  <CardContent>
                    <p className="eyebrow mb-1">Household transition progress</p>
                    <h2 className="card-heading mb-3">Referral progress summary</h2>
                    <div className="certificate-list">
                      <div className="certificate-row">
                        <span>Referred households</span>
                        <Chip label={ambassadorOverview?.referrals_count ?? 0} color="primary" />
                      </div>
                      <div className="certificate-row">
                        <span>Joined Oluganda Circles</span>
                        <Chip label={ambassadorOverview?.households_in_circles ?? 0} color="success" />
                      </div>
                      <div className="certificate-row">
                        <span>Started saving</span>
                        <Chip label={ambassadorOverview?.households_saving ?? 0} color="success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
