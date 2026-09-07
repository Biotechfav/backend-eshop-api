const express = require("express");
const { body } = require("express-validator");
const { addItem, listCart, updateQuantity, removeItem } = require("../controllers/cartController");
const protect = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");

const router = express.Router();

router.use(protect);

router.get("/", listCart);

router.post(
  "/",
  [
    body("productId").isInt().withMessage("productId inválido"),
    body("quantity").isInt({ min: 1 }).withMessage("La cantidad debe ser >= 1"),
  ],
  validate,
  addItem
);

router.put(
  "/items/:id",
  [body("quantity").isInt({ min: 1 }).withMessage("La cantidad debe ser >= 1")],
  validate,
  updateQuantity
);

router.delete("/items/:id", removeItem);

module.exports = router;