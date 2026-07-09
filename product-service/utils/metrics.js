const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

// ── Inventory stock gauge ─────────────────────────────────────────────────────
// Tracks current quantity per product. Updated after every list/create/update.
// Used by Prometheus alerts (low-stock / out-of-stock) and Grafana dashboard.
const productStockGauge = new client.Gauge({
  name: "inventory_product_quantity",
  help: "Current stock quantity for each product",
  labelNames: ["product_name"],
  registers: [register]
});

/**
 * Refreshes the inventory gauge with the latest product quantities.
 * @param {Array<{name: string, quantity: number}>} products
 */
const refreshStockGauge = (products) => {
  // Reset all existing label sets so deleted products disappear
  productStockGauge.reset();
  for (const p of products) {
    productStockGauge.set({ product_name: p.name }, p.quantity);
  }
};

const metricsMiddleware = (req, res, next) => {
  if (req.path === "/metrics" || req.path === "/health") {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path || req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };

    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });

  next();
};

const metricsHandler = async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
};

module.exports = { metricsMiddleware, metricsHandler, register, refreshStockGauge };
