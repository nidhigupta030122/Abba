const errorHandler = (error, req, res, next) => {
  let errStatus = error.status || 500;
  let errMessage = error.message || "something went wrong";

  res
    .status(errStatus)
    .send({ status: false, message: errMessage, stack: error.stack });
};

module.exports = errorHandler;
