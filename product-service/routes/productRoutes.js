const express = require("express");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

// Role checking middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (!role) {
      return res.status(401).json({ message: "Access denied. Role not provided." });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
    }
    next();
  };
};

router.post("/products", checkRole(["Admin", "Manager"]), createProduct);
router.get("/products", checkRole(["Admin", "Manager", "Staff"]), getProducts);
router.put("/products/:id", checkRole(["Admin", "Manager"]), updateProduct);
router.delete("/products/:id", checkRole(["Admin", "Manager"]), deleteProduct);

module.exports = router;
