const errorHandler = (error, req, res, next) => {
  console.log(error.message);
  console.log(error.status);
  const statusCode = error.status >= 400 ? error.status : 500;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
};

module.exports = errorHandler;
