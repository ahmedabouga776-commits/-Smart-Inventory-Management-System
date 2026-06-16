require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { connectDb } = require("./db");
const { ensureDefaultAccount } = require("./models/userModel");

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/", authRoutes);

const startServer = async () => {
  try {
    await connectDb();
    await ensureDefaultAccount({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });

    app.listen(port, () => {
      console.log(`Auth service running on port ${port}`);
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
