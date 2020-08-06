const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cocktailsRoutes = require("./routes/cocktails-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error").default;

const app = express();

app.use(bodyParser.json());

// app.use('/uploads/images', express.static(path.join('uploads', 'images'))

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// app.use("/api/cocktails", cocktailsRoutes);
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
    fs.unline(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unkwno error occured." });
});

app.listen(5000);

// shell: mongo "mongodb+srv://cluster0.jjujd.mongodb.net/<dbname>" --username wony
// wony - zloTOjUvfAgqUuIO
// compass - mongodb+srv://wony:<password>@cluster0.jjujd.mongodb.net/test

mongoose
  .connect(
    `mongodb+srv://wony:<password>@cluster0.jjujd.mongodb.net/test
  `
  )
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
