const requestDelivery = (req, res) => {
  res.json({
    message: "LPG delivery request created",
    delivery_status: "Pending",
    data: req.body
  });
};

module.exports = {
  requestDelivery
};
