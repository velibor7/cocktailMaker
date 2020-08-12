const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cocktailsRoutes = require("./routes/cocktails-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  // req.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.use("/api/cocktails", cocktailsRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError(
    "We can't give you what you are looking for",
    404
  );
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    console.log("ovde sam");
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." });
});

// UBaIP5ESYxckdTjJ

mongoose
  .connect(
    "mongodb+srv://wony:UBaIP5ESYxckdTjJ@cluster0.d46ew.mongodb.net/test?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("successfully connected to db");
    app.listen(5000);
  })
  .catch((err) => {
    console.log("failed to connect to db");
    console.log(err);
  });
