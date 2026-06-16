const {
  insertProduct,
  listProducts,
  updateProductById,
  deleteProductById
} = require("../models/productModel");

const createProduct = async (req, res) => {
  const { name, price, quantity, imageUrl } = req.body;
  const normalizedPrice = Number(price);
  const normalizedQuantity = Number(quantity);
  const normalizedImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({ message: "price must be a non-negative number" });
  }

  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity < 0) {
    return res.status(400).json({ message: "quantity must be a non-negative number" });
  }

  try {
    const product = await insertProduct({
      name,
      price: normalizedPrice,
      quantity: normalizedQuantity,
      imageUrl: normalizedImageUrl
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error("Create product failed", error);
    return res.status(500).json({ message: "failed to add product" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await listProducts();
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: "failed to fetch products" });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, imageUrl } = req.body;
  const normalizedPrice = Number(price);
  const normalizedQuantity = Number(quantity);
  const normalizedImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({ message: "price must be a non-negative number" });
  }

  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity < 0) {
    return res.status(400).json({ message: "quantity must be a non-negative number" });
  }

  try {
    const product = await updateProductById({
      id,
      name,
      price: normalizedPrice,
      quantity: normalizedQuantity,
      imageUrl: normalizedImageUrl
    });

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.json({ product });
  } catch (error) {
    console.error("Update product failed", error);
    return res.status(500).json({ message: "failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await deleteProductById({ id });

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.json({ product });
  } catch (error) {
    console.error("Delete product failed", error);
    return res.status(500).json({ message: "failed to delete product" });
  }
};

module.exports = { createProduct, getProducts, updateProduct, deleteProduct };
