require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 8080;

const authTarget = process.env.AUTH_SERVICE_URL || "http://auth-service:4001";
const productTarget = process.env.PRODUCT_SERVICE_URL || "http://product-service:4002";

app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/auth",
  createProxyMiddleware({
    target: authTarget,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" }
  })
);

app.use(
  "/products",
  createProxyMiddleware({
    target: productTarget,
    changeOrigin: true
  })
);

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
