const db = require("../config/db");

const requestDelivery = async (req, res) => {
  const { user_id, group_id, item_name, delivery_location } = req.body;

  if (!user_id || !group_id || !item_name || !delivery_location) {
    return res.status(400).json({
      message: "user_id, group_id, item_name, and delivery_location are required"
    });
  }

  try {
    // Store a new LPG delivery request for later tracking.
    const [result] = await db.execute(
      `INSERT INTO deliveries
       (user_id, group_id, item_name, delivery_status, delivery_location)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, group_id, item_name, "Pending", delivery_location]
    );

    res.status(201).json({
      message: "LPG delivery request created",
      delivery_status: "Pending",
      delivery: {
        delivery_id: result.insertId,
        user_id,
        group_id,
        item_name,
        delivery_location
      }
    });
  } catch (error) {
    console.error("Delivery request error:", error);
    res.status(500).json({ message: "Could not create delivery request" });
  }
};

module.exports = {
  requestDelivery
};
