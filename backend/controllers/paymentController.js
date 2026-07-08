const db = require("../config/db");

const createMockPayment = async (req, res) => {
  const { user_id, group_id, amount, payment_method } = req.body;
  const paymentAmount = Number(amount);

  if (!user_id || !group_id || !amount || !payment_method) {
    return res.status(400).json({
      message: "user_id, group_id, amount, and payment_method are required"
    });
  }

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({
      message: "amount must be greater than 0"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [membershipRows] = await connection.execute(
      `SELECT member_id
       FROM group_members
       WHERE user_id = ? AND group_id = ? AND member_status = 'active'
       LIMIT 1`,
      [user_id, group_id]
    );

    if (membershipRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Join this Oluganda Circle before saving money"
      });
    }

    // Record the mock mobile money payment.
    const [paymentResult] = await connection.execute(
      `INSERT INTO savings_transactions
       (user_id, group_id, amount, payment_method, transaction_status)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, group_id, paymentAmount, payment_method, "successful"]
    );

    // Keep the group's saved amount in sync with successful payments.
    await connection.execute(
      `UPDATE oluganda_groups
       SET current_amount = current_amount + ?
       WHERE group_id = ?`,
      [paymentAmount, group_id]
    );

    await connection.commit();

    res.status(201).json({
      message: "Mock payment successful",
      payment_status: "successful",
      payment: {
        transaction_id: paymentResult.insertId,
        user_id,
        group_id,
        amount: paymentAmount,
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
