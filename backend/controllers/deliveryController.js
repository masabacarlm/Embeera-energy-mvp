const db = require("../config/db");

const hasIssuedCertificate = async (circleId) => {
  const [rows] = await db.execute(
    `SELECT certificate_id
     FROM certificates
     WHERE circle_id = ? AND certificate_status = 'issued'
     LIMIT 1`,
    [circleId]
  );
  return rows.length > 0;
};

const requestDelivery = async (req, res) => {
  const circleId = Number(req.body.circle_id);
  const itemName = String(req.body.item_name || "LPG starter kit").trim();
  const deliveryLocation = String(req.body.delivery_location || req.user.location || "").trim();

  if (!circleId || !itemName || !deliveryLocation) {
    return res.status(400).json({ message: "Circle, item, and delivery location are required." });
  }

  try {
    const [membershipRows] = await db.execute(
      `SELECT circle_member_id
       FROM circle_members
       WHERE user_id = ? AND circle_id = ? AND member_status = 'active'
       LIMIT 1`,
      [req.user.user_id, circleId]
    );

    if (membershipRows.length === 0) {
      return res.status(400).json({ message: "Join this Oluganda Circle before requesting LPG delivery." });
    }

    if (!(await hasIssuedCertificate(circleId))) {
      return res.status(400).json({ message: "LPG delivery is available after the Enkola Certificate is issued." });
    }

    const [result] = await db.execute(
      `INSERT INTO delivery_requests (user_id, circle_id, item_name, delivery_status, delivery_location)
       VALUES (?, ?, ?, 'pending', ?)`,
      [req.user.user_id, circleId, itemName, deliveryLocation]
    );

    res.status(201).json({
      message: "LPG delivery request created.",
      delivery: {
        delivery_id: result.insertId,
        user_id: req.user.user_id,
        circle_id: circleId,
        item_name: itemName,
        delivery_status: "pending",
        delivery_location: deliveryLocation
      }
    });
  } catch (error) {
    console.error("Delivery request error:", error);
    res.status(500).json({ message: "Could not create delivery request." });
  }
};

const getMyDeliveries = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT dr.*, c.name AS circle_name
       FROM delivery_requests dr
       JOIN circles c ON c.circle_id = dr.circle_id
       WHERE dr.user_id = ?
       ORDER BY dr.created_at DESC`,
      [req.user.user_id]
    );
    res.json({ deliveries: rows });
  } catch (error) {
    console.error("My deliveries error:", error);
    res.status(500).json({ message: "Could not load delivery requests." });
  }
};

module.exports = {
  getMyDeliveries,
  requestDelivery
};
