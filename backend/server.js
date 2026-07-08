const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const learningRoutes = require("./routes/learningRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Embeera Energy Backend is running");
});

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/learning", learningRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Embeera Energy backend running on port ${PORT}`);
});
