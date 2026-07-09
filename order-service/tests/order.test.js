const request = require("supertest");
const mongoose = require("mongoose");
const axios = require("axios");

process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/order_test";

const { app } = require("../server");
const { connectDb } = require("../db");
const { Order } = require("../models/orderModel");

jest.mock("axios");

describe("Order service", () => {
  beforeAll(async () => {
    await connectDb();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("creates an outbound order successfully", async () => {
    axios.get.mockResolvedValue({
      data: {
        products: [
          {
            id: "prod123",
            name: "Test Product",
            price: 10,
            quantity: 20,
            imageUrl: ""
          }
        ]
      }
    });

    axios.put.mockResolvedValue({});

    const response = await request(app)
      .post("/orders")
      .set("x-user-id", "user123")
      .set("x-user-role", "Staff")
      .send({
        productId: "prod123",
        quantity: 5,
        type: "Outbound"
      })
      .expect(201);

    expect(response.body.order.productId).toBe("prod123");
    expect(response.body.order.productName).toBe("Test Product");
    expect(response.body.order.quantity).toBe(5);
    expect(response.body.order.type).toBe("Outbound");
    expect(response.body.order.status).toBe("Completed");

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining("/products/prod123"),
      expect.objectContaining({ quantity: 15 }),
      expect.any(Object)
    );
  });

  it("returns error on insufficient stock", async () => {
    axios.get.mockResolvedValue({
      data: {
        products: [
          {
            id: "prod123",
            name: "Test Product",
            price: 10,
            quantity: 3,
            imageUrl: ""
          }
        ]
      }
    });

    const response = await request(app)
      .post("/orders")
      .send({
        productId: "prod123",
        quantity: 5,
        type: "Outbound"
      })
      .expect(400);

    expect(response.body.message).toContain("insufficient stock");
  });
});
