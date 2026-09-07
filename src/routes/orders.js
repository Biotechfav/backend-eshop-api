const express = require("express");
const { checkout, listOrders, getOrder } = require("../controllers/orderController");
const protect = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

router.post("/checkout", checkout);
router.get("/", listOrders);
router.get("/:id", getOrder);

module.exports = router;