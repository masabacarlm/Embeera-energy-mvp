const db = require("../config/db");

const createMockPayment = async (req, res) => {
  const { user_id, group_id, amount, payment_method } = req.body;

  if (!user_id || !group_id || !amount || !payment_method) {
    return res.status(400).json({
      message: "user_id, group_id, amount, and payment_method are required"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Record the mock mobile money payment.
    const [paymentResult] = await connection.execute(
      `INSERT INTO savings_transactions
       (user_id, group_id, amount, payment_method, transaction_status)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, group_id, amount, payment_method, "successful"]
    );

    // Keep the group's saved amount in sync with successful payments.
    await connection.execute(
      `UPDATE oluganda_groups
       SET current_amount = current_amount + ?
       WHERE group_id = ?`,
      [amount, group_id]
    );

    await connection.commit();

    res.status(201).json({
      message: "Mock payment successful",
      payment_status: "successful",
      payment: {
        transaction_id: paymentResult.insertId,
        user_id,
        group_id,
        amount,
        payment_method
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Mock payment error:", error);
    res.status(500).json({ message: "Could not save mock payment" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createMockPayment
};
