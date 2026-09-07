const express = require("express");
const { body } = require("express-validator");
const {
  list,
  create,
} = require("../controllers/categoryController");
const { validate } = require("../middlewares/validate");

const router = express.Router();

router.get("/", list);

router.post(
  "/",
  [body("name").notEmpty().withMessage("El nombre es requerido")],
  validate,
  create
);

module.exports = router;