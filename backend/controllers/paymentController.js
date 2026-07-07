const createMockPayment = (req, res) => {
  res.json({
    message: "Mock payment successful",
    payment_status: "successful",
    data: req.body
  });
};

module.exports = {
  createMockPayment
};
