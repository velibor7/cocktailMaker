const fs = require("fs");
const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Cocktail = require("../models/cocktail");
const User = require("../models/user");

const getCocktails = async (req, res, next) => {
  let cocktails;

  try {
    cocktails = await Cocktail.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching cocktails failed, try again later.",
      500
    );

    return next(error);
  }
  res.json({
    cocktails: cocktails.map((cocktail) =>
      cocktail.toObject({ getters: true })
    ),
  });
};

const getCocktailById = async (req, res, next) => {
  const cocktailId = req.params.cid;

  console.log(cocktailId);

  let cocktail;
  try {
    console.log("TRYIN");
    cocktail = await Cocktail.findById(cocktailId);
  } catch (err) {
    const error = new HttpError("Could not find a cocktail", 500);

    return next(error);
  }

  if (!cocktail) {
    const error = new HttpError("Could not find cocktail", 404);
    return next(error);
  }

  res.json({ cocktail: cocktail.toObject({ getters: true }) });
};

const getCocktailsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);

  let userWithCocktails;

  try {
    userWithCocktails = await User.findById(userId).populate("cocktails");
    console.log(userWithCocktails);
  } catch (err) {
    const error = new HttpError("Fetching failed, please try again", 500);
    console.log(err);
    return next(error);
  }

  if (!userWithCocktails || userWithCocktails.cocktails.length === 0) {
    return next(
      new HttpError("Could not find cocktails for this user id", 404)
    );
  }

  res.json({
    cocktails: userWithCocktails.cocktails.map((cocktail) =>
      cocktail.toObject({ getters: true })
    ),
  });
};

const createCocktail = async (req, res, next) => {
  // console.log("trying to create a cocktail...");
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid inputs, check data.", 422));
  }

  const { title, description } = req.body;
  console.log(req.file);
  console.log(req.file.path);

  const createdCocktail = new Cocktail({
    title,
    description,
    image: req.file.path,
    creator: req.userData.userId,
  });

  console.log(createdCocktail);

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating cocktail failed, try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for this id", 404);
    next(error);
  }

  // console.log("user: " + user);

  try {
    Cocktail.createCollection();
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCocktail.save({ session: sess });
    console.log("idkkkk");
    user.cocktails.push(createdCocktail);
    await user.save({ session: sess });
    await sess.commitTransaction();
    // console.log("idk");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating cocktail failed in session, try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ cocktail: createdCocktail });
};

const updateCocktail = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs, check your data", 422));
  }
  const { title, description } = req.body;
  const cocktailId = req.params.cid;

  let cocktail;
  try {
    cocktail = await Cocktail.findById(cocktailId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update cocktail",
      500
    );

    return next(error);
  }

  if (cocktail.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to edit this cocktail.",
      401
    );
    return next(error);
  }

  cocktail.title = title;
  cocktail.description = description;

  try {
    await cocktail.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update cocktail",
      500
    );

    return next(error);
  }
  res.status(200).json({ cocktail: cocktail.toObject({ getters: true }) });
};

const deleteCocktail = async (req, res, next) => {
  const cocktailId = req.params.cid;
  console.log(cocktailId);

  let cocktail;
  try {
    cocktail = await Cocktail.findById(cocktailId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete cocktail.",
      500
    );
    return next(error);
  }

  if (!cocktail) {
    const error = new HttpError("Could not find cocktail for this id.", 404);
    return next(error);
  }

  if (cocktail.creator.id !== req.userData.userId) {
    const error = new HttpError("You are not allowed to delete this.", 401);
    return next(error);
  }

  const imagePath = cocktail.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await cocktail.remove({ session: sess });
    cocktail.creator.cocktails.pull(cocktail);
    await cocktail.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete cocktail",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Cocktail deleted." });
};

exports.getCocktails = getCocktails;
exports.getCocktailById = getCocktailById;
exports.getCocktailsByUserId = getCocktailsByUserId;
exports.createCocktail = createCocktail;
exports.updateCocktail = updateCocktail;
exports.deleteCocktail = deleteCocktail;
