const ok = (res, message, data = {}, status = 200) =>
  res.status(status).json({
    success: true,
    message,
    data
  });

const fail = (res, status, message, errors = []) =>
  res.status(status).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });

module.exports = {
  fail,
  ok
};
