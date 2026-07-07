const registerUser = (req, res) => {
  res.json({
    message: "User registered successfully",
    user: req.body
  });
};

module.exports = {
  registerUser
};
