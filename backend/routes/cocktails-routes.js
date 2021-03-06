const express = require("express");
const { check } = require("express-validator");

const cocktailControllers = require("../controllers/cocktails-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("", cocktailControllers.getCocktails);

router.get("/:cid", cocktailControllers.getCocktailById);

router.get("/user/:uid", cocktailControllers.getCocktailsByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [check("title").not().isEmpty(), check("description").isLength({ min: 6 })],
  cocktailControllers.createCocktail
);

router.patch(
  "/:cid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  cocktailControllers.updateCocktail
);

router.delete("/:cid", cocktailControllers.deleteCocktail);

module.exports = router;
