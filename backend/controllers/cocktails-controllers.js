const fs = require("fs");
const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Cocktail = require("../models/cocktail");
const User = require("../models/user");
const { update } = require("../models/user");

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

  let userWithCocktails;

  try {
    userWithCocktails = await User.findById(userId).populate("cocktails");
  } catch (err) {
    const error = new HttpError("Fetching failed, please try again", 500);
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, check data.", 422));
  }

  const { title, description, creator } = req.body;

  const createdCocktail = new Cocktail({
    title,
    description,
    image: "www.some-link.com/image.jpg",
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating cocktail failed, try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for this id", 404);
    next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCocktail.save({ session: sess });
    user.cocktails.push(createdCocktail);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating cocktail failed, try again.", 500);
    return next(error);
  }

  res.status(201).json({ cocktail: createdCocktail });
};

const updateCocktail = async (req, res, next) => {
  const errors = validationResult(req);
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

  let cocktail;
  try {
    cocktail = await (await Cocktail.findById(cocktailId)).populate("creator");
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

  res.status(200).json({ message: "Cocktail deleted." });
};

exports.getCocktails = getCocktails;
exports.getCocktailById = getCocktailById;
exports.getCocktailsByUserId = getCocktailsByUserId;
exports.createCocktail = createCocktail;
exports.updateCocktail = updateCocktail;
exports.deleteCocktail = deleteCocktail;
