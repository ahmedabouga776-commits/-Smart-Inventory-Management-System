const {
  insertProduct,
  listProducts,
  updateProductById,
  deleteProductById
} = require("../models/productModel");
const { getRedisClient, publishEvent } = require("../utils/services");
const { refreshStockGauge } = require("../utils/metrics");

const CACHE_KEY = "products_list";

const clearCache = async () => {
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      await redisClient.del(CACHE_KEY);
      console.log("Redis cache invalidated");
    } catch (error) {
      console.error("Failed to invalidate Redis cache:", error.message);
    }
  }
};

const checkAndPublishLowStock = async (product) => {
  if (product && product.quantity <= 5) {
    await publishEvent("low-stock-queue", {
      productId: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      timestamp: new Date()
    });
  }
};

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

    await clearCache();
    await checkAndPublishLowStock(product);

    // Refresh Prometheus gauge with full product list
    try { refreshStockGauge(await listProducts()); } catch (_) {}

    return res.status(201).json({ product });
  } catch (error) {
    console.error("Create product failed", error);
    return res.status(500).json({ message: "failed to add product" });
  }
};

const getProducts = async (req, res) => {
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      const cachedProducts = await redisClient.get(CACHE_KEY);
      if (cachedProducts) {
        console.log("Returning products list from Redis cache");
        return res.json({ products: JSON.parse(cachedProducts) });
      }
    } catch (error) {
      console.error("Redis get failed:", error.message);
    }
  }

  try {
    const products = await listProducts();
    if (redisClient) {
      try {
        await redisClient.set(CACHE_KEY, JSON.stringify(products), { EX: 3600 });
        console.log("Cached products list in Redis");
      } catch (error) {
        console.error("Redis set failed:", error.message);
      }
    }
    // Refresh gauge from DB (cache may be stale for Prometheus)
    try { refreshStockGauge(products); } catch (_) {}
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

    await clearCache();
    await checkAndPublishLowStock(product);

    // Refresh Prometheus gauge with full product list
    try { refreshStockGauge(await listProducts()); } catch (_) {}

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

    await clearCache();

    // Refresh Prometheus gauge with full product list after deletion
    try { refreshStockGauge(await listProducts()); } catch (_) {}

    return res.json({ product });
  } catch (error) {
    console.error("Delete product failed", error);
    return res.status(500).json({ message: "failed to delete product" });
  }
};

module.exports = { createProduct, getProducts, updateProduct, deleteProduct };
