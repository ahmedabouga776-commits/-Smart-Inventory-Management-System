const express = require("express");
const {
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  updatePurchaseOrderStatus
} = require("../controllers/supplierController");

const router = express.Router();

router.get("/suppliers", getSuppliers);
router.post("/suppliers", createSupplier);
router.get("/procurement/orders", getPurchaseOrders);
router.put("/procurement/orders/:id", updatePurchaseOrderStatus);

module.exports = router;
