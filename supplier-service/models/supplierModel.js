const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    contactName: { type: String, default: "" },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    suppliedCategory: { type: String, default: "General" }
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

// Seed basic default suppliers if collection is empty
const seedDefaultSuppliers = async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count === 0) {
      await Supplier.create([
        {
          name: "Global Tech Supplies",
          contactName: "John Doe",
          email: "tech@globalsupplies.com",
          phone: "+1-555-0199",
          rating: 5,
          suppliedCategory: "Electronics"
        },
        {
          name: "Office Express Ltd",
          contactName: "Sarah Connor",
          email: "sales@officeexpress.com",
          phone: "+1-555-0144",
          rating: 4,
          suppliedCategory: "Office Supplies"
        },
        {
          name: "Apex Logistics & Goods",
          contactName: "Mike Tyson",
          email: "goods@apexlogistics.com",
          phone: "+1-555-0122",
          rating: 4,
          suppliedCategory: "General"
        }
      ]);
      console.log("Seeded default suppliers successfully");
    }
  } catch (error) {
    console.error("Failed to seed default suppliers", error);
  }
};

module.exports = { Supplier, seedDefaultSuppliers };
