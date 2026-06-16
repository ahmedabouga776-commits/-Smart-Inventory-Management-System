const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const Account = mongoose.model("Account", accountSchema);

const createUser = async ({ name, email, password }) => {
  const user = await Account.create({ name, email, password });
  return { id: user.id, name: user.name, email: user.email };
};

const findUserByEmailAndPassword = async ({ email, password }) => {
  const user = await Account.findOne({ email, password }).select("name email");
  return user ? { id: user.id, name: user.name, email: user.email } : null;
};

const ensureDefaultAccount = async ({ name, email, password }) => {
  if (!email || !password || !name) {
    return null;
  }

  const existing = await Account.findOne({ email }).select("_id");
  if (existing) {
    return null;
  }

  const user = await Account.create({ name, email, password });
  return { id: user.id, name: user.name, email: user.email };
};

module.exports = { createUser, findUserByEmailAndPassword, ensureDefaultAccount, Account };
