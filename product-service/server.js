require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const { connectDb } = require("./db");
const { initRedis, initRabbit } = require("./utils/services");
const { metricsMiddleware, metricsHandler, refreshStockGauge } = require("./utils/metrics");
const { listProducts } = require("./models/productModel");

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.get("/health", (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  res.status(mongoOk ? 200 : 503).json({
    status: mongoOk ? "ok" : "degraded",
    mongo: mongoOk ? "connected" : "disconnected"
  });
});

app.get("/metrics", metricsHandler);

app.use("/", productRoutes);

const startServer = async () => {
  try {
    await connectDb();
    await initRedis();
    await initRabbit();

    // Seed the Prometheus inventory gauge immediately so Prometheus
    // has real data on the very first scrape after a pod restart.
    try {
      refreshStockGauge(await listProducts());
      console.log("Prometheus inventory gauge seeded on startup");
    } catch (e) {
      console.warn("Initial gauge seed failed:", e.message);
    }

    // Keep the gauge fresh even when there is no API traffic.
    setInterval(async () => {
      try { refreshStockGauge(await listProducts()); } catch (_) {}
    }, 60_000);

    app.listen(port, () => {
      console.log(`Product service running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
