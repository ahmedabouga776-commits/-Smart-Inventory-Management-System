require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const supplierRoutes = require("./routes/supplierRoutes");
const { connectDb } = require("./db");
const { seedDefaultSuppliers } = require("./models/supplierModel");
const { initRabbit } = require("./utils/services");


const app = express();
const port = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());


app.get("/health", (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  res.status(mongoOk ? 200 : 503).json({
    status: mongoOk ? "ok" : "degraded",
    mongo: mongoOk ? "connected" : "disconnected"
  });
});


app.use("/", supplierRoutes);

const startServer = async () => {
  try {
    await connectDb();
    await seedDefaultSuppliers();
    await initRabbit();
    app.listen(port, () => {
      console.log(`Supplier & Procurement service running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect supplier-service components", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
