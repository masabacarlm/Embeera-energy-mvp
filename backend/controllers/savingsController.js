const getSavingsProgress = (req, res) => {
  res.json({
    user_id: req.params.user_id,
    amount_saved: 80000,
    savings_target: 250000,
    progress_percentage: 32,
    remaining_amount: 170000
  });
};

module.exports = {
  getSavingsProgress
};
