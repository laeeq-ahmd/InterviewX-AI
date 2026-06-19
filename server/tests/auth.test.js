// tests/auth.test.js — Integration tests for auth routes
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("POST /api/auth/google", () => {
  it("should return 500 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({ email: "test@example.com" }); // missing required 'name'
    expect([400, 500]).toContain(res.statusCode);
  });

  it("should return 500 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({ name: "Test User" }); // missing required 'email'
    expect([400, 500]).toContain(res.statusCode);
  });
});
