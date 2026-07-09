require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");


const app = express();
const port = process.env.PORT || 8080;

const JWT_SECRET = process.env.JWT_SECRET || "smart-inventory-secret";

const authTarget = process.env.AUTH_SERVICE_URL || "http://auth-service:4001";
const productTarget = process.env.PRODUCT_SERVICE_URL || "http://product-service:4002";
const orderTarget = process.env.ORDER_SERVICE_URL || "http://order-service:4003";
const supplierTarget = process.env.SUPPLIER_SERVICE_URL || "http://supplier-service:4004";
const notificationTarget = process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:4005";

app.use(cors());

// Public health and metrics endpoints
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});



// Authentication middleware for proxy requests
const authenticateToken = (req, res, next) => {
  // Allow auth endpoints to pass without token checks
  if (req.path.startsWith("/auth/login") || req.path.startsWith("/auth/register")) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// Helper to inject user context headers to target microservices
const addHeadersToProxyReq = (proxyReq, req, res) => {
  if (req.user) {
    proxyReq.setHeader("x-user-id", req.user.id);
    proxyReq.setHeader("x-user-role", req.user.role || "Staff");
  }
};

// Apply auth to all endpoints except auth login/register
app.use(authenticateToken);

// Auth Service proxy (no check headers needed on user creation, but auth details can be forwarded)
app.use(
  "/auth",
  createProxyMiddleware({
    target: authTarget,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" }
  })
);

// Product Service proxy
app.use(
  "/products",
  createProxyMiddleware({
    target: productTarget,
    changeOrigin: true,
    onProxyReq: addHeadersToProxyReq
  })
);

// Order Service proxy
app.use(
  "/orders",
  createProxyMiddleware({
    target: orderTarget,
    changeOrigin: true,
    onProxyReq: addHeadersToProxyReq
  })
);

// Supplier/Procurement Service proxy
app.use(
  "/suppliers",
  createProxyMiddleware({
    target: supplierTarget,
    changeOrigin: true,
    onProxyReq: addHeadersToProxyReq
  })
);

app.use(
  "/procurement",
  createProxyMiddleware({
    target: supplierTarget,
    changeOrigin: true,
    onProxyReq: addHeadersToProxyReq
  })
);

// Notification/Alerts Service proxy
app.use(
  "/alerts",
  createProxyMiddleware({
    target: notificationTarget,
    changeOrigin: true,
    onProxyReq: addHeadersToProxyReq
  })
);

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
