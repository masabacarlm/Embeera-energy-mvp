const getUserRewards = (req, res) => {
  res.json({
    user_id: req.params.user_id,
    reward_points: 120,
    certificate_status: "In Progress"
  });
};

module.exports = {
  getUserRewards
};
