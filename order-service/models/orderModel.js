const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["Inbound", "Outbound"], required: true },
    status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Pending" },
    userId: { type: String, required: true },
    userEmail: { type: String, default: "" }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
