const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    supplierName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Draft", "Pending", "Approved", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = { PurchaseOrder };
