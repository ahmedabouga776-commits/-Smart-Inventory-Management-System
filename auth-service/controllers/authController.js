const jwt = require("jsonwebtoken");
const { createUser, findUserByEmailAndPassword } = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "smart-inventory-secret";

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  try {
    const user = await createUser({ name, email, password, role });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    return res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "email already exists" });
    }

    return res.status(500).json({ message: "registration failed" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await findUserByEmailAndPassword({ email, password });

    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: "login failed" });
  }
};

module.exports = { registerUser, loginUser };
