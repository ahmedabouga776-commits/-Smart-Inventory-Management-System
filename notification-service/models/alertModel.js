const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Low Stock", "Order Activity", "Procurement"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

const Alert = mongoose.model("Alert", alertSchema);

module.exports = { Alert };
