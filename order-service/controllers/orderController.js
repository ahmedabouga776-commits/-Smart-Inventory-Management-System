const axios = require("axios");
const { Order } = require("../models/orderModel");
const { publishEvent } = require("../utils/services");

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:4002";

// Create a new order
const createOrder = async (req, res) => {
  const { productId, quantity, type } = req.body;
  const userId = req.headers["x-user-id"] || "unknown";
  const userRole = req.headers["x-user-role"] || "Staff";

  if (!productId || !quantity || !type) {
    return res.status(400).json({ message: "productId, quantity, and type are required" });
  }

  const orderQty = Number(quantity);
  if (!Number.isInteger(orderQty) || orderQty <= 0) {
    return res.status(400).json({ message: "quantity must be a positive integer" });
  }

  if (!["Inbound", "Outbound"].includes(type)) {
    return res.status(400).json({ message: "type must be Inbound or Outbound" });
  }

  try {
    // 1. Fetch products list from Product Service to find the target product
    // (Bypasses API gateway, so we must send auth header context)
    const productsRes = await axios.get(`${PRODUCT_SERVICE_URL}/products`, {
      headers: { "x-user-role": "Admin", "x-user-id": "system-order" }
    });

    const products = productsRes.data.products || [];
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    let newQuantity = product.quantity;

    if (type === "Outbound") {
      if (product.quantity < orderQty) {
        return res.status(400).json({ message: `insufficient stock. Available: ${product.quantity}` });
      }
      newQuantity = product.quantity - orderQty;
    } else {
      // Inbound Order
      newQuantity = product.quantity + orderQty;
    }

    // 2. Update stock in Product Service
    await axios.put(
      `${PRODUCT_SERVICE_URL}/products/${productId}`,
      {
        name: product.name,
        price: product.price,
        quantity: newQuantity,
        imageUrl: product.imageUrl
      },
      {
        headers: { "x-user-role": "Admin", "x-user-id": "system-order" }
      }
    );

    // 3. Save order to local DB
    const order = await Order.create({
      productId,
      productName: product.name,
      quantity: orderQty,
      price: product.price,
      type,
      status: "Completed", // Immediate completion for standard workflow
      userId
    });

    // 4. Publish Event
    await publishEvent("order-queue", {
      orderId: order._id,
      productId,
      productName: product.name,
      quantity: orderQty,
      price: product.price,
      type,
      userId,
      timestamp: new Date()
    });

    return res.status(201).json({ order });
  } catch (error) {
    console.error("Create order failed:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        message: `failed to create order due to Product Service error: ${error.response.data?.message || error.message}`
      });
    }
    return res.status(500).json({ message: "failed to create order" });
  }
};

// Retrieve all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    console.error("Get orders failed:", error.message);
    return res.status(500).json({ message: "failed to fetch orders" });
  }
};

module.exports = { createOrder, getOrders };
