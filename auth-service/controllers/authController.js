const { createUser, findUserByEmailAndPassword } = require("../models/userModel");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  try {
    const user = await createUser({ name, email, password });
    return res.status(201).json({ user });
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

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "login failed" });
  }
};

module.exports = { registerUser, loginUser };
