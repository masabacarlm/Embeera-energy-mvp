const joinGroup = (req, res) => {
  res.json({
    message: "User joined Oluganda Circle successfully",
    data: req.body
  });
};

module.exports = {
  joinGroup
};
