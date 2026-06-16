const request = require("supertest");
const mongoose = require("mongoose");

process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/product_test";

const { app } = require("../server");
const { connectDb } = require("../db");
const { Product } = require("../models/productModel");

describe("Product service", () => {
  beforeAll(async () => {
    await connectDb();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("creates a product", async () => {
    const response = await request(app)
      .post("/products")
      .send({ name: "Widget", price: 9.99, quantity: 5, imageUrl: "https://example.com/item.png" })
      .expect(201);

    expect(response.body.product.name).toBe("Widget");
  });

  it("lists products", async () => {
    await Product.create({ name: "Item", price: 4.5, quantity: 2, imageUrl: "" });

    const response = await request(app).get("/products").expect(200);
    expect(response.body.products.length).toBe(1);
  });
});
