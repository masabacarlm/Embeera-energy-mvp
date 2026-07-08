const db = require("../config/db");

const requestDelivery = async (req, res) => {
  const { user_id, group_id, item_name, delivery_location } = req.body;

  if (!user_id || !group_id || !item_name || !delivery_location) {
    return res.status(400).json({
      message: "user_id, group_id, item_name, and delivery_location are required"
    });
  }

  try {
    const [membershipRows] = await db.execute(
      `SELECT member_id
       FROM group_members
       WHERE user_id = ? AND group_id = ? AND member_status = 'active'
       LIMIT 1`,
      [user_id, group_id]
    );

    if (membershipRows.length === 0) {
      return res.status(400).json({
        message: "Join this Oluganda Circle before requesting delivery"
      });
    }

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
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "User or group does not exist"
      });
    }

    console.error("Delivery request error:", error);
    res.status(500).json({ message: "Could not create delivery request" });
  }
};

module.exports = {
  requestDelivery
};
