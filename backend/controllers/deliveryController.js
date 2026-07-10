const db = require("../config/db");
const { fail, ok } = require("../utils/apiResponse");

const DELIVERY_STATUSES = ["pending", "scheduled", "delivered", "cancelled"];
const toPositiveId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

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
  const circleId = toPositiveId(req.body.circle_id);
  const itemName = String(req.body.item_name || "LPG starter kit").trim();
  const deliveryLocation = String(req.body.delivery_location || req.user.location || "").trim();

  if (!circleId || !itemName || !deliveryLocation) {
    return fail(res, 400, "Circle, item, and delivery location are required.");
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
      return fail(res, 403, "Join this Oluganda Circle before requesting LPG delivery.");
    }

    if (!(await hasIssuedCertificate(circleId))) {
      return fail(res, 400, "LPG delivery is available after the Enkola Certificate is issued.");
    }

    const [activeRows] = await db.execute(
      `SELECT delivery_id
       FROM delivery_requests
       WHERE user_id = ? AND circle_id = ? AND delivery_status IN ('pending','scheduled')
       LIMIT 1`,
      [req.user.user_id, circleId]
    );
    if (activeRows.length > 0) {
      return fail(res, 409, "You already have an active delivery request for this circle.");
    }

    const [result] = await db.execute(
      `INSERT INTO delivery_requests (user_id, circle_id, item_name, delivery_status, delivery_location)
       VALUES (?, ?, ?, 'pending', ?)`,
      [req.user.user_id, circleId, itemName, deliveryLocation]
    );

    ok(res, "LPG delivery request created.", {
      delivery: {
        delivery_id: result.insertId,
        user_id: req.user.user_id,
        circle_id: circleId,
        item_name: itemName,
        delivery_status: "pending",
        delivery_location: deliveryLocation
      }
    }, 201);
  } catch (error) {
    console.error("Delivery request error:", error);
    fail(res, 500, "Could not create delivery request.");
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
    ok(res, "Delivery requests loaded.", { deliveries: rows });
  } catch (error) {
    console.error("My deliveries error:", error);
    fail(res, 500, "Could not load delivery requests.");
  }
};

const getAllDeliveries = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT dr.*, u.full_name, u.phone_number, c.name AS circle_name
       FROM delivery_requests dr
       JOIN users u ON u.user_id = dr.user_id
       JOIN circles c ON c.circle_id = dr.circle_id
       ORDER BY dr.created_at DESC`
    );
    ok(res, "Delivery requests loaded.", { deliveries: rows });
  } catch (error) {
    console.error("All deliveries error:", error);
    fail(res, 500, "Could not load delivery requests.");
  }
};

const updateDeliveryStatus = async (req, res) => {
  const deliveryId = toPositiveId(req.params.deliveryId);
  const deliveryStatus = String(req.body.delivery_status || "").trim().toLowerCase();

  if (!deliveryId) return fail(res, 400, "Valid delivery ID is required.");
  if (!DELIVERY_STATUSES.includes(deliveryStatus)) {
    return fail(res, 400, "Delivery status must be pending, scheduled, delivered, or cancelled.");
  }

  try {
    const [rows] = await db.execute(
      `SELECT delivery_id FROM delivery_requests WHERE delivery_id = ? LIMIT 1`,
      [deliveryId]
    );
    if (rows.length === 0) return fail(res, 404, "Delivery request not found.");

    await db.execute(
      `UPDATE delivery_requests
       SET delivery_status = ?, delivered_at = CASE WHEN ? = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END
       WHERE delivery_id = ?`,
      [deliveryStatus, deliveryStatus, deliveryId]
    );

    ok(res, "Delivery status updated.", { delivery_id: deliveryId, delivery_status: deliveryStatus });
  } catch (error) {
    console.error("Update delivery status error:", error);
    fail(res, 500, "Could not update delivery status.");
  }
};

module.exports = {
  getAllDeliveries,
  getMyDeliveries,
  requestDelivery,
  updateDeliveryStatus
};
