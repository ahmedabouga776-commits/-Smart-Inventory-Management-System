const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

const insertProduct = async ({ name, price, quantity, imageUrl }) => {
  const product = await Product.create({ name, price, quantity, imageUrl });
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    imageUrl: product.imageUrl || ""
  };
};

const listProducts = async () => {
  const products = await Product.find().sort({ createdAt: -1 });
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    imageUrl: product.imageUrl || ""
  }));
};

const updateProductById = async ({ id, name, price, quantity, imageUrl }) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { name, price, quantity, imageUrl },
    { new: true, runValidators: true }
  );

  return product
    ? {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        imageUrl: product.imageUrl || ""
      }
    : null;
};

const deleteProductById = async ({ id }) => {
  const product = await Product.findByIdAndDelete(id);
  return product
    ? {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        imageUrl: product.imageUrl || ""
      }
    : null;
};

module.exports = { insertProduct, listProducts, updateProductById, deleteProductById, Product };
