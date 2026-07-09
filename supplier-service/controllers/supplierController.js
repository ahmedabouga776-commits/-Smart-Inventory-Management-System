const axios = require("axios");
const { Supplier } = require("../models/supplierModel");
const { PurchaseOrder } = require("../models/purchaseOrderModel");

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://order-service:4003";

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    return res.json({ suppliers });
  } catch (error) {
    console.error("Get suppliers failed:", error.message);
    return res.status(500).json({ message: "failed to fetch suppliers" });
  }
};

const createSupplier = async (req, res) => {
  const { name, contactName, email, phone, rating, suppliedCategory } = req.body;
  if (!name) {
    return res.status(400).json({ message: "supplier name is required" });
  }
  try {
    const supplier = await Supplier.create({
      name,
      contactName,
      email,
      phone,
      rating: Number(rating) || 5,
      suppliedCategory: suppliedCategory || "General"
    });
    return res.status(201).json({ supplier });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "supplier name already exists" });
    }
    console.error("Create supplier failed:", error.message);
    return res.status(500).json({ message: "failed to create supplier" });
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    console.error("Get POs failed:", error.message);
    return res.status(500).json({ message: "failed to fetch purchase orders" });
  }
};

const updatePurchaseOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Approved", "Completed", "Cancelled"].includes(status)) {
    return res.status(400).json({ message: "invalid status value" });
  }

  try {
    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ message: "purchase order not found" });
    }

    const previousStatus = po.status;
    po.status = status;
    await po.save();

    // Restock stock in product service if transition is to Completed
    if (status === "Completed" && previousStatus !== "Completed") {
      try {
        await axios.post(
          `${ORDER_SERVICE_URL}/`,
          {
            productId: po.productId,
            quantity: po.quantity,
            type: "Inbound"
          },
          {
            headers: { "x-user-role": "Admin", "x-user-id": "procurement-system" }
          }
        );
        console.log(`Replenished stock of product ${po.productName} via Order Service Inbound call`);
      } catch (err) {
        console.error("Failed to replenishment stock on PO completion:", err.message);
      }
    }

    return res.json({ purchaseOrder: po });
  } catch (error) {
    console.error("Update PO status failed:", error.message);
    return res.status(500).json({ message: "failed to update purchase order status" });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  updatePurchaseOrderStatus
};
