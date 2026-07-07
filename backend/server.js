const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Embeera Energy Backend is running");
});

app.post("/api/users/register", (req, res) => {
  res.json({
    message: "User registered successfully",
    user: req.body
  });
});

app.post("/api/groups/join", (req, res) => {
  res.json({
    message: "User joined Oluganda Circle successfully",
    data: req.body
  });
});

app.post("/api/payments/mock", (req, res) => {
  res.json({
    message: "Mock payment successful",
    payment_status: "successful",
    data: req.body
  });
});

app.get("/api/savings/progress/:user_id", (req, res) => {
  res.json({
    user_id: req.params.user_id,
    amount_saved: 80000,
    savings_target: 250000,
    progress_percentage: 32,
    remaining_amount: 170000
  });
});

app.get("/api/rewards/:user_id", (req, res) => {
  res.json({
    user_id: req.params.user_id,
    reward_points: 120,
    certificate_status: "In Progress"
  });
});

app.post("/api/deliveries/request", (req, res) => {
  res.json({
    message: "LPG delivery request created",
    delivery_status: "Pending",
    data: req.body
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Embeera Energy backend running on port ${PORT}`);
});
