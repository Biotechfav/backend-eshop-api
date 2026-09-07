const express = require("express");
const { body } = require("express-validator");
const { list, getById, create } = require("../controllers/productController");
const { validate } = require("../middlewares/validate");

const router = express.Router();

router.get("/", list);
router.get("/:id", getById);

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("El nombre es requerido"),
    body("price").isFloat({ gt: 0 }).withMessage("El precio debe ser mayor a 0"),
    body("stock").isInt({ min: 0 }).withMessage("El stock debe ser un entero >= 0"),
    body("categoryId").isInt().withMessage("categoryId inválido"),
  ],
  validate,
  create
);

module.exports = router;