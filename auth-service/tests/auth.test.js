const request = require("supertest");
const mongoose = require("mongoose");

process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/auth_test";

const { app } = require("../server");
const { connectDb } = require("../db");
const { Account } = require("../models/userModel");

describe("Auth service", () => {
  beforeAll(async () => {
    await connectDb();
  });

  beforeEach(async () => {
    await Account.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("registers a new user", async () => {
    const response = await request(app)
      .post("/register")
      .send({ name: "Test User", email: "test@example.com", password: "pass123" })
      .expect(201);

    expect(response.body.user.email).toBe("test@example.com");
  });

  it("logs in an existing user", async () => {
    await Account.create({ name: "Test User", email: "login@example.com", password: "pass123" });

    const response = await request(app)
      .post("/login")
      .send({ email: "login@example.com", password: "pass123" })
      .expect(200);

    expect(response.body.user.email).toBe("login@example.com");
  });
});
