const express = require("express");
const { createOrder, getOrders } = require("../controllers/orderController");

const router = express.Router();

router.post("/orders", createOrder);
router.get("/orders", getOrders);

module.exports = router;
