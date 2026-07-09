require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const orderRoutes = require("./routes/orderRoutes");
const { connectDb } = require("./db");
const { initRabbit } = require("./utils/services");


const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());


app.get("/health", (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  res.status(mongoOk ? 200 : 503).json({
    status: mongoOk ? "ok" : "degraded",
    mongo: mongoOk ? "connected" : "disconnected"
  });
});


app.use("/", orderRoutes);

const startServer = async () => {
  try {
    await connectDb();
    await initRabbit();
    app.listen(port, () => {
      console.log(`Order service running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect order-service components", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
