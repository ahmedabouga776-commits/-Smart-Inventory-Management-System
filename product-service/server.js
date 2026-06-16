require("dotenv").config();

const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const { connectDb } = require("./db");

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/", productRoutes);

const startServer = async () => {
  try {
    await connectDb();
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
