const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authotization.split(" ")[1];
    if (!token) {
      throw new Error("Auth failed");
    }
    const decodedToken = jwt.verify(token, "secret_code");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Auth Failed!", 403);
    return next(error);
  }
};
