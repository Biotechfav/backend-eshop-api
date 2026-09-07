const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const { validate } = require("../middlewares/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("El nombre es requerido"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  validate,
  login
);

module.exports = router;