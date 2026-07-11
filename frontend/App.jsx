import React, { useEffect, useMemo, useRef, useState } from "react";
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
import apiClient from "./src/api/client.js";

const request = async (path, options = {}) => {
  try {
    const response = await apiClient.request({
      url: path.replace(/^\/api/, ""),
      method: options.method || "GET",
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers
    });
    return { ok: true, json: async () => response.data };
  } catch (error) {
    throw new Error(apiMessage(error.response?.data, "The request could not be completed."));
  }
};

const money = (value) => `UGX ${Number(value || 0).toLocaleString()}`;
const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});
const normalizedRole = (role) => (role === "household" ? "member" : role);
const apiMessage = (payload, fallback) =>
  payload?.message || payload?.errors?.[0] || fallback;
const safeApiErrorMessage = (message) => {
  if (typeof message !== "string" || !message.trim()) return "";
  const sensitiveDetails = /(?:sql|mysql|sequelize|stack|trace|environment|process\.env|\bat\s+\S+\s*\(|select\s+.+\s+from|insert\s+into)/i;
  return sensitiveDetails.test(message) ? "" : message.trim();
};
const apiData = (payload) => payload?.data || payload || {};
const roleLabel = (role) => {
  const currentRole = normalizedRole(role);
  return currentRole === "member" ? "Member" : currentRole ? currentRole[0].toUpperCase() + currentRole.slice(1) : "";
};

function Message({ text, type = "error" }) {
  if (!text) return null;
  return <Alert severity={type} className="mt-3 py-1">{text}</Alert>;
}

function PhaseTwoPreview() {
  const items = ["Real MTN MoMo", "Real Airtel Money", "SMS OTP", "USSD using *284*88#", "PDF Enkola Certificate", "Mobile application", "Audit logs", "Privacy controls", "Custom domain deployment"];
  return <section className="phase-two mt-5" aria-labelledby="phase-two-title"><div className="d-flex align-items-center gap-3 mb-3"><img src="/brand/embeera-mark.svg" alt="" width="52"/><div><p className="eyebrow mb-1">Coming soon</p><h2 id="phase-two-title" className="card-heading mb-0">Phase 2 Preview</h2></div></div><p>Phase 2 integrations are prepared for the next production stage. They are not active in this demo environment.</p><div className="phase-grid">{items.map(item => <div className="phase-card" key={item}><strong>{item}</strong><StatusBadge label="Coming soon" /></div>)}</div></section>;
}

function StatusBadge({ label }) { return <span className="status-badge">{label}</span>; }

function Login({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    location: "",
    user_type: "member",
    pin: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [busy, setBusy] = useState(false);
  const registeringRef = useRef(false);

  const finishLogin = (data) => {
    const payload = apiData(data);
    localStorage.setItem("embeera_token", payload.token);
    localStorage.setItem("embeera_user", JSON.stringify(payload.user));
    onLogin(payload.user, payload.token);
  };

  const resetMessage = () => {
    setMessage("");
    setMessageType("error");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetMessage();
  };

  const signIn = async () => {
    if (!phone) {
      setMessage("Phone number is required.");
      return;
    }

    if (!password) {
      setMessage("PIN/password is required.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiMessage(data, "Could not sign in."));
      finishLogin(data);
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const createAccount = async () => {
    if (registeringRef.current) return;

    const payload = {
      full_name: registerForm.full_name.trim(),
      phone_number: registerForm.phone_number.trim(),
      email: registerForm.email.trim() || null,
      location: registerForm.location.trim(),
      user_type: registerForm.user_type,
      password: registerForm.pin
    };

    if (!payload.full_name) {
      setMessageType("error");
      setMessage("Full name is required.");
      return;
    }

    if (!payload.phone_number) {
      setMessageType("error");
      setMessage("Phone number is required.");
      return;
    }

    if (!payload.location) {
      setMessageType("error");
      setMessage("Location is required.");
      return;
    }

    if (!["member", "ambassador"].includes(payload.user_type)) {
      setMessageType("error");
      setMessage("Select a valid role.");
      return;
    }

    if (!payload.password || payload.password.length < 6) {
      setMessageType("error");
      setMessage("PIN must contain at least 6 characters.");
      return;
    }

    registeringRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      await apiClient.post("/auth/register", payload);

      setPhone(payload.phone_number);
      setPassword("");
      setRegisterForm({ full_name: "", phone_number: "", email: "", location: "", user_type: "member", pin: "" });
      setMode("signin");
      setMessageType("success");
      setMessage("Account created successfully. You can now sign in with your phone number and PIN.");
    } catch (error) {
      setMessageType("error");
      const backendMessage = safeApiErrorMessage(error.response?.data?.message);
      setMessage(backendMessage || (error.request
        ? "Unable to connect to the server."
        : "The request could not be completed."));
    } finally {
      registeringRef.current = false;
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <img className="auth-logo" src="/brand/embeera-logo-light.svg" alt="Embeera Energy" />
          <h1>Save together. Switch to clean cooking.</h1>
          <p className="login-subtitle">Join an Oluganda Circle, contribute gradually, complete LPG safety lessons, and earn your Enkola Certificate when your circle is ready.</p>
          <img className="auth-hero" src="/images/clean-cooking-hero.svg" alt="A household using a clean LPG cooking stove" />
          <div className="login-highlights">
            <span>LPG transition</span>
            <span>Household savings</span>
            <span>Clean cooking journey</span>
          </div>
        </div>
        <Card className="login-card">
          <CardContent>
            <div className="login-card-heading">
              <p className="eyebrow mb-2">{mode === "signin" ? "Welcome back" : "Join a circle"}</p>
              <h2>{mode === "signin" ? "Sign in to Embeera Energy" : "Create your Embeera account"}</h2>
              <p>Your progress, savings records, and learning steps are linked to your phone number.</p>
            </div>
            <div className="auth-toggle mt-4" aria-label="Authentication options">
              <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>Sign In</button>
              <button type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>Create Account</button>
            </div>
            {mode === "signin" ? (
              <div className="form-stack mt-4">
                <TextField
                  label="Phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  helperText="Enter the phone number registered with your Embeera account."
                  size="small"
                  fullWidth
                />
                <TextField
                  label="PIN/password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  size="small"
                  fullWidth
                />
                <Button variant="contained" onClick={signIn} disabled={busy}>{busy ? "Signing in..." : "Sign in"}</Button>
              </div>
            ) : (
              <div className="form-stack mt-4">
                <TextField
                  label="Full name"
                  value={registerForm.full_name}
                  onChange={(event) => setRegisterForm({ ...registerForm, full_name: event.target.value })}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Phone number"
                  value={registerForm.phone_number}
                  onChange={(event) => setRegisterForm({ ...registerForm, phone_number: event.target.value })}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Email address"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                  helperText="Optional. Must be unique if provided."
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Location"
                  value={registerForm.location}
                  onChange={(event) => setRegisterForm({ ...registerForm, location: event.target.value })}
                  placeholder="Mukono"
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Role"
                  value={registerForm.user_type}
                  onChange={(event) => setRegisterForm({ ...registerForm, user_type: event.target.value })}
                  select
                  size="small"
                  fullWidth
                >
                  <MenuItem value="member">member</MenuItem>
                  <MenuItem value="ambassador">ambassador</MenuItem>
                </TextField>
                <TextField
                  label="Create a secure PIN"
                  value={registerForm.pin}
                  onChange={(event) => setRegisterForm({ ...registerForm, pin: event.target.value })}
                  type="password"
                  helperText="Minimum 6 characters."
                  size="small"
                  fullWidth
                />
                <Button variant="contained" onClick={createAccount} disabled={busy}>{busy ? "Creating..." : "Create account"}</Button>
                <p className="auth-helper">After creating your account, sign in with the same phone number and PIN.</p>
              </div>
            )}
            <Message text={message} type={messageType} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function CircleCard({ circle, selected, onSelect }) {
  return (
    <button type="button" className={`circle-option ${selected ? "selected" : ""}`} onClick={() => onSelect(circle.circle_id)}>
      <span>
        <strong>{circle.name}</strong>
        <small>{money(circle.total_saved)} saved of {money(circle.target_amount)} target</small>
      </span>
      <em>{circle.progress_percentage}%</em>
    </button>
  );
}

function MemberDashboard({ user, token }) {
  const [circles, setCircles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [certificateStatus, setCertificateStatus] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [newCircle, setNewCircle] = useState({ name: "Mukono LPG Mothers Circle", target_amount: "250000" });
  const [inviteCode, setInviteCode] = useState("");
  const [amount, setAmount] = useState("25000");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [deliveryForm, setDeliveryForm] = useState({ item_name: "LPG starter kit", delivery_location: user.location || "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [busyAction, setBusyAction] = useState("");

  const activeCircle = useMemo(
    () => circles.find((circle) => circle.circle_id === activeId) || circles[0],
    [activeId, circles]
  );

  const callApi = async (path, options = {}) => {
    const response = await request(path, {
      ...options,
      headers: { ...authHeaders(token), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(apiMessage(data, "Request failed."));
    return apiData(data);
  };

  const refresh = async () => {
    const [circleData, lessonData, deliveryData] = await Promise.all([
      callApi("/api/circles/my"),
      callApi("/api/lessons"),
      callApi("/api/deliveries/my")
    ]);
    setCircles(circleData.circles || []);
    setLessons(lessonData.lessons || []);
    setDeliveries(deliveryData.deliveries || []);
    const nextActive = activeId || circleData.circles?.[0]?.circle_id || null;
    setActiveId(nextActive);
    if (nextActive) {
      const status = await callApi(`/api/circles/${nextActive}/certificate/status`);
      setCertificateStatus(status.status || status);
    }
  };

  useEffect(() => {
    refresh().catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!activeId) {
      setCertificateStatus(null);
      return;
    }

    callApi(`/api/circles/${activeId}/certificate/status`)
      .then((status) => setCertificateStatus(status.status || status))
      .catch((error) => setMessage(error.message));
  }, [activeId]);

  const run = async (actionName, action, success, afterSuccess = null) => {
    if (busyAction) return;
    setBusyAction(actionName);
    setMessage("");
    try {
      await action();
      await refresh();
      if (afterSuccess) afterSuccess();
      setMessageType("success");
      setMessage(success);
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    } finally {
      setBusyAction("");
    }
  };

  const createCircle = () => run(
    "createCircle",
    () => callApi("/api/circles", {
      method: "POST",
      body: JSON.stringify(newCircle)
    }),
    "Circle created.",
    () => setNewCircle({ name: "", target_amount: "" })
  );

  const joinCircle = () => run(
    "joinCircle",
    () => callApi("/api/circles/join", {
      method: "POST",
      body: JSON.stringify({ invite_code: inviteCode })
    }),
    "Joined circle.",
    () => setInviteCode("")
  );

  const contribute = () => run(
    "contribute",
    () => callApi(`/api/circles/${activeCircle.circle_id}/contributions`, {
      method: "POST",
      body: JSON.stringify({ amount, method: paymentMethod })
    }),
    "Sandbox payment recorded"
  );

  const completeLesson = (lessonId) => run(
    `lesson-${lessonId}`,
    () => callApi(`/api/lessons/${lessonId}/complete`, { method: "POST" }),
    "Lesson marked complete."
  );

  const generateCertificate = () => run(
    "certificate",
    () => callApi(`/api/circles/${activeCircle.circle_id}/certificate/generate`, { method: "POST" }),
    "Certificate generated."
  );

  const requestDelivery = () => run(
    "delivery",
    () => callApi("/api/deliveries", {
      method: "POST",
      body: JSON.stringify({
        circle_id: activeCircle.circle_id,
        item_name: deliveryForm.item_name,
        delivery_location: deliveryForm.delivery_location
      })
    }),
    "LPG delivery request created.",
    () => setDeliveryForm({ item_name: "LPG starter kit", delivery_location: user.location || "" })
  );

  const completedCount = lessons.filter((lesson) => lesson.completed).length;
  const lessonPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <>
      <section className="dashboard-intro mb-4">
        <p className="section-kicker mb-2">Member dashboard</p>
        <h1>{user.full_name}'s Oluganda Circle workspace</h1>
        <p className="intro-copy mb-0">Create or join circles, record sandbox household savings, finish lessons, and check certificate readiness for the LPG transition.</p>
      </section>
      <Card className="profile-card mb-4"><CardContent>
        <p className="eyebrow mb-1">Member Profile</p>
        <div className="profile-grid">
          <span>Name</span><strong>{user.full_name}</strong>
          <span>Phone</span><strong>{user.phone_number}</strong>
          <span>Location</span><strong>{user.location || "Location not set"}</strong>
          <span>Journey</span><strong>Clean cooking journey</strong>
        </div>
      </CardContent></Card>
      <Message text={message} type={messageType} />
      <div className="row g-4 mt-1">
        <div className="col-lg-5">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">My Circles</p>
            <h2 className="card-heading mb-3">Oluganda Circle list</h2>
            <div className="circle-list">
              {circles.length === 0 && <Alert severity="info">No records yet.</Alert>}
              {circles.map((circle) => <CircleCard key={circle.circle_id} circle={circle} selected={activeCircle?.circle_id === circle.circle_id} onSelect={setActiveId} />)}
            </div>
          </CardContent></Card>
        </div>

        <div className="col-lg-7">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Circle Dashboard</p>
            <h2 className="card-heading mb-2">{activeCircle?.name || "No active circle"}</h2>
            {activeCircle && (
              <>
                <LinearProgress variant="determinate" value={activeCircle.progress_percentage} className="progress-bar" />
                <div className="row g-3 mt-3">
                  <div className="col-sm-4"><div className="metric-box"><span>Total saved</span><strong>{money(activeCircle.total_saved)}</strong></div></div>
                  <div className="col-sm-4"><div className="metric-box"><span>Target</span><strong>{money(activeCircle.target_amount)}</strong></div></div>
                  <div className="col-sm-4"><div className="metric-box"><span>Invite code</span><strong>{activeCircle.invite_code}</strong></div></div>
                </div>
                <div className="certificate-list mt-3">
                  {activeCircle.members.map((member) => (
                    <div className="certificate-row" key={member.user_id}>
                      <span>{member.full_name}</span>
                      <Chip label={money(member.contribution_total)} size="small" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent></Card>
        </div>

        <div className="col-lg-4">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Create Circle</p>
            <div className="form-stack">
              <TextField label="Circle name" value={newCircle.name} onChange={(event) => setNewCircle({ ...newCircle, name: event.target.value })} size="small" />
              <TextField label="Target amount UGX" value={newCircle.target_amount} onChange={(event) => setNewCircle({ ...newCircle, target_amount: event.target.value })} size="small" />
              <Button variant="contained" onClick={createCircle} disabled={Boolean(busyAction)}>
                {busyAction === "createCircle" ? "Creating..." : "Create"}
              </Button>
            </div>
          </CardContent></Card>
        </div>

        <div className="col-lg-4">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Join Circle</p>
            <div className="form-stack">
              <TextField label="Invite code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} size="small" />
              <Button variant="contained" onClick={joinCircle} disabled={Boolean(busyAction)}>
                {busyAction === "joinCircle" ? "Joining..." : "Join"}
              </Button>
            </div>
          </CardContent></Card>
        </div>

        <div className="col-lg-4">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Contribute</p>
            <p className="payment-note mb-2">Sandbox payment only. No real money moves.</p>
            <div className="form-stack">
              <TextField label="Amount UGX" value={amount} onChange={(event) => setAmount(event.target.value)} size="small" />
              <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} size="small">
                <MenuItem value="momo">MTN MoMo</MenuItem>
                <MenuItem value="airtel">Airtel Money</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
              <Button variant="contained" disabled={!activeCircle || Boolean(busyAction)} onClick={contribute}>
                {busyAction === "contribute" ? "Recording..." : "Save contribution"}
              </Button>
            </div>
          </CardContent></Card>
        </div>

        <div className="col-lg-6">
          <Card className="section-card h-100"><CardContent>
            <div className="d-flex justify-content-between mb-3">
              <div><p className="eyebrow mb-1">Transition Lessons</p><h2 className="card-heading mb-0">Clean LPG readiness</h2></div>
              <Chip label={`${completedCount}/${lessons.length} completed (${lessonPercent}%)`} />
            </div>
            <div className="topic-list">
              {lessons.length === 0 && <Alert severity="info">No records yet.</Alert>}
              {lessons.map((lesson) => (
                <button key={lesson.lesson_id} type="button" className={`topic-item ${lesson.completed ? "complete" : ""}`} disabled={Boolean(busyAction) || lesson.completed} onClick={() => completeLesson(lesson.lesson_id)}>
                  <span><strong>{lesson.title}</strong><small>{lesson.body}</small></span>
                  <Chip label={lesson.completed ? "Completed" : "Mark complete"} color={lesson.completed ? "success" : "default"} size="small" />
                </button>
              ))}
            </div>
          </CardContent></Card>
        </div>

        <div className="col-lg-6">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Enkola Certificate</p>
            <h2 className="card-heading mb-3">Certificate readiness</h2>
            <div className="certificate-list">
              <div className="certificate-row"><span>Savings target reached</span><Chip label={certificateStatus?.savings_ready ? "Done" : "Pending"} color={certificateStatus?.savings_ready ? "success" : "default"} /></div>
              <div className="certificate-row"><span>All members completed lessons</span><Chip label={certificateStatus?.lessons_ready ? "Done" : "Pending"} color={certificateStatus?.lessons_ready ? "success" : "default"} /></div>
              <div className="certificate-row"><span>Qualified</span><Chip label={certificateStatus?.qualified ? "Ready" : "Not ready"} color={certificateStatus?.qualified ? "success" : "default"} /></div>
            </div>
            {certificateStatus?.certificate ? (
              <div className="certificate-card mt-3">
                <strong>Enkola Certificate</strong>
                <p>{certificateStatus.certificate.summary_text}</p>
              </div>
            ) : (
              <Button className="mt-3" variant="contained" disabled={!activeCircle || Boolean(busyAction)} onClick={generateCertificate}>
                {busyAction === "certificate" ? "Checking..." : "Generate certificate"}
              </Button>
            )}
          </CardContent></Card>
        </div>

        <div className="col-lg-6">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">LPG Transition</p>
            <h2 className="card-heading mb-3">Delivery request</h2>
            <p className="payment-note mb-3">Available after the Enkola Certificate is issued.</p>
            <div className="form-stack">
              <TextField label="Item" value={deliveryForm.item_name} onChange={(event) => setDeliveryForm({ ...deliveryForm, item_name: event.target.value })} size="small" />
              <TextField label="Delivery location" value={deliveryForm.delivery_location} onChange={(event) => setDeliveryForm({ ...deliveryForm, delivery_location: event.target.value })} size="small" />
              <Button variant="contained" disabled={!activeCircle || Boolean(busyAction) || certificateStatus?.certificate?.certificate_status !== "issued"} onClick={requestDelivery}>
                {busyAction === "delivery" ? "Requesting..." : "Request LPG delivery"}
              </Button>
            </div>
          </CardContent></Card>
        </div>

        <div className="col-lg-6">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Delivery Status</p>
            <h2 className="card-heading mb-3">My requests</h2>
            <div className="certificate-list">
              {deliveries.length === 0 && <Alert severity="info">No records yet.</Alert>}
              {deliveries.map((delivery) => (
                <div className="certificate-row" key={delivery.delivery_id}>
                  <span>{delivery.item_name} - {delivery.circle_name}</span>
                  <Chip label={delivery.delivery_status} size="small" />
                </div>
              ))}
            </div>
          </CardContent></Card>
        </div>
      </div>
    </>
  );
}

function AmbassadorDashboard({ user, token }) {
  const [referrals, setReferrals] = useState([]);
  const [form, setForm] = useState({ full_name: "", phone_number: "", location: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [busy, setBusy] = useState(false);

  const callApi = async (path, options = {}) => {
    const response = await request(path, {
      ...options,
      headers: { ...authHeaders(token), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(apiMessage(data, "Request failed."));
    return apiData(data);
  };

  const refresh = async () => {
    const data = await callApi("/api/ambassador/referrals");
    setReferrals(data.referrals || []);
  };

  useEffect(() => {
    refresh().catch((error) => setMessage(error.message));
  }, []);

  const addReferral = async () => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await callApi("/api/ambassador/referrals", {
        method: "POST",
        body: JSON.stringify({ phone_number: form.phone_number })
      });
      await refresh();
      setForm({ full_name: "", phone_number: "", location: "" });
      setMessageType("success");
      setMessage("Referral saved.");
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="dashboard-intro mb-4">
        <p className="section-kicker mb-2">Ambassador dashboard</p>
        <h1>{user.full_name}'s referred households</h1>
        <p className="intro-copy mb-0">Support households in Mukono, Seeta, and Kampala through saving, transition lessons, and certificate readiness.</p>
      </section>
      <Message text={message} type={messageType} />
      <div className="row g-4 mt-1">
        <div className="col-lg-4">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Refer Household</p>
            <div className="form-stack">
              <TextField label="Household name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} size="small" helperText="Must match an existing member account." />
              <TextField label="Phone number" value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} size="small" />
              <TextField label="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} size="small" />
              <Button variant="contained" onClick={addReferral} disabled={busy}>{busy ? "Saving..." : "Save referral"}</Button>
            </div>
          </CardContent></Card>
        </div>
        <div className="col-lg-8">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Ambassador Referrals</p>
            <h2 className="card-heading mb-3">Household progress</h2>
            <div className="user-table">
              {referrals.map((referral) => (
                <div className="user-row" key={`${referral.referral_id}-${referral.circle_id || "none"}`}>
                  <strong>{referral.full_name}</strong>
                  <span>{referral.circle_name || "No circle yet"}</span>
                  <Chip label={`${referral.progress_percentage}%`} size="small" />
                  <span>{referral.transition_status || referral.referral_status}</span>
                </div>
              ))}
              {referrals.length === 0 && <Alert severity="info">No records yet.</Alert>}
            </div>
          </CardContent></Card>
        </div>
      </div>
    </>
  );
}

function AdminDashboard({ token }) {
  const [overview, setOverview] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    request("/api/admin/overview", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(apiMessage(data, "Could not load admin overview."));
        return apiData(data);
      })
      .then(setOverview)
      .catch((error) => setMessage(error.message || "Could not load admin overview."));
  }, [token]);

  const cards = [
    ["Total users", overview?.total_users ?? "-"],
    ["Total members", overview?.total_members ?? "-"],
    ["Total ambassadors", overview?.total_ambassadors ?? "-"],
    ["Total Oluganda Circles", overview?.total_circles ?? "-"],
    ["Total savings", money(overview?.total_savings)],
    ["Pending deliveries", overview?.pending_deliveries ?? "-"],
    ["Issued certificates", overview?.issued_certificates ?? "-"]
  ];

  return (
    <>
      <section className="dashboard-intro mb-4">
        <p className="section-kicker mb-2">Admin dashboard</p>
        <h1>Operations overview</h1>
      </section>
      <Message text={message} />
      <div className="row g-4">
        {cards.map(([label, value]) => (
          <div className="col-sm-6 col-xl-4" key={label}>
            <div className="admin-metric admin-metric-large"><strong>{value}</strong><span>{label}</span></div>
          </div>
        ))}
        <div className="col-12">
          <Card className="section-card"><CardContent>
            <p className="eyebrow mb-1">Recent Contributions</p>
            <div className="user-table">
              {(overview?.recent_contributions || []).map((contribution) => (
                <div className="user-row" key={contribution.contribution_id}>
                  <strong>{contribution.full_name}</strong>
                  <span>{contribution.circle_name}</span>
                  <Chip label={money(contribution.amount)} size="small" />
                  <span>{contribution.method}</span>
                </div>
              ))}
              {(overview?.recent_contributions || []).length === 0 && <Alert severity="info">No records yet.</Alert>}
            </div>
          </CardContent></Card>
        </div>
        <div className="col-lg-6">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Recent Users</p>
            <div className="user-table">
              {(overview?.recent_users || []).map((recentUser) => (
                <div className="user-row" key={recentUser.user_id}>
                  <strong>{recentUser.full_name}</strong>
                  <span>{recentUser.phone_number}</span>
                  <Chip label={roleLabel(recentUser.user_type)} size="small" />
                  <span>{recentUser.location || "No location"}</span>
                </div>
              ))}
              {(overview?.recent_users || []).length === 0 && <Alert severity="info">No records yet.</Alert>}
            </div>
          </CardContent></Card>
        </div>
        <div className="col-lg-6">
          <Card className="section-card h-100"><CardContent>
            <p className="eyebrow mb-1">Recent Referrals</p>
            <div className="user-table">
              {(overview?.recent_referrals || []).map((referral) => (
                <div className="user-row" key={referral.referral_id}>
                  <strong>{referral.ambassador_name}</strong>
                  <span>{referral.referred_name}</span>
                  <Chip label={referral.referral_status} size="small" />
                  <span>{referral.referred_phone_number}</span>
                </div>
              ))}
              {(overview?.recent_referrals || []).length === 0 && <Alert severity="info">No records yet.</Alert>}
            </div>
          </CardContent></Card>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("embeera_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("embeera_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      localStorage.removeItem("embeera_user");
      localStorage.removeItem("embeera_token");
      return null;
    }
  });
  const [checkingSession, setCheckingSession] = useState(Boolean(localStorage.getItem("embeera_token")));
  const [sessionMessage, setSessionMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("embeera_token");
    localStorage.removeItem("embeera_user");
    setToken(null);
    setUser(null);
    setCheckingSession(false);
  };

  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }

    let active = true;
    setCheckingSession(true);
    request("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(apiMessage(data, "Session expired. Please sign in again."));
        return apiData(data).user;
      })
      .then((freshUser) => {
        if (!active) return;
        localStorage.setItem("embeera_user", JSON.stringify(freshUser));
        setUser(freshUser);
        setSessionMessage("");
      })
      .catch((error) => {
        if (!active) return;
        localStorage.removeItem("embeera_token");
        localStorage.removeItem("embeera_user");
        setToken(null);
        setUser(null);
        setSessionMessage(error.message || "Session expired. Please sign in again.");
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (!user || !token) {
    return (
      <>
        <Login onLogin={(nextUser, nextToken) => { setUser(nextUser); setToken(nextToken); }} />
        {sessionMessage && <div className="session-banner"><Alert severity="warning">{sessionMessage}</Alert></div>}
      </>
    );
  }

  if (checkingSession) {
    return <main className="login-page"><Card className="login-card"><CardContent>Checking your Embeera Energy session...</CardContent></Card></main>;
  }

  const role = normalizedRole(user.role || user.user_type);
  const hasDashboard = ["admin", "member", "ambassador"].includes(role);

  return (
    <div className="app-shell">
      <nav className="navbar app-navbar">
        <div className="container-fluid app-container">
          <a className="navbar-brand" href="#dashboard"><img src="/brand/embeera-logo.svg" alt="Embeera Energy" /></a>
          <div className="d-flex align-items-center gap-2 ms-auto topbar-user">
            <Chip label={user.full_name} size="small" className="nav-chip" />
            <Chip label={roleLabel(role)} size="small" variant="outlined" />
            <Button variant="outlined" size="small" onClick={logout}>Logout</Button>
          </div>
        </div>
      </nav>
      <main id="dashboard" className="container-fluid app-container app-main py-4 py-lg-5">
        {role === "admin" && <AdminDashboard token={token} />}
        {role === "member" && <MemberDashboard user={user} token={token} />}
        {role === "ambassador" && <AmbassadorDashboard user={user} token={token} />}
        {!hasDashboard && (
          <Alert severity="error">
            This account does not have access to an Embeera Energy dashboard.
          </Alert>
        )}
        {hasDashboard && <PhaseTwoPreview />}
      </main>
    </div>
  );
}
