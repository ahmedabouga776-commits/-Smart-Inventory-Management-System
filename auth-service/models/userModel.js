const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["Admin", "Manager", "Staff"], default: "Staff" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

// Pre-save hook to hash password automatically before saving
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

const Account = mongoose.model("Account", accountSchema);

const createUser = async ({ name, email, password, role = "Staff" }) => {
  const user = await Account.create({ name, email, password, role });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

const findUserByEmailAndPassword = async ({ email, password }) => {
  const user = await Account.findOne({ email });
  if (!user) {
    return null;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
};

const ensureDefaultAccount = async ({ name, email, password }) => {
  if (!email || !password || !name) {
    return null;
  }

  const existing = await Account.findOne({ email }).select("_id");
  if (existing) {
    return null;
  }

  const user = new Account({ name, email, password, role: "Admin" });
  await user.save();
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

module.exports = { createUser, findUserByEmailAndPassword, ensureDefaultAccount, Account };
